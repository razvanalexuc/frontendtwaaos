import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../../utils/api';

const TeacherDropdownTest = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        // Folosim noul endpoint pentru a obține lista de profesori de la API-ul USV
        const response = await api.external.getTeachers();
        
        if (response && response.assistants) {
          console.log('Profesori obținuți:', response.assistants);
          setTeachers(response.assistants);
        } else {
          setError('Nu s-au putut încărca datele profesorilor');
        }
      } catch (err) {
        console.error('Eroare la obținerea profesorilor:', err);
        setError('Eroare la obținerea listei de profesori');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleTeacherChange = (selectedOptions) => {
    console.log('Profesori selectați:', selectedOptions);
    setSelectedTeachers(selectedOptions || []);
  };

  return (
    <div className="teacher-dropdown-test" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Test Dropdown Profesori</h2>
      
      {loading ? (
        <p>Se încarcă lista de profesori...</p>
      ) : error ? (
        <div className="error-message" style={{ color: 'red', padding: '10px', background: '#ffeeee', borderRadius: '5px' }}>
          <p>{error}</p>
        </div>
      ) : (
        <div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Selectați profesori:
            </label>
            <Select
              isMulti
              name="teachers"
              options={teachers.map(teacher => ({
                value: teacher.id,
                label: teacher.name,
                data: teacher
              }))}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Selectați profesori..."
              noOptionsMessage={() => "Nu s-au găsit profesori"}
              onChange={handleTeacherChange}
              value={selectedTeachers}
            />
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Puteți căuta și selecta mai mulți profesori.
            </small>
          </div>

          {selectedTeachers.length > 0 && (
            <div className="selected-teachers" style={{ marginTop: '20px' }}>
              <h3>Profesori selectați:</h3>
              <ul>
                {selectedTeachers.map(teacher => (
                  <li key={teacher.value}>
                    {teacher.label} {teacher.data?.email && `(${teacher.data.email})`}
                    {teacher.data?.facultyName && ` - ${teacher.data.facultyName}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDropdownTest;
