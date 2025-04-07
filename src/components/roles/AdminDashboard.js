import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('faculties');
  const [faculties, setFaculties] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [secretaries, setSecretaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Admin credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // New faculty state
  const [newFaculty, setNewFaculty] = useState({
    fullName: '',
    shortName: ''
  });
  
  // New teacher state
  const [newTeacher, setNewTeacher] = useState({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    facultyId: ''
  });
  
  // New secretary state
  const [newSecretary, setNewSecretary] = useState({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    facultyId: ''
  });

  // Mock data - in a real application, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockFaculties = [
        {
          id: 1,
          fullName: 'Facultatea de Automatică și Calculatoare',
          shortName: 'AC'
        },
        {
          id: 2,
          fullName: 'Facultatea de Electronică, Telecomunicații și Tehnologia Informației',
          shortName: 'ETTI'
        }
      ];
      
      const mockTeachers = [
        {
          id: 1,
          firstName: 'Ion',
          lastName: 'Popescu',
          title: 'Prof. Dr.',
          email: 'ion.popescu@usm.ro',
          facultyId: 1
        },
        {
          id: 2,
          firstName: 'Maria',
          lastName: 'Ionescu',
          title: 'Conf. Dr.',
          email: 'maria.ionescu@usm.ro',
          facultyId: 1
        },
        {
          id: 3,
          firstName: 'Andrei',
          lastName: 'Georgescu',
          title: 'Prof. Dr.',
          email: 'andrei.georgescu@usm.ro',
          facultyId: 2
        }
      ];
      
      const mockSecretaries = [
        {
          id: 1,
          firstName: 'Elena',
          lastName: 'Vasilescu',
          title: 'Ing.',
          email: 'elena.vasilescu@usm.ro',
          facultyId: 1
        },
        {
          id: 2,
          firstName: 'Mihai',
          lastName: 'Dumitrescu',
          title: 'Ec.',
          email: 'mihai.dumitrescu@usm.ro',
          facultyId: 2
        }
      ];
      
      setFaculties(mockFaculties);
      setTeachers(mockTeachers);
      setSecretaries(mockSecretaries);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChangePassword = (e) => {
    e.preventDefault();
    
    // Validate password
    if (!currentPassword) {
      alert('Vă rugăm să introduceți parola curentă.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Parolele noi nu coincid.');
      return;
    }
    
    if (newPassword.length < 8) {
      alert('Parola nouă trebuie să aibă cel puțin 8 caractere.');
      return;
    }
    
    // In a real application, this would send the password change to the backend
    
    alert('Parola a fost schimbată cu succes.');
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAddFaculty = (e) => {
    e.preventDefault();
    
    // Validate faculty
    if (!newFaculty.fullName || !newFaculty.shortName) {
      alert('Vă rugăm să completați toate câmpurile.');
      return;
    }
    
    // In a real application, this would send the new faculty to the backend
    
    // Add to local state
    const newId = faculties.length > 0 ? Math.max(...faculties.map(f => f.id)) + 1 : 1;
    const faculty = {
      id: newId,
      fullName: newFaculty.fullName,
      shortName: newFaculty.shortName
    };
    
    setFaculties([...faculties, faculty]);
    
    // Reset form
    setNewFaculty({
      fullName: '',
      shortName: ''
    });
    
    alert('Facultatea a fost adăugată cu succes.');
  };

  const handleUpdateFaculty = (id, field, value) => {
    setFaculties(faculties.map(faculty => 
      faculty.id === id ? { ...faculty, [field]: value } : faculty
    ));
  };

  const handleSaveFaculty = (id) => {
    const faculty = faculties.find(f => f.id === id);
    
    // In a real application, this would send the updated faculty to the backend
    
    alert(`Facultatea "${faculty.shortName}" a fost actualizată cu succes.`);
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    
    // Validate teacher
    if (!newTeacher.firstName || !newTeacher.lastName || !newTeacher.email || !newTeacher.facultyId) {
      alert('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }
    
    if (!newTeacher.email.endsWith('@usm.ro')) {
      alert('Adresa de email trebuie să fie de tipul @usm.ro');
      return;
    }
    
    // In a real application, this would send the new teacher to the backend
    
    // Add to local state
    const newId = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
    const teacher = {
      id: newId,
      firstName: newTeacher.firstName,
      lastName: newTeacher.lastName,
      title: newTeacher.title || '',
      email: newTeacher.email,
      facultyId: parseInt(newTeacher.facultyId)
    };
    
    setTeachers([...teachers, teacher]);
    
    // Reset form
    setNewTeacher({
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      facultyId: ''
    });
    
    alert('Cadrul didactic a fost adăugat cu succes.');
  };

  const handleAddSecretary = (e) => {
    e.preventDefault();
    
    // Validate secretary
    if (!newSecretary.firstName || !newSecretary.lastName || !newSecretary.email || !newSecretary.facultyId) {
      alert('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }
    
    if (!newSecretary.email.endsWith('@usm.ro')) {
      alert('Adresa de email trebuie să fie de tipul @usm.ro');
      return;
    }
    
    // In a real application, this would send the new secretary to the backend
    
    // Add to local state
    const newId = secretaries.length > 0 ? Math.max(...secretaries.map(s => s.id)) + 1 : 1;
    const secretary = {
      id: newId,
      firstName: newSecretary.firstName,
      lastName: newSecretary.lastName,
      title: newSecretary.title || '',
      email: newSecretary.email,
      facultyId: parseInt(newSecretary.facultyId)
    };
    
    setSecretaries([...secretaries, secretary]);
    
    // Reset form
    setNewSecretary({
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      facultyId: ''
    });
    
    alert('Operatorul de secretariat a fost adăugat cu succes.');
  };

  const handleDeleteTeacher = (id) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest cadru didactic?')) {
      // In a real application, this would send the delete request to the backend
      
      setTeachers(teachers.filter(teacher => teacher.id !== id));
      
      alert('Cadrul didactic a fost șters cu succes.');
    }
  };

  const handleDeleteSecretary = (id) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest operator de secretariat?')) {
      // In a real application, this would send the delete request to the backend
      
      setSecretaries(secretaries.filter(secretary => secretary.id !== id));
      
      alert('Operatorul de secretariat a fost șters cu succes.');
    }
  };

  if (loading) {
    return <div className="loading">Se încarcă datele...</div>;
  }

  if (error) {
    return <div className="error">Eroare: {error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Panou Administrator</h2>
      <p>Bine ați venit în panoul de administrare! Aici puteți configura aplicația și gestiona utilizatorii.</p>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'faculties' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculties')}
        >
          Facultăți
        </button>
        <button 
          className={`tab-button ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          Cadre Didactice
        </button>
        <button 
          className={`tab-button ${activeTab === 'secretaries' ? 'active' : ''}`}
          onClick={() => setActiveTab('secretaries')}
        >
          Operatori Secretariat
        </button>
        <button 
          className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Cont Administrator
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'faculties' && (
          <div className="faculties-container">
            <h3>Gestionare Facultăți</h3>
            
            <div className="add-faculty-form">
              <h4>Adăugare Facultate Nouă</h4>
              <form onSubmit={handleAddFaculty}>
                <div className="form-group">
                  <label>Nume Complet:</label>
                  <input 
                    type="text" 
                    value={newFaculty.fullName}
                    onChange={(e) => setNewFaculty({...newFaculty, fullName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Nume Scurt:</label>
                  <input 
                    type="text" 
                    value={newFaculty.shortName}
                    onChange={(e) => setNewFaculty({...newFaculty, shortName: e.target.value})}
                    required
                  />
                </div>
                
                <button type="submit" className="add-button">Adaugă Facultate</button>
              </form>
            </div>
            
            <div className="faculties-list">
              <h4>Facultăți Existente</h4>
              {faculties.length === 0 ? (
                <p className="no-data">Nu există facultăți înregistrate.</p>
              ) : (
                <div className="faculty-cards">
                  {faculties.map(faculty => (
                    <div key={faculty.id} className="faculty-card">
                      <div className="form-group">
                        <label>Nume Complet:</label>
                        <input 
                          type="text" 
                          value={faculty.fullName}
                          onChange={(e) => handleUpdateFaculty(faculty.id, 'fullName', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Nume Scurt:</label>
                        <input 
                          type="text" 
                          value={faculty.shortName}
                          onChange={(e) => handleUpdateFaculty(faculty.id, 'shortName', e.target.value)}
                        />
                      </div>
                      
                      <button 
                        className="save-button"
                        onClick={() => handleSaveFaculty(faculty.id)}
                      >
                        Salvează Modificările
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'teachers' && (
          <div className="teachers-container">
            <h3>Gestionare Cadre Didactice</h3>
            
            <div className="add-teacher-form">
              <h4>Adăugare Cadru Didactic</h4>
              <form onSubmit={handleAddTeacher}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prenume:</label>
                    <input 
                      type="text" 
                      value={newTeacher.firstName}
                      onChange={(e) => setNewTeacher({...newTeacher, firstName: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Nume:</label>
                    <input 
                      type="text" 
                      value={newTeacher.lastName}
                      onChange={(e) => setNewTeacher({...newTeacher, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Titlu (ex. Prof. Dr.):</label>
                    <input 
                      type="text" 
                      value={newTeacher.title}
                      onChange={(e) => setNewTeacher({...newTeacher, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email (@usm.ro):</label>
                    <input 
                      type="email" 
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Facultate:</label>
                  <select 
                    value={newTeacher.facultyId}
                    onChange={(e) => setNewTeacher({...newTeacher, facultyId: e.target.value})}
                    required
                  >
                    <option value="">Selectați facultatea</option>
                    {faculties.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.fullName} ({faculty.shortName})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="add-button">Adaugă Cadru Didactic</button>
              </form>
            </div>
            
            <div className="teachers-list">
              <h4>Cadre Didactice Existente</h4>
              {teachers.length === 0 ? (
                <p className="no-data">Nu există cadre didactice înregistrate.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nume Complet</th>
                      <th>Email</th>
                      <th>Facultate</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(teacher => (
                      <tr key={teacher.id}>
                        <td>{teacher.title} {teacher.firstName} {teacher.lastName}</td>
                        <td>{teacher.email}</td>
                        <td>{faculties.find(f => f.id === teacher.facultyId)?.shortName || 'N/A'}</td>
                        <td>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                          >
                            Șterge
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'secretaries' && (
          <div className="secretaries-container">
            <h3>Gestionare Operatori Secretariat</h3>
            
            <div className="add-secretary-form">
              <h4>Adăugare Operator Secretariat</h4>
              <form onSubmit={handleAddSecretary}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prenume:</label>
                    <input 
                      type="text" 
                      value={newSecretary.firstName}
                      onChange={(e) => setNewSecretary({...newSecretary, firstName: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Nume:</label>
                    <input 
                      type="text" 
                      value={newSecretary.lastName}
                      onChange={(e) => setNewSecretary({...newSecretary, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Titlu (ex. Ing./Ec.):</label>
                    <input 
                      type="text" 
                      value={newSecretary.title}
                      onChange={(e) => setNewSecretary({...newSecretary, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email (@usm.ro):</label>
                    <input 
                      type="email" 
                      value={newSecretary.email}
                      onChange={(e) => setNewSecretary({...newSecretary, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Facultate:</label>
                  <select 
                    value={newSecretary.facultyId}
                    onChange={(e) => setNewSecretary({...newSecretary, facultyId: e.target.value})}
                    required
                  >
                    <option value="">Selectați facultatea</option>
                    {faculties.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.fullName} ({faculty.shortName})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="add-button">Adaugă Operator</button>
              </form>
            </div>
            
            <div className="secretaries-list">
              <h4>Operatori Existenți</h4>
              {secretaries.length === 0 ? (
                <p className="no-data">Nu există operatori de secretariat înregistrați.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nume Complet</th>
                      <th>Email</th>
                      <th>Facultate</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secretaries.map(secretary => (
                      <tr key={secretary.id}>
                        <td>{secretary.title} {secretary.firstName} {secretary.lastName}</td>
                        <td>{secretary.email}</td>
                        <td>{faculties.find(f => f.id === secretary.facultyId)?.shortName || 'N/A'}</td>
                        <td>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteSecretary(secretary.id)}
                          >
                            Șterge
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'account' && (
          <div className="account-container">
            <h3>Setări Cont Administrator</h3>
            
            <div className="change-password-form">
              <h4>Schimbare Parolă</h4>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Parola Curentă:</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Parola Nouă:</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Confirmare Parolă Nouă:</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button type="submit" className="save-button">Schimbă Parola</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
