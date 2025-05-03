import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
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

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch settings (which includes faculties)
        const settingsResponse = await api.admin.getSettings();
        if (settingsResponse.faculties) {
          setFaculties(settingsResponse.faculties);
        }
        
        // Fetch users
        const usersResponse = await api.admin.getUsers();
        if (usersResponse.users) {
          // Filter users by role
          const teacherUsers = usersResponse.users.filter(user => user.role === 'teacher');
          const secretaryUsers = usersResponse.users.filter(user => user.role === 'secretary');
          
          setTeachers(teacherUsers);
          setSecretaries(secretaryUsers);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChangePassword = async (e) => {
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
    
    try {
      await api.auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      
      alert('Parola a fost schimbată cu succes.');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert(`Eroare la schimbarea parolei: ${error.message}`);
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    
    // Validate faculty
    if (!newFaculty.fullName || !newFaculty.shortName) {
      alert('Vă rugăm să completați toate câmpurile.');
      return;
    }
    
    try {
      // Get current settings
      const currentSettings = await api.admin.getSettings();
      
      // Add new faculty to the faculties array
      const updatedFaculties = [...(currentSettings.faculties || []), {
        fullName: newFaculty.fullName,
        shortName: newFaculty.shortName
      }];
      
      // Update settings with new faculties array
      await api.admin.updateSettings({
        ...currentSettings,
        faculties: updatedFaculties
      });
      
      // Refresh faculties from server
      const updatedSettings = await api.admin.getSettings();
      setFaculties(updatedSettings.faculties || []);
      
      // Reset form
      setNewFaculty({
        fullName: '',
        shortName: ''
      });
      
      alert('Facultate adăugată cu succes!');
    } catch (error) {
      alert(`Eroare la adăugarea facultății: ${error.message}`);
    }
  };

  const handleUpdateFaculty = (id, field, value) => {
    // Update locally first for immediate UI feedback
    const updatedFaculties = faculties.map(faculty => 
      faculty.id === id ? { ...faculty, [field]: value } : faculty
    );
    setFaculties(updatedFaculties);
  };

  const handleSaveFaculty = async (id) => {
    const faculty = faculties.find(f => f.id === id);
    
    try {
      // Update faculty via API
      await api.admin.updateFaculty(id, faculty);
      
      alert(`Facultatea "${faculty.shortName}" a fost actualizată cu succes.`);
    } catch (error) {
      alert(`Eroare la actualizarea facultății: ${error.message}`);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    // Validate teacher
    if (!newTeacher.firstName || !newTeacher.lastName || !newTeacher.email || !newTeacher.facultyId) {
      alert('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newTeacher.email)) {
      alert('Vă rugăm să introduceți o adresă de email validă.');
      return;
    }
    
    try {
      // Create new user with teacher role
      const response = await api.admin.createUser({
        first_name: newTeacher.firstName,
        last_name: newTeacher.lastName,
        email: newTeacher.email,
        title: newTeacher.title || '',
        faculty_id: parseInt(newTeacher.facultyId),
        role: 'teacher',
        // Generate a temporary password or let the backend handle it
        password: 'TemporaryPassword123!' // This should be changed by the user on first login
      });
      
      // Refresh the teachers list
      const usersResponse = await api.admin.getUsers();
      if (usersResponse.users) {
        const teacherUsers = usersResponse.users.filter(user => user.role === 'teacher');
        setTeachers(teacherUsers);
      }
      
      // Reset form
      setNewTeacher({
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        facultyId: ''
      });
      
      alert('Cadru didactic adăugat cu succes!');
    } catch (error) {
      alert(`Eroare la adăugarea cadrului didactic: ${error.message}`);
    }
  };

  const handleAddSecretary = async (e) => {
    e.preventDefault();
    
    // Validate secretary
    if (!newSecretary.firstName || !newSecretary.lastName || !newSecretary.email || !newSecretary.facultyId) {
      alert('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSecretary.email)) {
      alert('Vă rugăm să introduceți o adresă de email validă.');
      return;
    }
    
    try {
      // Create new user with secretary role
      const response = await api.admin.createUser({
        first_name: newSecretary.firstName,
        last_name: newSecretary.lastName,
        email: newSecretary.email,
        title: newSecretary.title || '',
        faculty_id: parseInt(newSecretary.facultyId),
        role: 'secretary',
        // Generate a temporary password or let the backend handle it
        password: 'TemporaryPassword123!' // This should be changed by the user on first login
      });
      
      // Refresh the secretaries list
      const usersResponse = await api.admin.getUsers();
      if (usersResponse.users) {
        const secretaryUsers = usersResponse.users.filter(user => user.role === 'secretary');
        setSecretaries(secretaryUsers);
      }
      
      // Reset form
      setNewSecretary({
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        facultyId: ''
      });
      
      alert('Operator adăugat cu succes!');
    } catch (error) {
      alert(`Eroare la adăugarea operatorului: ${error.message}`);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest cadru didactic?')) {
      try {
        // Delete user via API
        await api.admin.updateUser(id, { active: false }); // Soft delete by setting active to false
        
        // Refresh the teachers list
        const usersResponse = await api.admin.getUsers();
        if (usersResponse.users) {
          const teacherUsers = usersResponse.users.filter(user => user.role === 'teacher');
          setTeachers(teacherUsers);
        }
        
        alert('Cadru didactic șters cu succes!');
      } catch (error) {
        alert(`Eroare la ștergerea cadrului didactic: ${error.message}`);
      }
    }
  };

  const handleDeleteSecretary = async (id) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest operator?')) {
      try {
        // Delete user via API
        await api.admin.updateUser(id, { active: false }); // Soft delete by setting active to false
        
        // Refresh the secretaries list
        const usersResponse = await api.admin.getUsers();
        if (usersResponse.users) {
          const secretaryUsers = usersResponse.users.filter(user => user.role === 'secretary');
          setSecretaries(secretaryUsers);
        }
        
        alert('Operator șters cu succes!');
      } catch (error) {
        alert(`Eroare la ștergerea operatorului: ${error.message}`);
      }
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
