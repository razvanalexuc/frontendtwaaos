import React, { useState, useEffect } from 'react';
import './TeacherDashboard.css';

const TeacherDashboard = ({ user }) => {
  const [examProposals, setExamProposals] = useState([]);
  const [approvedExams, setApprovedExams] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('proposals');

  // Mock data - in a real application, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockProposals = [
        {
          id: 1,
          disciplineName: 'Programare Web',
          group: 'A3',
          year: 2,
          groupLeader: 'Popescu Alexandru',
          groupLeaderEmail: 'popescu.alexandru@student.usv.ro',
          examType: 'examen',
          proposedDate: '2025-06-10',
          status: 'pending', // pending, rejected, approved
        },
        {
          id: 2,
          disciplineName: 'Baze de Date',
          group: 'B2',
          year: 2,
          groupLeader: 'Ionescu Maria',
          groupLeaderEmail: 'ionescu.maria@student.usv.ro',
          examType: 'colocviu',
          proposedDate: '2025-05-25',
          status: 'pending',
        }
      ];

      const mockApproved = [
        {
          id: 3,
          disciplineName: 'Algoritmi și Structuri de Date',
          group: 'A2',
          year: 1,
          groupLeader: 'Dumitrescu Ion',
          groupLeaderEmail: 'dumitrescu.ion@student.usv.ro',
          examType: 'examen',
          proposedDate: '2025-06-05',
          status: 'approved',
          room: 'C210',
          startTime: '10:00',
          endTime: '12:00',
          assistants: ['Asist. Dr. Vasilescu Elena']
        }
      ];

      const mockRooms = [
        { id: 1, name: 'C210', capacity: 30, available: true },
        { id: 2, name: 'C310', capacity: 50, available: true },
        { id: 3, name: 'C410', capacity: 25, available: true },
        { id: 4, name: 'B110', capacity: 40, available: true },
      ];

      const mockAssistants = [
        { id: 1, name: 'Asist. Dr. Vasilescu Elena', email: 'vasilescu.elena@usm.ro', available: true },
        { id: 2, name: 'Asist. Dr. Georgescu Andrei', email: 'georgescu.andrei@usm.ro', available: true },
        { id: 3, name: 'Asist. Dr. Popa Mihai', email: 'popa.mihai@usm.ro', available: true },
      ];
      
      setExamProposals(mockProposals);
      setApprovedExams(mockApproved);
      setAvailableRooms(mockRooms);
      setAssistants(mockAssistants);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApproveProposal = (id) => {
    // Move the proposal to the approved list with empty room and assistants
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
      
      // Switch to the approved tab
      setActiveTab('approved');
      
      alert(`Propunerea pentru ${proposal.examType === 'examen' ? 'examenul' : 'colocviul'} de ${proposal.disciplineName} a fost aprobată. Acum puteți configura sala și asistenții.`);
    }
  };

  const handleRejectProposal = (id) => {
    const reason = prompt('Introduceți motivul respingerii:');
    if (reason !== null) {
      // In a real application, this would send the rejection to the backend
      // and notify the group leader via email
      
      setExamProposals(examProposals.map(proposal => 
        proposal.id === id ? { ...proposal, status: 'rejected', rejectionReason: reason } : proposal
      ));
      
      alert(`Propunerea a fost respinsă. Un email va fi trimis șefului de grupă cu motivul respingerii.`);
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

  const handleSaveExamDetails = (id) => {
    const exam = approvedExams.find(e => e.id === id);
    if (!exam.room || !exam.startTime || !exam.endTime || exam.assistants.length === 0) {
      alert('Vă rugăm să completați toate câmpurile: sala, ora de început, ora de sfârșit și cel puțin un asistent.');
      return;
    }
    
    // In a real application, this would save the exam details to the backend
    
    alert(`Detaliile pentru ${exam.examType === 'examen' ? 'examenul' : 'colocviul'} de ${exam.disciplineName} au fost salvate cu succes.`);
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
