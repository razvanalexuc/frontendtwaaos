import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const TeacherAdminPanel = () => {
  // State pentru adăugare profesor
  const [teacherData, setTeacherData] = useState({
    email: 'teacher.test@usm.ro',
    first_name: 'Test',
    last_name: 'Teacher',
    academic_title: 'Conf. Dr.'
  });
  
  // State pentru cursuri
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State pentru propunere examen
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [proposalDate, setProposalDate] = useState('');
  const [proposalTime, setProposalTime] = useState('12:00');
  
  // State pentru mesaje
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Încărcăm cursurile disponibile
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.courses.getCourses();
        if (response && (response.courses || response.data)) {
          const coursesData = response.courses || response.data || [];
          setCourses(coursesData);
          
          // Selectăm primul curs din listă dacă există
          if (coursesData.length > 0) {
            setSelectedCourseId(coursesData[0].id);
          }
        }
      } catch (err) {
        console.error('Eroare la încărcarea cursurilor:', err);
        setError('Nu s-au putut încărca cursurile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Funcție pentru adăugarea profesorului
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.teacherManagement.addTeacher(teacherData);
      setMessage({
        text: `Profesor adăugat cu succes: ${response.data.name}`,
        type: 'success'
      });
      
      // Resetăm formularul după 3 secunde
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      
    } catch (err) {
      console.error('Eroare la adăugarea profesorului:', err);
      setMessage({
        text: `Eroare: ${err.message || 'Nu s-a putut adăuga profesorul'}`,
        type: 'error'
      });
    }
  };
  
  // Funcție pentru adăugarea propunerii de examen
  const handleAddExamProposal = async (e) => {
    e.preventDefault();
    
    if (!selectedCourseId || !proposalDate || !proposalTime) {
      setMessage({
        text: 'Toate câmpurile sunt obligatorii',
        type: 'error'
      });
      return;
    }
    
    try {
      const response = await api.teacherManagement.addExamProposal({
        course_id: selectedCourseId,
        proposed_date: proposalDate,
        proposed_time: proposalTime
      });
      
      setMessage({
        text: `Propunere adăugată cu succes pentru cursul: ${response.data.course_name}`,
        type: 'success'
      });
      
      // Resetăm formularul după 3 secunde
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        setProposalDate('');
        setProposalTime('12:00');
      }, 3000);
      
    } catch (err) {
      console.error('Eroare la adăugarea propunerii:', err);
      setMessage({
        text: `Eroare: ${err.message || 'Nu s-a putut adăuga propunerea'}`,
        type: 'error'
      });
    }
  };
  
  return (
    <div className="teacher-admin-panel" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Panou Administrare Profesori</h2>
      
      {message.text && (
        <div 
          className={`message ${message.type}`} 
          style={{ 
            padding: '10px', 
            marginBottom: '20px', 
            borderRadius: '5px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message.text}
        </div>
      )}
      
      <div className="panel-section" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Adaugă Profesor</h3>
        <form onSubmit={handleAddTeacher}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input 
              type="email" 
              value={teacherData.email} 
              onChange={(e) => setTeacherData({...teacherData, email: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Prenume:</label>
            <input 
              type="text" 
              value={teacherData.first_name} 
              onChange={(e) => setTeacherData({...teacherData, first_name: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nume:</label>
            <input 
              type="text" 
              value={teacherData.last_name} 
              onChange={(e) => setTeacherData({...teacherData, last_name: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Titlu Academic:</label>
            <input 
              type="text" 
              value={teacherData.academic_title} 
              onChange={(e) => setTeacherData({...teacherData, academic_title: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '10px 15px', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Adaugă Profesor
          </button>
        </form>
      </div>
      
      <div className="panel-section" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Adaugă Propunere Examen</h3>
        
        {loading ? (
          <p>Se încarcă cursurile...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <form onSubmit={handleAddExamProposal}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Curs:</label>
              <select 
                value={selectedCourseId} 
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              >
                <option value="">Selectează un curs</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.group_name})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Data propusă:</label>
              <input 
                type="date" 
                value={proposalDate} 
                onChange={(e) => setProposalDate(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Ora propusă:</label>
              <input 
                type="time" 
                value={proposalTime} 
                onChange={(e) => setProposalTime(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            
            <button 
              type="submit" 
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '10px 15px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Adaugă Propunere
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeacherAdminPanel;
