import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './GroupLeaderDashboard.css';

const GroupLeaderDashboard = ({ user }) => {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Încarcă discipline din backend
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obținem rezervările utilizatorului
        const userReservationsResponse = await api.student.getUserReservations();
        
        // Obținem sălile disponibile (care includ discipline predate de profesori)
        const roomsResponse = await api.student.getRooms();
        
        // Transformăm datele în formatul de care avem nevoie
        if (roomsResponse.rooms && userReservationsResponse.reservations) {
          // Extragem disciplinele din datele despre săli
          const availableDisciplines = [];
          
          // Procesăm datele despre săli pentru a extrage disciplinele
          roomsResponse.rooms.forEach(room => {
            if (room.disciplines) {
              room.disciplines.forEach(discipline => {
                // Verificăm dacă această disciplină este pentru grupa utilizatorului curent
                if (discipline.group === user.group) {
                  // Căutăm dacă există o rezervare pentru această disciplină
                  const reservation = userReservationsResponse.reservations.find(
                    r => r.discipline_id === discipline.id
                  );
                  
                  availableDisciplines.push({
                    id: discipline.id,
                    name: discipline.name,
                    teacher: `${discipline.teacher_title || ''} ${discipline.teacher_first_name} ${discipline.teacher_last_name}`,
                    teacherEmail: discipline.teacher_email,
                    examType: discipline.exam_type || 'examen',
                    group: discipline.group,
                    year: discipline.year,
                    semester: discipline.semester,
                    proposedDate: reservation ? new Date(reservation.start_time).toISOString().split('T')[0] : '',
                    status: reservation ? reservation.status : 'pending',
                    rejectionReason: reservation ? reservation.rejection_reason : '',
                  });
                }
              });
            }
          });
          
          setDisciplines(availableDisciplines);
        } else {
          // Dacă nu avem date, afișăm un mesaj de eroare
          setError('Nu s-au putut încărca disciplinele. Vă rugăm să încercați din nou mai târziu.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching disciplines:', error);
        setError('A apărut o eroare la încărcarea disciplinelor. Vă rugăm să verificați conexiunea la server.');
        setLoading(false);
      }
    };
    
    fetchDisciplines();
  }, [user.group]); // Depinde de user.group

  const handleDateChange = (id, date) => {
    setDisciplines(disciplines.map(discipline => 
      discipline.id === id ? { ...discipline, proposedDate: date } : discipline
    ));
  };

  const handleSubmitProposal = async (id) => {
    try {
      const discipline = disciplines.find(d => d.id === id);
      if (!discipline || !discipline.proposedDate) {
        alert('Vă rugăm să selectați o dată pentru examen.');
        return;
      }
      
      // Creăm datele pentru rezervare
      const reservationData = {
        discipline_id: discipline.id,
        start_time: `${discipline.proposedDate}T09:00:00`, // Implicit la 9 AM
        end_time: `${discipline.proposedDate}T11:00:00`,   // Implicit la 11 AM (examen de 2 ore)
        notes: `Propunere pentru ${discipline.examType === 'examen' ? 'examenul' : 'colocviul'} de ${discipline.name}`
      };
      
      // Trimitem propunerea la backend
      const response = await api.student.createReservation(reservationData);
      
      // Actualizăm starea locală cu răspunsul de la server
      if (response && response.reservation) {
        setDisciplines(disciplines.map(d => 
          d.id === id ? { 
            ...d, 
            status: 'pending_approval',
            statusMessage: 'Propunere trimisă. Așteptare aprobare...'
          } : d
        ));
        
        alert(`Propunerea pentru ${discipline.examType === 'examen' ? 'examenul' : 'colocviul'} de ${discipline.name} a fost trimisă cu succes!`);
      } else {
        throw new Error('Nu s-a primit confirmare de la server.');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert(`Eroare la trimiterea propunerii: ${error.message}`);
    }
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
