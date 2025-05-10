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
        
        // Obținem propunerile de examen pentru profesor
        const proposalsResponse = await api.teacher.getExamProposals();
        if (proposalsResponse && proposalsResponse.proposals) {
          setExamProposals(proposalsResponse.proposals);
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
      // Trimitem cererea de aprobare la backend
      const response = await api.teacher.approveExamProposal(id);
      
      if (response && response.success) {
        // Actualizăm starea locală
        const proposal = examProposals.find(p => p.id === id);
        if (proposal) {
          const approvedProposal = {
            ...proposal,
            status: 'approved',
            room: '',
            startTime: '',
            endTime: '',
            assistants: []
          };
          
          setApprovedExams([...approvedExams, approvedProposal]);
          setExamProposals(examProposals.filter(p => p.id !== id));
          
          // Comutăm la tab-ul de examene aprobate
          setActiveTab('approved');
          
          alert(`Propunerea pentru ${proposal.examType === 'examen' ? 'examenul' : 'colocviul'} de ${proposal.disciplineName} a fost aprobată. Acum puteți configura sala și asistenții.`);
        }
      } else {
        throw new Error('Nu s-a putut aproba propunerea de examen.');
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
        // Trimitem cererea de respingere la backend
        const response = await api.teacher.rejectExamProposal(id, { reason });
        
        if (response && response.success) {
          // Actualizăm starea locală
          setExamProposals(examProposals.map(proposal => 
            proposal.id === id ? { ...proposal, status: 'rejected', rejectionReason: reason } : proposal
          ));
          
          alert('Propunerea a fost respinsă și șeful de grupă a fost notificat.');
        } else {
          throw new Error('Nu s-a putut respinge propunerea de examen.');
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
            <h3>Propuneri de examene/colocvii</h3>
            {examProposals.length === 0 ? (
              <p className="no-data">Nu există propuneri în așteptare.</p>
            ) : (
              <table className="proposals-table">
                <thead>
                  <tr>
                    <th>Disciplină</th>
                    <th>Tip</th>
                    <th>Grupă</th>
                    <th>Șef grupă</th>
                    <th>Dată propusă</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {examProposals.map(proposal => (
                    <tr key={proposal.id} className="proposal-row">
                      <td>{proposal.disciplineName}</td>
                      <td>{proposal.examType === 'examen' ? 'Examen' : 'Colocviu'}</td>
                      <td>{proposal.group} (Anul {proposal.year})</td>
                      <td>{proposal.groupLeader}</td>
                      <td>{proposal.proposedDate}</td>
                      <td className="actions">
                        <button 
                          className="approve-button"
                          onClick={() => handleApproveProposal(proposal.id)}
                        >
                          Aprobă
                        </button>
                        <button 
                          className="reject-button"
                          onClick={() => handleRejectProposal(proposal.id)}
                        >
                          Respinge
                        </button>
                      </td>
                    </tr>
                  ))}
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
