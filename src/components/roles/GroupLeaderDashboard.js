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
        
        // Verificăm dacă utilizatorul are o grupă asociată
        if (!user || (!user.group && !user.group_name)) {
          console.error('User does not have a group assigned:', user);
          setError('Nu aveți o grupă asociată contului. Contactați administratorul pentru a vă asocia cu o grupă.');
          setLoading(false);
          return;
        }
        
        // Folosim group_name din user sau group dacă există
        const userGroup = user.group_name || user.group;
        console.log('Fetching courses for group:', userGroup);
        
        // Încercăm să obținem toate disciplinele dacă nu avem o grupă specifică
        const coursesResponse = await api.courses.getCourses(userGroup ? {
          group_name: userGroup
        } : {});
        
        console.log('Courses response:', coursesResponse);
        
        // Obținem examenele propuse pentru aceste discipline
        const examProposalsResponse = await api.exams.getExams(userGroup ? { 
          status: 'all', // Obținem toate examenele propuse
          group: userGroup
        } : { status: 'all' });
        
        console.log('Exam proposals response:', examProposalsResponse);
        
        // Transformăm datele în formatul de care avem nevoie
        if (coursesResponse?.courses) {
          const availableDisciplines = coursesResponse.courses.map(discipline => {
            // Căutăm dacă există un examen propus pentru această disciplină
            const proposedExam = examProposalsResponse?.exams?.find(
              exam => exam.discipline_id === discipline.id
            );
            
            return {
              id: discipline.id,
              name: discipline.name,
              code: discipline.code,
              teacher: discipline.teacher ? `${discipline.teacher.title || ''} ${discipline.teacher.first_name} ${discipline.teacher.last_name}` : 'Nedefinit',
              teacherEmail: discipline.teacher?.email,
              examType: discipline.exam_type || 'examen',
              group_name: discipline.group_name,
              study_program: discipline.study_program,
              year_of_study: discipline.year_of_study,
              proposedDate: proposedExam ? new Date(proposedExam.date).toISOString().split('T')[0] : '',
              status: proposedExam ? proposedExam.status : 'pending',
              rejectionReason: proposedExam?.rejection_reason || '',
            };
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
  }, [user]); // Depinde de user

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
      
      // Creăm datele pentru examen
      const examData = {
        discipline_id: discipline.id,
        date: `${discipline.proposedDate}T09:00:00`, // Implicit la 9 AM
        duration: 120, // 2 ore în minute
        type: discipline.examType,
        notes: `Propunere pentru ${discipline.examType === 'examen' ? 'examenul' : 'colocviul'} de ${discipline.name}`
      };
      
      // Trimitem propunerea la backend folosind noul API
      const response = await api.exams.createExam(examData);
      
      // Actualizăm starea locală a disciplinei
      if (response.exam) {
        setDisciplines(disciplines.map(d => {
          if (d.id === id) {
            return {
              ...d,
              status: 'pending_approval',
              proposedDate: discipline.proposedDate
            };
          }
          return d;
        }));
        
        alert('Propunerea de examen a fost trimisă cu succes!');
      } else {
        alert('A apărut o eroare la trimiterea propunerii. Vă rugăm să încercați din nou.');
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
