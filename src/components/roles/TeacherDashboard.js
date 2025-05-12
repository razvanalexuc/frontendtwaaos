import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './TeacherDashboard.css';

const TeacherDashboard = ({ user }) => {
  const [examProposals, setExamProposals] = useState([]);
  const [approvedExams, setApprovedExams] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('proposals');

  // Încărcăm datele de la backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Începem încărcarea datelor pentru cadrul didactic...');
        
        // Obținem propunerile de examen pentru profesor - încercăm mai multe căi posibile pentru date
        let proposalsResponse;
        try {
          proposalsResponse = await api.teacher.getExamProposals();
          console.log('Răspuns propuneri examene:', proposalsResponse);
        } catch (error) {
          console.error('Eroare la obținerea propunerilor prin API-ul de profesor:', error);
          proposalsResponse = { data: [] };
        }
        
        // Procesăm datele - verificăm toate locațiile posibile pentru propuneri
        const proposals = proposalsResponse?.proposals || proposalsResponse?.data || proposalsResponse;
        
        if (proposals && Array.isArray(proposals)) {
          console.log(`Am găsit ${proposals.length} propuneri de examene`);
          setExamProposals(proposals);
        } else {
          console.log('Nu am găsit propuneri de examene în formatul așteptat, încercăm metode alternative');
          
          // Încercăm să obținem propunerile direct de la API-ul de cursuri
          try {
            const coursesResponse = await api.courses.getCourses();
            console.log('Răspuns de la API-ul de cursuri:', coursesResponse);
            
            const courses = coursesResponse?.data || coursesResponse;
            if (courses && Array.isArray(courses)) {
              // Filtrăm doar cursurile care au propuneri de examen în așteptare
              const coursesWithProposals = courses.filter(course => 
                course.proposed_date && (course.status === 'pending' || !course.status)
              );
              
              console.log(`Am găsit ${coursesWithProposals.length} cursuri cu propuneri de examen`);
              setExamProposals(coursesWithProposals);
            }
          } catch (courseError) {
            console.error('Eroare la obținerea cursurilor:', courseError);
          }
          
          // Încercăm și API-ul de examene ca ultimă soluție
          try {
            const fallbackResponse = await api.exams.getExams({ status: 'pending' });
            console.log('Răspuns alternativ pentru propuneri de la API-ul de examene:', fallbackResponse);
            
            const fallbackProposals = fallbackResponse?.exams || fallbackResponse?.data || [];
            if (fallbackProposals && Array.isArray(fallbackProposals) && fallbackProposals.length > 0) {
              console.log(`Am găsit ${fallbackProposals.length} propuneri alternative`);
              setExamProposals(fallbackProposals);
            }
          } catch (examError) {
            console.error('Eroare la obținerea examenelor:', examError);
          }
          
          // Dacă tot nu am găsit nimic, setăm o listă goală
          if (examProposals.length === 0) {
            console.log('Nu am putut găsi propuneri prin nicio metodă');
            setExamProposals([]);
          }
        }
        
        // Obținem examenele aprobate
        const approvedResponse = await api.teacher.getApprovedExams();
        if (approvedResponse && approvedResponse.exams) {
          setApprovedExams(approvedResponse.exams);
        }
        
        // Obținem sălile disponibile
        const roomsResponse = await api.teacher.getAvailableRooms();
        if (roomsResponse && roomsResponse.rooms) {
          setAvailableRooms(roomsResponse.rooms);
        }
        
        // Obținem lista de asistenți disponibili
        const assistantsResponse = await api.teacher.getAvailableAssistants();
        if (assistantsResponse && assistantsResponse.assistants) {
          setAssistants(assistantsResponse.assistants);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        setError('A apărut o eroare la încărcarea datelor. Vă rugăm să încercați din nou mai târziu.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleApproveProposal = async (id) => {
    try {
      // Obținem detaliile sălii și duratei examenului
      const roomId = prompt('Introduceți ID-ul sălii pentru examen:');
      const examDuration = prompt('Introduceți durata examenului (în ore):', '2');
      
      if (!roomId || !examDuration) {
        alert('Trebuie să specificați sala și durata examenului pentru aprobare.');
        return;
      }
      
      // Trimitem cererea de aprobare la backend folosind API-ul de cursuri
      const response = await api.courses.approveExamProposal(id, {
        exam_room_id: parseInt(roomId),
        exam_duration: parseInt(examDuration)
      });
      
      if (response && response.status === 'success') {
        // Actualizăm starea locală
        const proposal = examProposals.find(p => p.id === id);
        if (proposal) {
          const approvedProposal = {
            ...proposal,
            status: 'approved',
            room: roomId,
            startTime: '',
            endTime: '',
            assistants: []
          };
          
          setApprovedExams([...approvedExams, approvedProposal]);
          setExamProposals(examProposals.filter(p => p.id !== id));
          
          // Comutăm la tab-ul de examene aprobate
          setActiveTab('approved');
          
          alert(`Propunerea pentru ${proposal.examType === 'examen' ? 'examenul' : 'colocviul'} de ${proposal.disciplineName} a fost aprobată. Șeful de grupă a fost notificat.`);
        }
      } else {
        throw new Error(response?.message || 'Nu s-a putut aproba propunerea de examen.');
      }
    } catch (error) {
      console.error('Error approving proposal:', error);
      alert(`Eroare la aprobarea propunerii: ${error.message}`);
    }
  };

  const handleRejectProposal = async (id) => {
    const reason = prompt('Introduceți motivul respingerii:');
    if (reason !== null && reason.trim() !== '') {
      try {
        // Trimitem cererea de respingere la backend folosind API-ul de cursuri
        const response = await api.courses.rejectExamProposal(id, { 
          rejection_reason: reason 
        });
        
        if (response && response.status === 'success') {
          // Actualizăm starea locală
          setExamProposals(examProposals.map(proposal => 
            proposal.id === id ? { ...proposal, status: 'rejected', rejectionReason: reason } : proposal
          ));
          
          alert('Propunerea a fost respinsă și șeful de grupă a fost notificat.');
        } else {
          throw new Error(response?.message || 'Nu s-a putut respinge propunerea de examen.');
        }
      } catch (error) {
        console.error('Error rejecting proposal:', error);
        alert(`Eroare la respingerea propunerii: ${error.message}`);
      }
    } else if (reason !== null) {
      alert('Vă rugăm să introduceți un motiv pentru respingere.');
    }
  };

  const handleRoomChange = (examId, roomId) => {
    setApprovedExams(approvedExams.map(exam => 
      exam.id === examId ? { ...exam, room: availableRooms.find(r => r.id === parseInt(roomId))?.name || '' } : exam
    ));
  };

  const handleTimeChange = (examId, field, value) => {
    setApprovedExams(approvedExams.map(exam => 
      exam.id === examId ? { ...exam, [field]: value } : exam
    ));
  };

  const handleAssistantToggle = (examId, assistantName) => {
    setApprovedExams(approvedExams.map(exam => {
      if (exam.id === examId) {
        const assistants = [...exam.assistants];
        if (assistants.includes(assistantName)) {
          return { ...exam, assistants: assistants.filter(a => a !== assistantName) };
        } else {
          return { ...exam, assistants: [...assistants, assistantName] };
        }
      }
      return exam;
    }));
  };

  const handleSaveExamDetails = async (id) => {
    try {
      const exam = approvedExams.find(e => e.id === id);
      
      if (!exam.room || !exam.startTime || !exam.endTime) {
        alert('Vă rugăm să completați toate detaliile examenului.');
        return;
      }
      
      // Trimitem detaliile actualizate la backend
      const examDetails = {
        room_id: availableRooms.find(r => r.name === exam.room)?.id,
        start_time: exam.startTime,
        end_time: exam.endTime,
        assistants: exam.assistants
      };
      
      const response = await api.teacher.updateExamDetails(id, examDetails);
      
      if (response && response.success) {
        alert(`Detaliile pentru examenul de ${exam.disciplineName} au fost salvate.`);
      } else {
        throw new Error('Nu s-au putut salva detaliile examenului.');
      }
    } catch (error) {
      console.error('Error saving exam details:', error);
      alert(`Eroare la salvarea detaliilor examenului: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Se încarcă datele...</div>;
  }

  if (error) {
    return <div className="error">Eroare: {error}</div>;
  }

  return (
    <div className="teacher-dashboard">
      <h2>Panou Cadru Didactic</h2>
      <p>Bine ați venit, {user?.name || 'Profesor'}! Aici puteți gestiona propunerile de examene și colocvii.</p>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          Propuneri în așteptare {examProposals.length > 0 && <span className="badge">{examProposals.length}</span>}
        </button>
        <button 
          className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Examene aprobate
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'proposals' && (
          <div className="proposals-container">
            <h3>Propuneri de examene/colocvii de la șefii de grupă</h3>
            
            {/* Buton de debug pentru a verifica datele */}
            <button 
              onClick={() => {
                console.log('Propuneri de examene în stare:', examProposals);
                alert(`Există ${examProposals.length} propuneri de examene în sistem.`);
              }}
              style={{ marginBottom: '10px', padding: '5px 10px', fontSize: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Debug Propuneri
            </button>
            
            {examProposals.length === 0 ? (
              <div className="no-data-container">
                <p className="no-data">Nu există propuneri de examene în așteptare.</p>
                <p className="help-text">Propunerile vor apărea aici după ce șefii de grupă trimit date pentru examene.</p>
              </div>
            ) : (
              <table className="proposals-table">
                <thead>
                  <tr>
                    <th>Disciplină</th>
                    <th>Tip</th>
                    <th>Grupă</th>
                    <th>Șef grupă</th>
                    <th>Dată propusă</th>
                    <th>Status</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {examProposals.map(proposal => {
                    // Extragem informațiile din propunere - gestionăm diferite formate posibile
                    const id = proposal.id || proposal.course_id || proposal.discipline_id;
                    const disciplineName = proposal.disciplineName || proposal.name || proposal.course?.name || 'Disciplină necunoscută';
                    const examType = proposal.examType || proposal.exam_type || 'examen';
                    const group = proposal.group || proposal.group_name || '';
                    const year = proposal.year || proposal.year_of_study || '';
                    const groupLeader = proposal.groupLeader || (proposal.group_leader ? `${proposal.group_leader.first_name} ${proposal.group_leader.last_name}` : 'Necunoscut');
                    const proposedDate = proposal.proposedDate || proposal.date || proposal.proposed_date || '';
                    const status = proposal.status || 'pending';
                    
                    // Formăm data pentru afișare
                    let formattedDate = proposedDate;
                    if (proposedDate) {
                      try {
                        const date = new Date(proposedDate);
                        if (!isNaN(date.getTime())) {
                          formattedDate = date.toLocaleDateString('ro-RO') + ' ' + date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
                        }
                      } catch (e) {
                        console.error('Eroare la formatarea datei:', e);
                      }
                    }
                    
                    return (
                      <tr key={id} className={`proposal-row ${status}`}>
                        <td>{disciplineName}</td>
                        <td>{examType === 'examen' || examType === 'exam' ? 'Examen' : examType === 'colocviu' || examType === 'colloquium' ? 'Colocviu' : examType}</td>
                        <td>{group}{year ? ` (Anul ${year})` : ''}</td>
                        <td>{groupLeader}</td>
                        <td>{formattedDate || 'Dată nespecificată'}</td>
                        <td>
                          <span className={`status-badge ${status}`}>
                            {status === 'pending' ? 'În așteptare' : 
                             status === 'approved' ? 'Aprobat' : 
                             status === 'rejected' ? 'Respins' : status}
                          </span>
                        </td>
                        <td className="actions">
                          {status === 'pending' && (
                            <>
                              <button 
                                className="approve-button"
                                onClick={() => handleApproveProposal(id)}
                              >
                                Aprobă
                              </button>
                              <button 
                                className="reject-button"
                                onClick={() => handleRejectProposal(id)}
                              >
                                Respinge
                              </button>
                            </>
                          )}
                          {status === 'approved' && (
                            <span className="approved-text">Aprobat</span>
                          )}
                          {status === 'rejected' && (
                            <span className="rejected-text">Respins</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {activeTab === 'approved' && (
          <div className="approved-container">
            <h3>Examene și colocvii aprobate</h3>
            {approvedExams.length === 0 ? (
              <p className="no-data">Nu există examene aprobate.</p>
            ) : (
              <div className="approved-exams">
                {approvedExams.map(exam => (
                  <div key={exam.id} className="exam-card">
                    <div className="exam-header">
                      <h4>{exam.disciplineName}</h4>
                      <span className="exam-type">{exam.examType === 'examen' ? 'Examen' : 'Colocviu'}</span>
                    </div>
                    
                    <div className="exam-details">
                      <p><strong>Grupă:</strong> {exam.group} (Anul {exam.year})</p>
                      <p><strong>Șef grupă:</strong> {exam.groupLeader}</p>
                      <p><strong>Dată:</strong> {exam.proposedDate}</p>
                    </div>
                    
                    <div className="exam-config">
                      <h5>Configurare examen</h5>
                      
                      <div className="form-group">
                        <label>Sală:</label>
                        <select 
                          value={availableRooms.find(r => r.name === exam.room)?.id || ''}
                          onChange={(e) => handleRoomChange(exam.id, e.target.value)}
                        >
                          <option value="">Selectați sala</option>
                          {availableRooms.map(room => (
                            <option key={room.id} value={room.id}>
                              {room.name} (Capacitate: {room.capacity})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Ora de început:</label>
                          <input 
                            type="time" 
                            value={exam.startTime}
                            onChange={(e) => handleTimeChange(exam.id, 'startTime', e.target.value)}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Ora de sfârșit:</label>
                          <input 
                            type="time" 
                            value={exam.endTime}
                            onChange={(e) => handleTimeChange(exam.id, 'endTime', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Asistenți:</label>
                        <div className="assistants-list">
                          {assistants.map(assistant => (
                            <div key={assistant.id} className="assistant-item">
                              <label>
                                <input 
                                  type="checkbox"
                                  checked={exam.assistants.includes(assistant.name)}
                                  onChange={() => handleAssistantToggle(exam.id, assistant.name)}
                                />
                                {assistant.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        className="save-button"
                        onClick={() => handleSaveExamDetails(exam.id)}
                      >
                        Salvează
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
