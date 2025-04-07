import React, { useState, useEffect } from 'react';
import './GroupLeaderDashboard.css';

const GroupLeaderDashboard = ({ user }) => {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data - in a real application, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockDisciplines = [
        {
          id: 1,
          name: 'Programare Web',
          teacher: 'Prof. Dr. Popescu Ion',
          teacherEmail: 'popescu.ion@usm.ro',
          examType: 'examen',
          group: 'A3',
          year: 2,
          semester: 2,
          proposedDate: '',
          status: 'pending', // pending, rejected, approved
          rejectionReason: '',
        },
        {
          id: 2,
          name: 'Baze de Date',
          teacher: 'Conf. Dr. Ionescu Maria',
          teacherEmail: 'ionescu.maria@usm.ro',
          examType: 'colocviu',
          group: 'A3',
          year: 2,
          semester: 2,
          proposedDate: '',
          status: 'pending',
          rejectionReason: '',
        },
        {
          id: 3,
          name: 'Inteligență Artificială',
          teacher: 'Prof. Dr. Georgescu Andrei',
          teacherEmail: 'georgescu.andrei@usm.ro',
          examType: 'examen',
          group: 'A3',
          year: 2,
          semester: 2,
          proposedDate: '',
          status: 'pending',
          rejectionReason: '',
        }
      ];
      
      setDisciplines(mockDisciplines);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDateChange = (id, date) => {
    setDisciplines(disciplines.map(discipline => 
      discipline.id === id ? { ...discipline, proposedDate: date } : discipline
    ));
  };

  const handleSubmitProposal = (id) => {
    // In a real application, this would send the proposal to the backend
    // and notify the teacher via email
    
    // For now, we'll just update the local state
    setDisciplines(disciplines.map(discipline => 
      discipline.id === id ? { 
        ...discipline, 
        status: 'pending_approval',
        statusMessage: 'Propunere trimisă. Așteptare aprobare...'
      } : discipline
    ));
    
    alert(`Propunerea pentru examenul/colocviul de ${disciplines.find(d => d.id === id).name} a fost trimisă profesorului ${disciplines.find(d => d.id === id).teacher} pentru aprobare.`);
  };

  if (loading) {
    return <div className="loading">Se încarcă disciplinele...</div>;
  }

  if (error) {
    return <div className="error">Eroare: {error}</div>;
  }

  return (
    <div className="group-leader-dashboard">
      <h2>Panou Șef Grupă</h2>
      <p>Bine ai venit, {user?.name || 'Șef de Grupă'}! Aici poți propune date pentru examenele și colocviile grupei tale.</p>
      
      <div className="disciplines-container">
        <h3>Discipline</h3>
        {disciplines.length === 0 ? (
          <p className="no-disciplines">Nu există discipline disponibile momentan.</p>
        ) : (
          <table className="disciplines-table">
            <thead>
              <tr>
                <th>Disciplină</th>
                <th>Tip</th>
                <th>Profesor</th>
                <th>Dată Propusă</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {disciplines.map(discipline => (
                <tr key={discipline.id} className={`discipline-row ${discipline.status}`}>
                  <td>{discipline.name}</td>
                  <td>{discipline.examType === 'examen' ? 'Examen' : 'Colocviu'}</td>
                  <td>{discipline.teacher}</td>
                  <td>
                    {discipline.status === 'approved' ? (
                      <span>{discipline.proposedDate}</span>
                    ) : (
                      <input 
                        type="date" 
                        value={discipline.proposedDate}
                        onChange={(e) => handleDateChange(discipline.id, e.target.value)}
                        disabled={discipline.status === 'approved'}
                      />
                    )}
                  </td>
                  <td>
                    {discipline.status === 'pending' && 'În așteptare'}
                    {discipline.status === 'pending_approval' && 'Trimis spre aprobare'}
                    {discipline.status === 'rejected' && (
                      <div className="rejection">
                        <span>Respins</span>
                        {discipline.rejectionReason && (
                          <div className="tooltip">
                            <i className="info-icon">i</i>
                            <span className="tooltip-text">{discipline.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {discipline.status === 'approved' && 'Aprobat'}
                  </td>
                  <td>
                    {(discipline.status === 'pending' || discipline.status === 'rejected') && (
                      <button 
                        className="submit-button"
                        onClick={() => handleSubmitProposal(discipline.id)}
                        disabled={!discipline.proposedDate}
                      >
                        {discipline.status === 'rejected' ? 'Retrimite' : 'Trimite'}
                      </button>
                    )}
                    {discipline.status === 'pending_approval' && (
                      <span className="status-message">În așteptare</span>
                    )}
                    {discipline.status === 'approved' && (
                      <span className="status-message">Aprobat</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="instructions">
        <h3>Instrucțiuni</h3>
        <ol>
          <li>Pentru fiecare disciplină, selectează o dată propusă din perioada de examen/colocviu.</li>
          <li>Apasă butonul "Trimite" pentru a trimite propunerea către profesor.</li>
          <li>Vei fi notificat prin email când profesorul aprobă sau respinge propunerea.</li>
          <li>Dacă propunerea este respinsă, poți propune o nouă dată.</li>
        </ol>
      </div>
    </div>
  );
};

export default GroupLeaderDashboard;
