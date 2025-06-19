import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './GroupLeaderDashboard.css';

const GroupLeaderDashboard = ({ user }) => {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalDate, setProposalDate] = useState('');
  const [proposalTime, setProposalTime] = useState('12:00');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [teachers, setTeachers] = useState([]);

  // Funcție pentru încărcarea profesorilor de la API-ul USV
  const fetchTeachers = async () => {
    try {
      console.log('Se încearcă lista de profesori de la API-ul USV...');
      const response = await api.external.getTeachers();
      if (response && response.assistants) {
        console.log('Profesori obținuți de la API-ul USV:', response.assistants);
        console.log('Număr de profesori obținuți:', response.assistants.length);
        
        // Afișăm primii 5 profesori pentru debugging
        if (response.assistants.length > 0) {
          console.log('Primii 5 profesori:');
          response.assistants.slice(0, 5).forEach((teacher, index) => {
            console.log(`${index + 1}. ${teacher.name} (${teacher.email || 'fără email'})`);
          });
        }
        
        setTeachers(response.assistants);
        return response.assistants;
      } else {
        console.warn('API-ul nu a returnat profesori sau structura răspunsului este incorectă:', response);
        return [];
      }
    } catch (error) {
      console.error('Eroare la obținerea profesorilor de la API-ul USV:', error);
      return [];
    }
  };
  
  // Funcție pentru încărcarea disciplinelor
  const fetchDisciplines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificăm dacă avem un token de autentificare valid
      const token = localStorage.getItem('accessToken');
      console.log('Auth token:', token ? 'Token exists' : 'No token found');
      
      // Verificăm dacă utilizatorul are o grupă asociată
      // Verificăm toate posibilele locații ale câmpului group_name în obiectul user
      if (!user) {
        console.error('User is not defined');
        setError('Nu sunteți autentificat. Vă rugăm să vă autentificați din nou.');
        setLoading(false);
        return;
      }
      
      // Încercăm să obținem grupa din toate posibilele locații
      // Whitelist pentru adrese de email care primesc automat o grupă
      const whitelistedEmails = {
        'test@student.usv.ro': '3201A',
        'razvan.alexuc2@student.usv.ro': '3201A',
        'samuel.dascalu2@student.usv.ro': '3201A'
      };
      
      const userGroup = user.group_name || user.group || user.data?.group_name || 
                       (typeof user === 'object' && Object.prototype.hasOwnProperty.call(user, 'email') && 
                        whitelistedEmails[user.email] ? whitelistedEmails[user.email] : null);
      
      if (!userGroup) {
        console.error('User does not have a group assigned:', user);
        setError('Nu aveți o grupă asociată contului. Contactați administratorul pentru a vă asocia cu o grupă.');
        setLoading(false);
        return;
      }
      console.log('Fetching courses for group:', userGroup);
    
    // Construim parametrii pentru cerere - nu mai filtrăm după grupă pentru a obține toate disciplinele
    // similar cu SecretariatDashboard
    const params = {};
    
    console.log('Request params:', params);
    
    // Facem cererea către backend
    const coursesResponse = await api.courses.getCourses(params);
      
      console.log('Courses response:', coursesResponse);
      
      // Obținem examenele propuse pentru aceste discipline
    const examProposalsResponse = await api.exams.getExams(userGroup ? { 
      status: 'all', // Obținem toate examenele propuse
      group: userGroup
    } : { status: 'all' });
    
    console.log('Exam proposals response:', examProposalsResponse);
    
    // Procesăm datele de examene - pot fi în examProposalsResponse.exams sau examProposalsResponse.data
    const exams = examProposalsResponse?.exams || examProposalsResponse?.data;
    console.log('Processed exams data:', exams);
      
      // Transformăm datele în formatul de care avem nevoie
    // Verificăm dacă avem date în răspuns - pot fi în coursesResponse.courses sau coursesResponse.data
    const courses = coursesResponse?.courses || coursesResponse?.data;
    
    console.log('Processed courses data:', courses);
    
    // Verificăm structura datelor despre profesori
    if (courses && courses.length > 0) {
      console.log('Exemplu de profesor:', courses[0].teacher);
    }
    
    // Verificăm dacă avem un mesaj de la backend
    if (coursesResponse?.message) {
      console.log('Backend message:', coursesResponse.message);
    }
    
    if (courses && Array.isArray(courses) && courses.length > 0) {
      // Afișăm informații detaliate despre primele discipline pentru debugging
      console.log('Exemplu de disciplină (prima din listă):', JSON.stringify(courses[0], null, 2));
      
      // Filtrăm disciplinele pentru a păstra doar cele care au un profesor asociat
      // Relaxăm condițiile pentru a permite mai multe discipline
      const filteredCourses = courses.filter(discipline => {
        // Verificăm dacă disciplina are un profesor asociat (chiar și parțial)
        const hasTeacher = discipline.teacher !== null && discipline.teacher !== undefined;
        
        // Verificăm dacă disciplina are un nume (toate ar trebui să aibă)
        const hasName = discipline.name && discipline.name.length > 0;
        
        // Afișăm informații despre fiecare disciplină pentru debugging
        console.log(`Disciplina ${discipline.name || 'fără nume'}: hasTeacher=${hasTeacher}, hasName=${hasName}`);
        
        // Păstrăm toate disciplinele care au un nume și un profesor (chiar dacă informațiile sunt incomplete)
        return hasName && hasTeacher;
      });
      
      console.log(`Filtrat ${courses.length} discipline la ${filteredCourses.length} discipline valide`);
      
      // Distribuim profesorii din API pentru fiecare disciplină (doar pentru testare)
      // Folosim un seed bazat pe ID-ul disciplinei pentru a avea o distribuție consistentă
      const getRandomTeacher = (disciplineId) => {
        if (teachers.length === 0) return 'Nedefinit';
        
        // Folosim ID-ul disciplinei ca seed pentru a obține același profesor pentru aceeași disciplină
        const seed = disciplineId % teachers.length;
        return teachers[seed].name;
      };
      
      const availableDisciplines = filteredCourses.map(discipline => {
        // Căutăm dacă există un examen propus pentru această disciplină
        const proposedExam = exams && Array.isArray(exams) ? exams.find(
          exam => exam.discipline_id === discipline.id || exam.course?.id === discipline.id
        ) : null;
        
        // Pentru testare, atribuim un profesor diferit pentru fiecare disciplină
        const teacherName = getRandomTeacher(discipline.id);
          
          return {
            id: discipline.id,
            name: discipline.name,
            code: discipline.code,
            teacher: teacherName,
            teacherEmail: discipline.teacher?.email,
            examType: discipline.exam_type || 'examen',
            group_name: discipline.group_name,
            study_program: discipline.study_program,
            year_of_study: discipline.year_of_study,
            // Verificăm mai multe surse posibile pentru data propusă
            proposedDate: (() => {
              // Prima dată verificăm dacă există un examen propus
              if (proposedExam && proposedExam.date) {
                const dateObj = new Date(proposedExam.date);
                if (!isNaN(dateObj.getTime())) {
                  return dateObj.toISOString().split('T')[0];
                }
              }
              
              // Apoi verificăm dacă disciplina în sine are o dată propusă
              if (discipline.proposed_date) {
                const dateObj = new Date(discipline.proposed_date);
                if (!isNaN(dateObj.getTime())) {
                  return dateObj.toISOString().split('T')[0];
                }
              }
              
              // Dacă nu găsim nicio dată validă, returnăm string gol
              return '';
            })(),
            // Verificăm mai multe surse posibile pentru status
            status: (() => {
              // Prima dată verificăm dacă există un examen propus cu status
              if (proposedExam && proposedExam.status) {
                return proposedExam.status;
              }
              
              // Apoi verificăm dacă disciplina în sine are un status
              if (discipline.status) {
                return discipline.status;
              }
              
              // Dacă disciplina are o dată propusă dar nu are status, presupunem că e în așteptare
              if (discipline.proposed_date || proposedExam?.date) {
                return 'pending';
              }
              
              // Dacă nu găsim niciun status și nu există o dată propusă, returnăm 'unconfigured'
              return 'unconfigured';
            })(),
            rejectionReason: proposedExam?.rejection_reason || '',
          };
        });
        
        setDisciplines(availableDisciplines);
      } else {
        // Dacă nu avem date sau array-ul este gol, afișăm mesajul de la backend sau un mesaj de eroare generic
        console.log('No courses data found or empty array in response:', coursesResponse);
        
        // Folosim mesajul de la backend dacă există, altfel folosim un mesaj generic
        const errorMessage = coursesResponse?.message || 'Nu s-au putut încărca disciplinele. Vă rugăm să încercați din nou mai târziu.';
        setError(errorMessage);
      }
      
      setLoading(false);
    } catch (error) {
    console.error('Error fetching disciplines:', error);
    
    // Verificăm dacă eroarea este legată de autentificare
    if (error.message && error.message.includes('Authorization')) {
      console.error('Authentication error detected');
      setError('Eroare de autentificare. Vă rugăm să vă autentificați din nou.');
      
      // Reîmprospătăm pagina pentru a forța o nouă autentificare
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        window.location.reload();
      }, 3000);
    } else {
      setError(`A apărut o eroare la încărcarea disciplinelor: ${error.message || 'Eroare necunoscută'}. Vă rugăm să verificați conexiunea la server.`);
    }
    
    setLoading(false);
  }
  };
  
  // Încărcăm disciplinele și profesorii la prima randare
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTeachers().then(() => {
      fetchDisciplines();
    });
  }, []); // Depinde de user

  // Funcție pentru debugging
  const logApiStatus = () => {
    console.log('API Status Check:');
    console.log('- Access Token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
    console.log('- User Data:', user ? 'Present' : 'Missing');
    if (user) {
      console.log('- User Email:', user.email);
      console.log('- User Group:', user.group_name || user.group || user.data?.group_name || 'Not found');
    }
  };
  
  // eslint-disable-next-line no-unused-vars
  const handleDateChange = (id, date) => {
    setDisciplines(disciplines.map(discipline => 
      discipline.id === id ? { ...discipline, proposedDate: date } : discipline
    ));
  };

  const openProposalModal = (discipline) => {
    setSelectedDiscipline(discipline);
    // Setăm data și ora implicite
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setProposalDate(`${year}-${month}-${day}`);
    setProposalTime('12:00');
    setShowProposalModal(true);
  };

  const closeProposalModal = () => {
    setShowProposalModal(false);
    setSelectedDiscipline(null);
  };

  const handleSubmitProposal = async (id) => {
    try {
      const discipline = disciplines.find(d => d.id === id);
      if (!discipline) {
        showNotification('Disciplina nu a fost găsită.', 'error');
        return;
      }
      
      // Deschidem modalul pentru propunere
      openProposalModal(discipline);
    } catch (error) {
      console.error('Error preparing proposal:', error);
      showNotification('A apărut o eroare la pregătirea propunerii.', 'error');
    }
  };
  
  // Funcție pentru afișarea notificărilor
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };
  
  const submitProposal = async () => {
    if (!selectedDiscipline || !proposalDate || !proposalTime) {
      showNotification('Vă rugăm să completați toate câmpurile.', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      logApiStatus(); // Afișăm informații de debugging
      
      // Validăm data propusă
      const dateObj = new Date(`${proposalDate}T${proposalTime}:00`);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Data sau ora propusă nu este validă');
      }
      
      // Combinăm data și ora într-un format ISO
      const proposedDateTime = `${proposalDate}T${proposalTime}:00`;
      console.log('Trimit propunere cu data:', proposedDateTime);
      
      // Trimitem propunerea către backend
      const response = await api.courses.proposeExamDate(selectedDiscipline.id, {
        proposed_date: proposedDateTime
      });
      
      console.log('Răspuns propunere:', response);
      
      // Actualizăm starea locală pentru a reflecta trimiterea
      setDisciplines(disciplines.map(d => 
        d.id === selectedDiscipline.id ? { 
          ...d, 
          status: 'pending', 
          proposedDate: proposalDate,
          proposedTime: proposalTime 
        } : d
      ));
      
      // Închidem modalul și afișăm notificarea
      closeProposalModal();
      showNotification(`Propunere trimisă cu succes pentru ${selectedDiscipline.name}.`, 'success');
      
      // Reîncărcăm datele de la server pentru a vedea schimbările
      setTimeout(() => {
        console.log('Reîncărcăm disciplinele după trimiterea propunerii...');
        fetchDisciplines();
      }, 1000); // Așteptăm 1 secundă pentru a permite serverului să proceseze cererea
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      showNotification(`Eroare: ${error.message || 'A apărut o eroare la trimiterea propunerii. Vă rugăm să încercați din nou.'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Funcție pentru debugging
  const handleDebugClick = () => {
    if (teachers && teachers.length > 0) {
      console.log('Lista de profesori:');
      teachers.forEach((teacher, index) => {
        console.log(`${index + 1}. ${teacher.name} (${teacher.email || 'fără email'})`);
      });
    }
  };
  
  // Funcție pentru adăugarea profesorului de test
  const handleAddTestTeacher = async () => {
    try {
      setNotification({ show: true, message: 'Se adaugă profesorul de test...', type: 'info' });
      
      const response = await api.teacherManagement.addTeacher({
        email: 'teacher.test@usm.ro',
        first_name: 'Test',
        last_name: 'Teacher',
        title: 'Prof.',
        department: 'Informatică'
      });
      
      if (response && response.success) {
        setNotification({ show: true, message: 'Profesorul de test a fost adăugat cu succes!', type: 'success' });
        console.log('Profesor de test adăugat:', response);
        // Reîncărcăm lista de profesori
        fetchTeachers();
      } else {
        setNotification({ show: true, message: 'Eroare la adăugarea profesorului de test: ' + (response?.message || 'Eroare necunoscută'), type: 'error' });
      }
    } catch (error) {
      console.error('Eroare la adăugarea profesorului de test:', error);
      setNotification({ show: true, message: 'Eroare la adăugarea profesorului de test: ' + (error.message || 'Eroare necunoscută'), type: 'error' });
    }
  };

  if (loading) {
    return <div className="loading">Se încarcă disciplinele...</div>;
  }

  if (error) {
    return (
      <div className="group-leader-dashboard">
        <h2>Panou Șef Grupă</h2>
        <div className="error-container">
          <div className="error-message">
            <h3>Eroare</h3>
            <p>{error}</p>
            
            {error.includes('Nu aveți o grupă asociată') && (
              <div className="error-help">
                <h4>Ce puteți face:</h4>
                <ol>
                  <li>Verificați dacă adresa de email folosită pentru înregistrare este cea corectă (@student.usv.ro)</li>
                  <li>Contactați administratorul sistemului pentru a vă asocia cu grupa corespunzătoare</li>
                  <li>Dacă sunteți șef de grupă, asigurați-vă că ați fost înregistrat în sistem cu acest rol</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group-leader-dashboard">
      <h2>Panou Șef de Grupă</h2>
      
      {/* Butoane pentru debugging și adăugare profesor de test */}
      <div style={{ marginBottom: '15px' }}>
        <button onClick={handleDebugClick} className="debug-button" style={{ marginRight: '10px' }}>
          Debug Profesori
        </button>
        
        <button onClick={handleAddTestTeacher} className="debug-button" style={{ backgroundColor: '#4CAF50' }}>
          Adaugă Profesor Test
        </button>
      </div>
      <p>Bine ai venit, {user?.name || 'Șef de Grupă'}! Aici poți propune date pentru examenele și colocviile grupei tale.</p>
      
      {/* Notificări */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button className="close-notification" onClick={() => setNotification({ show: false, message: '', type: '' })}>×</button>
        </div>
      )}
      
      {/* Buton de debug */}
      <button 
        onClick={() => {
          logApiStatus();
          showNotification('Informații de debugging au fost afișate în consolă', 'info');
        }}
        style={{ marginBottom: '10px', padding: '5px 10px', fontSize: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Debug API Status
      </button>
      
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
                  <td>{discipline.examType === 'exam' ? 'Examen' : discipline.examType === 'colloquium' ? 'Colocviu' : discipline.examType}</td>
                  <td>
                    {discipline.teacher?.name || 
                     (teachers.find(t => 
                       t.email === discipline.teacher?.email || 
                       t.name.includes(discipline.teacher?.lastName || '') || 
                       t.name.includes(discipline.teacher?.firstName || '')
                     )?.name) || 
                     'Nespecificat'}
                  </td>
                  <td>
                    {discipline.status === 'approved' ? (
                      <span>{new Date(discipline.proposedDate).toLocaleDateString('ro-RO')}</span>
                    ) : (
                      <div className="date-display">
                        {discipline.proposedDate ? (
                          <span>{new Date(discipline.proposedDate).toLocaleDateString('ro-RO')}</span>
                        ) : (
                          <span className="no-date">Nicio dată propusă</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className={`status-badge ${discipline.status}`}>
                      {discipline.status === 'unconfigured' && 'Neconfigurat'}
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
                    </div>
                  </td>
                  <td>
                    {(discipline.status === 'pending' || discipline.status === 'rejected' || discipline.status === 'unconfigured') && (
                      <button 
                        className="submit-button"
                        onClick={() => handleSubmitProposal(discipline.id)}
                      >
                        {discipline.status === 'rejected' ? 'Retrimite' : 
                         discipline.status === 'unconfigured' ? 'Configurează' : 'Propune dată'}
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

      {/* Modal pentru propunerea datei de examen */}
      {showProposalModal && selectedDiscipline && (
        <div className="modal-overlay">
          <div className="proposal-modal">
            <h3>Propune dată pentru examen</h3>
            <div className="modal-content">
              <div className="discipline-info">
                <p><strong>Disciplină:</strong> {selectedDiscipline.name}</p>
                <p><strong>Profesor:</strong> {selectedDiscipline.teacher}</p>
                <p><strong>Tip:</strong> {selectedDiscipline.examType === 'exam' ? 'Examen' : 'Colocviu'}</p>
              </div>
              
              {selectedDiscipline.status === 'rejected' && selectedDiscipline.rejectionReason && (
                <div className="rejection-reason">
                  <p><strong>Motivul respingerii anterioare:</strong></p>
                  <p className="reason-text">{selectedDiscipline.rejectionReason}</p>
                </div>
              )}
              
              <div className="date-time-inputs">
                <div className="form-group">
                  <label htmlFor="proposal-date">Data propusă:</label>
                  <input 
                    id="proposal-date"
                    type="date" 
                    value={proposalDate} 
                    onChange={(e) => setProposalDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="proposal-time">Ora propusă:</label>
                  <input 
                    id="proposal-time"
                    type="time" 
                    value={proposalTime} 
                    onChange={(e) => setProposalTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-button" 
                  onClick={closeProposalModal}
                  disabled={submitting}
                >
                  Anulează
                </button>
                <button 
                  className="submit-button" 
                  onClick={submitProposal}
                  disabled={submitting || !proposalDate || !proposalTime}
                >
                  {submitting ? 'Se trimite...' : 'Trimite propunerea'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="instructions">
        <h3>Instrucțiuni</h3>
        <ol>
          <li>Pentru fiecare disciplină, apasă butonul "Propune dată" pentru a selecta o dată și oră pentru examen.</li>
          <li>Completează formularul cu data și ora propuse și trimite propunerea.</li>
          <li>Vei fi notificat prin email când profesorul aprobă sau respinge propunerea.</li>
          <li>Dacă propunerea este respinsă, poți propune o nouă dată ținând cont de motivul respingerii.</li>
        </ol>
      </div>
    </div>
  );
};

export default GroupLeaderDashboard;

// Stiluri CSS pentru noile componente
const styles = `
.error-container {
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #721c24;
}

.error-message h3 {
  margin-top: 0;
  color: #721c24;
}

.error-help {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
}

.error-help h4 {
  margin-top: 0;
  color: #856404;
}

.error-help ol {
  margin-bottom: 0;
  padding-left: 20px;
}

.error-help li {
  margin-bottom: 8px;
}

.group-leader-dashboard {
  padding: 20px;
}

.notification {
  padding: 10px 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.notification.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.close-notification {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
}

.disciplines-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.disciplines-table th, .disciplines-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.disciplines-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.discipline-row.approved {
  background-color: rgba(40, 167, 69, 0.1);
}

.discipline-row.rejected {
  background-color: rgba(220, 53, 69, 0.1);
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
}

.status-badge.pending, .status-badge.pending_approval {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.submit-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.submit-button:hover {
  background-color: #0069d9;
}

.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.proposal-modal {
  background-color: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.proposal-modal h3 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.discipline-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.rejection-reason {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff3cd;
  border-radius: 4px;
  border-left: 4px solid #ffc107;
}

.reason-text {
  font-style: italic;
}

.date-time-inputs {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.date-display {
  padding: 5px 0;
}

.no-date {
  color: #6c757d;
  font-style: italic;
}

.tooltip {
  position: relative;
  display: inline-block;
  margin-left: 5px;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #17a2b8;
  color: white;
  font-style: normal;
  font-size: 12px;
  cursor: help;
}

.tooltip-text {
  visibility: hidden;
  width: 200px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -100px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
`;

// Adăugăm stilurile în document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
