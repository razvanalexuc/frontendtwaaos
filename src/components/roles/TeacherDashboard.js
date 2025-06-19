import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './TeacherDashboard.css';
import Select from 'react-select';

const TeacherDashboard = ({ user }) => {
  // Date hardcodate pentru propuneri de examene
  const mockExamProposals = [
    {
      id: 1,
      name: 'Programare Orientată pe Obiecte',
      code: 'C1001',
      group_name: '3201A',
      study_program: 'Calculatoare',
      year_of_study: 3,
      exam_type: 'exam',
      proposed_date: '2025-06-15T10:00:00',
      status: 'pending',
      group_leader: 'Student Test',
      teacher: {
        name: 'Prof. Dr. Ionescu Maria',
        email: 'teacher.test@usm.ro'
      }
    },
    {
      id: 2,
      name: 'Structuri de Date și Algoritmi',
      code: 'C1002',
      group_name: '3201A',
      study_program: 'Calculatoare',
      year_of_study: 3,
      exam_type: 'exam',
      proposed_date: '2025-06-18T12:00:00',
      status: 'pending',
      group_leader: 'Student Test',
      teacher: {
        name: 'Prof. Dr. Ionescu Maria',
        email: 'teacher.test@usm.ro'
      }
    },
    {
      id: 3,
      name: 'Inteligență Artificială',
      code: 'C1006',
      group_name: '3401A',
      study_program: 'Calculatoare',
      year_of_study: 3,
      exam_type: 'colloquium',
      proposed_date: '2025-06-20T14:00:00',
      status: 'pending',
      group_leader: 'Student Test',
      teacher: {
        name: 'Prof. Dr. Ionescu Maria',
        email: 'teacher.test@usm.ro'
      }
    },
    {
      id: 4,
      name: 'Arhitectura Calculatoarelor',
      code: 'C1007',
      group_name: '3401A',
      study_program: 'Calculatoare',
      year_of_study: 3,
      exam_type: 'exam',
      proposed_date: '2025-06-22T09:00:00',
      status: 'pending',
      group_leader: 'Student Test',
      teacher: {
        name: 'Prof. Dr. Ionescu Maria',
        email: 'teacher.test@usm.ro'
      }
    },
    {
      id: 5,
      name: 'Sisteme de Operare',
      code: 'C1008',
      group_name: '3201B',
      study_program: 'Calculatoare',
      year_of_study: 3,
      exam_type: 'exam',
      proposed_date: '2025-06-25T10:00:00',
      status: 'pending',
      group_leader: 'Student Test',
      teacher: {
        name: 'Prof. Dr. Ionescu Maria',
        email: 'teacher.test@usm.ro'
      }
    }
  ];
  
  // Date hardcodate pentru examene aprobate
  const mockApprovedExams = [
    {
      id: 101,
      name: 'Baze de Date',
      code: 'C1004',
      group_name: '3201A',
      study_program: 'Calculatoare',
      year_of_study: 3,
      exam_type: 'exam',
      proposed_date: '2025-06-10T08:00:00',
      approved_date: '2025-06-10T08:00:00',
      status: 'approved',
      room: 'C401',
      room_id: 1,
      startTime: '08:00',
      endTime: '10:00',
      exam_duration: 2,
      group_leader: 'Student Test',
      assistants: ['Asist. Popescu Ion', 'Asist. Vasilescu Ana']
    }
  ];
  
  // Date hardcodate pentru săli disponibile
  const mockRooms = [
    { id: 1, name: 'C401', capacity: 30 },
    { id: 2, name: 'C402', capacity: 25 },
    { id: 3, name: 'C403', capacity: 40 },
    { id: 4, name: 'C404', capacity: 20 },
    { id: 5, name: 'C405', capacity: 35 }
  ];
  
  // Date hardcodate pentru asistenți
  const mockAssistants = [
    { id: 1, name: 'Asist. Popescu Ion', email: 'popescu.ion@usv.ro' },
    { id: 2, name: 'Asist. Vasilescu Ana', email: 'vasilescu.ana@usv.ro' },
    { id: 3, name: 'Asist. Georgescu Mihai', email: 'georgescu.mihai@usv.ro' },
    { id: 4, name: 'Asist. Dumitrescu Elena', email: 'dumitrescu.elena@usv.ro' },
    { id: 5, name: 'Asist. Popa Cristian', email: 'popa.cristian@usv.ro' }
  ];
  
  const [examProposals, setExamProposals] = useState(mockExamProposals);
  const [approvedExams, setApprovedExams] = useState(mockApprovedExams);
  const [availableRooms, setAvailableRooms] = useState(mockRooms);
  const [assistants, setAssistants] = useState(mockAssistants);
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
        
        if (proposals && Array.isArray(proposals) && proposals.length > 0) {
          console.log(`Am găsit ${proposals.length} propuneri de examene`);
          setExamProposals(proposals);
        } else {
          console.log('Nu am găsit propuneri de examene în formatul așteptat, folosim datele hardcodate');
          // Păstrăm datele hardcodate
        }
        
        // Obținem examenele aprobate
        try {
          const approvedResponse = await api.teacher.getApprovedExams();
          if (approvedResponse && approvedResponse.exams && approvedResponse.exams.length > 0) {
            setApprovedExams(approvedResponse.exams);
          } else {
            console.log('Nu am găsit examene aprobate, folosim datele hardcodate');
            // Păstrăm datele hardcodate pentru examene aprobate
          }
        } catch (error) {
          console.error('Eroare la obținerea examenelor aprobate:', error);
          console.log('Folosim datele hardcodate pentru examene aprobate');
          // Păstrăm datele hardcodate
        }
        
        // Obținem sălile disponibile
        try {
          const roomsResponse = await api.teacher.getAvailableRooms();
          if (roomsResponse && roomsResponse.rooms && roomsResponse.rooms.length > 0) {
            setAvailableRooms(roomsResponse.rooms);
          } else {
            console.log('Nu am găsit săli disponibile, folosim datele hardcodate');
            // Păstrăm datele hardcodate pentru săli
          }
        } catch (error) {
          console.error('Eroare la obținerea sălilor disponibile:', error);
          console.log('Folosim datele hardcodate pentru săli');
          // Păstrăm datele hardcodate
        }
        
        // Obținem profesorii de la API-ul USV
        try {
          const teachersResponse = await api.external.getTeachers();
          if (teachersResponse && teachersResponse.assistants && teachersResponse.assistants.length > 0) {
            console.log('Profesori obținuți de la API-ul USV:', teachersResponse.assistants);
            setAssistants(teachersResponse.assistants);
          } else {
            console.log('Nu am găsit profesori de la API-ul USV, folosim datele hardcodate');
            // Păstrăm datele hardcodate pentru asistenți
          }
        } catch (error) {
          console.error('Eroare la obținerea profesorilor de la API-ul USV:', error);
          console.log('Folosim datele hardcodate pentru asistenți');
          // Păstrăm datele hardcodate
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Eroare generală la încărcarea datelor:', error);
        setError('A apărut o eroare la încărcarea datelor. Vă rugăm să reîncărcați pagina.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Funcție pentru formatarea datei
  const formatDate = (dateString) => {
    if (!dateString) return 'Nedefinit';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Eroare la formatarea datei:', error);
      return dateString;
    }
  };

  // Funcție pentru aprobarea unei propuneri
  const handleApproveProposal = async (id) => {
    try {
      console.log(`Aprobăm propunerea cu ID-ul ${id}`);
      
      // Găsim propunerea în lista noastră
      const proposal = examProposals.find(p => p.id === id);
      if (!proposal) {
        throw new Error(`Nu s-a găsit propunerea cu ID-ul ${id}`);
      }
      
      // Trimitem cererea de aprobare la backend
      await api.teacher.approveExamProposal(id);
      
      // Actualizăm starea locală
      const updatedProposals = examProposals.map(p => 
        p.id === id ? { ...p, status: 'approved' } : p
      );
      
      setExamProposals(updatedProposals);
      
      // Adăugăm examenul aprobat la lista de examene aprobate
      const approvedExam = {
        ...proposal,
        status: 'approved',
        approved_date: new Date().toISOString()
      };
      
      setApprovedExams([...approvedExams, approvedExam]);
      
      alert('Propunerea a fost aprobată cu succes!');
    } catch (error) {
      console.error('Eroare la aprobarea propunerii:', error);
      alert(`Eroare la aprobarea propunerii: ${error.message}`);
    }
  };

  // Funcție pentru respingerea unei propuneri
  const handleRejectProposal = async (id) => {
    try {
      console.log(`Respingem propunerea cu ID-ul ${id}`);
      
      // Trimitem cererea de respingere la backend
      await api.teacher.rejectExamProposal(id);
      
      // Actualizăm starea locală
      const updatedProposals = examProposals.map(p => 
        p.id === id ? { ...p, status: 'rejected' } : p
      );
      
      setExamProposals(updatedProposals);
      
      alert('Propunerea a fost respinsă!');
    } catch (error) {
      console.error('Eroare la respingerea propunerii:', error);
      alert(`Eroare la respingerea propunerii: ${error.message}`);
    }
  };

  // Funcție pentru schimbarea sălii unui examen
  const handleRoomChange = (examId, roomId) => {
    const updatedExams = approvedExams.map(exam => 
      exam.id === examId ? { ...exam, room_id: roomId, room: availableRooms.find(r => r.id === parseInt(roomId))?.name } : exam
    );
    setApprovedExams(updatedExams);
  };

  // Funcție pentru schimbarea orei unui examen
  const handleTimeChange = (examId, field, value) => {
    const updatedExams = approvedExams.map(exam => 
      exam.id === examId ? { ...exam, [field]: value } : exam
    );
    setApprovedExams(updatedExams);
  };

  // Funcție pentru schimbarea asistenților unui examen
  const handleAssistantChange = (examId, selectedOptions) => {
    const assistantNames = selectedOptions ? selectedOptions.map(option => option.value) : [];
    
    const updatedExams = approvedExams.map(exam => 
      exam.id === examId ? { ...exam, assistants: assistantNames } : exam
    );
    
    setApprovedExams(updatedExams);
  };

  // Funcție pentru salvarea detaliilor unui examen
  const handleSaveExamDetails = async (id) => {
    try {
      const exam = approvedExams.find(e => e.id === id);
      if (!exam) {
        throw new Error(`Nu s-a găsit examenul cu ID-ul ${id}`);
      }
      
      if (!exam.room_id) {
        throw new Error('Vă rugăm să selectați o sală pentru examen.');
      }
      
      if (!exam.startTime || !exam.endTime) {
        throw new Error('Vă rugăm să specificați orele de început și sfârșit pentru examen.');
      }
      
      // Trimitem cererea de actualizare la backend
      await api.teacher.updateExamDetails(id, {
        room_id: exam.room_id,
        start_time: exam.startTime,
        end_time: exam.endTime,
        assistants: exam.assistants || []
      });
      
      alert('Detaliile examenului au fost salvate cu succes!');
    } catch (error) {
      console.error('Eroare la salvarea detaliilor examenului:', error);
      alert(`Eroare la salvarea detaliilor: ${error.message}`);
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
          Propuneri în așteptare
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
                    const id = proposal.id;
                    const disciplineName = proposal.name || proposal.disciplineName || proposal.discipline_name || 'Disciplină necunoscută';
                    const examType = proposal.exam_type || proposal.examType || proposal.type || 'exam';
                    const group = proposal.group_name || proposal.group || 'Grupă necunoscută';
                    const year = proposal.year_of_study || proposal.year || 3;
                    const groupLeader = proposal.group_leader || 'Student Test';
                    const proposedDate = proposal.proposed_date || proposal.date || '';
                    const status = proposal.status || 'pending';
                    
                    // Formăm data pentru afișare
                    const formattedDate = formatDate(proposedDate);
                    
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
                      <h4>{exam.name || exam.disciplineName}</h4>
                      <span className="exam-type">{exam.exam_type === 'exam' ? 'Examen' : 'Colocviu'}</span>
                    </div>
                    
                    <div className="exam-details">
                      <p><strong>Cod:</strong> {exam.code}</p>
                      <p><strong>Grupă:</strong> {exam.group_name || exam.group} (Anul {exam.year_of_study || exam.year})</p>
                      <p><strong>Șef grupă:</strong> {exam.group_leader || 'Student Test'}</p>
                      <p><strong>Dată propusă:</strong> {formatDate(exam.proposed_date)}</p>
                    </div>
                    
                    <div className="exam-config">
                      <h5>Configurare examen</h5>
                      
                      <div className="form-group">
                        <label>Sală:</label>
                        <select 
                          value={exam.room_id || ''}
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
                            value={exam.startTime || ''}
                            onChange={(e) => handleTimeChange(exam.id, 'startTime', e.target.value)}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Ora de sfârșit:</label>
                          <input 
                            type="time" 
                            value={exam.endTime || ''}
                            onChange={(e) => handleTimeChange(exam.id, 'endTime', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Asistenți:</label>
                        <Select
                          isMulti
                          name="assistants"
                          options={assistants.map(assistant => ({
                            value: assistant.name,
                            label: assistant.name,
                            data: assistant
                          }))}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          placeholder="Selectați asistenții..."
                          noOptionsMessage={() => "Nu s-au găsit profesori"}
                          value={(exam.assistants || []).map(name => ({
                            value: name,
                            label: name
                          }))}
                          onChange={(selectedOptions) => handleAssistantChange(exam.id, selectedOptions)}
                        />
                        <small className="form-text text-muted">Puteți căuta și selecta mai mulți asistenți.</small>
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
