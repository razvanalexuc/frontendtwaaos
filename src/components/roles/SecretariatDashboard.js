import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './SecretariatDashboard.css';

const SecretariatDashboard = () => {
  const [activeTab, setActiveTab] = useState('disciplines');
  const [disciplines, setDisciplines] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [groupLeaders, setGroupLeaders] = useState([]);
  const [examPeriod, setExamPeriod] = useState({ start: '', end: '' });
  const [colloquiumPeriod, setColloquiumPeriod] = useState({ start: '', end: '' });
  const [fileUpload, setFileUpload] = useState(null);
  const [fileUploadType, setFileUploadType] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [examStats, setExamStats] = useState({ total: 0, completed: 0, incomplete: [] });
  
  // Filtre pentru șefi de grupă
  const [facultyFilter, setFacultyFilter] = useState('');
  const [studyProgramFilter, setStudyProgramFilter] = useState('');
  const [yearOfStudyFilter, setYearOfStudyFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  
  // Fetch data from API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch rooms
        const roomsResponse = await api.student.getRooms();
        if (roomsResponse.rooms) {
          setRooms(roomsResponse.rooms);
        }
        
        // Fetch pending reservations
        const pendingResponse = await api.secretary.getPendingReservations();
        if (pendingResponse.reservations) {
          setPendingReservations(pendingResponse.reservations);
        }
        
        // Fetch reservation history
        const historyResponse = await api.secretary.getReservationHistory();
        if (historyResponse.reservations) {
          setReservationHistory(historyResponse.reservations);
        }
        
        // Fetch exam statistics
        try {
          const statsResponse = await api.secretary.getExamStats();
          if (statsResponse) {
            setExamStats({
              total: statsResponse.total || 0,
              completed: statsResponse.completed || 0,
              incomplete: statsResponse.incomplete || []
            });
          }
        } catch (statsError) {
          console.warn('Could not fetch exam statistics:', statsError);
          // Inițializăm cu valori implicite dacă nu putem obține statisticile
          setExamStats({ total: 0, completed: 0, incomplete: [] });
        }
        
        // Fetch settings to get exam periods
        try {
          const settingsResponse = await api.admin.getSettings();
          if (settingsResponse && settingsResponse.exam_period) {
            setExamPeriod({
              start: settingsResponse.exam_period.start,
              end: settingsResponse.exam_period.end
            });
          }
          
          // Verificăm și perioada de colocvii
          if (settingsResponse && settingsResponse.colloquium_period) {
            setColloquiumPeriod({
              start: settingsResponse.colloquium_period.start,
              end: settingsResponse.colloquium_period.end
            });
          }
        } catch (error) {
          console.log('Nu s-au putut încărca setările administrative:', error.message);
          // Setăm valori implicite pentru perioada de examinare
          setExamPeriod({
            start: new Date().toISOString().split('T')[0], // Data curentă
            end: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0] // Data curentă + 30 zile
          });
          
          // Setăm valori implicite și pentru perioada de colocvii
          setColloquiumPeriod({
            start: new Date().toISOString().split('T')[0], // Data curentă
            end: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0] // Data curentă + 14 zile
          });
        }
        
        // Încărcăm șefii de grupă
        await fetchGroupLeaders();
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching secretary data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Funcția pentru încărcarea șefilor de grupă
  const fetchGroupLeaders = async () => {
    try {
      setLoading(true);
      
      // Construim parametrii pentru filtrare
      const params = {};
      if (facultyFilter) params.faculty = facultyFilter;
      if (studyProgramFilter) params.study_program = studyProgramFilter;
      if (yearOfStudyFilter) params.year_of_study = yearOfStudyFilter;
      if (groupFilter) params.group_name = groupFilter;
      if (semesterFilter) params.semester = semesterFilter;
      if (academicYearFilter) params.academic_year = academicYearFilter;
      
      try {
        // Încercăm să folosim endpoint-ul specific pentru secretariat
        const response = await api.secretary.getGroupLeaders(params);
        
        if (response && response.group_leaders) {
          setGroupLeaders(response.group_leaders);
        } else {
          // Dacă nu avem date de la endpoint, setăm o listă goală
          setGroupLeaders([]);
          console.log('Nu s-au găsit șefi de grupă pentru parametrii specificați.');
        }
      } catch (apiError) {
        console.error('Eroare la apelul API pentru șefi de grupă:', apiError.message);
        // Dacă endpoint-ul specific nu există, setăm o listă goală
        setGroupLeaders([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching group leaders:', error);
      setError('Failed to load group leaders. Please try again later.');
      setLoading(false);
    }
  };
  
  // Funcția pentru ștergerea unui șef de grupă
  const deleteGroupLeader = async (id) => {
    try {
      setLoading(true);
      
      // Confirmăm cu utilizatorul înainte de a șterge
      if (!window.confirm('Sunteți sigur că doriți să ștergeți acest șef de grupă?')) {
        setLoading(false);
        return;
      }
      
      console.log('Deleting group leader with ID:', id);
      
      // Apelăm API-ul pentru a șterge șeful de grupă
      await api.secretary.deleteGroupLeader(id);
      
      // Afișăm notificare de succes
      setNotification({
        show: true,
        message: 'Șeful de grupă a fost șters cu succes!',
        type: 'success'
      });
      
      // Reîmprospătăm lista de șefi de grupă
      await fetchGroupLeaders();
      
      setLoading(false);
    } catch (error) {
      console.error('Error deleting group leader:', error);
      setNotification({
        show: true,
        message: `Eroare la ștergerea șefului de grupă: ${error.message}`,
        type: 'error'
      });
      setLoading(false);
    }
  };

  // Funcție pentru descărcarea template-ului
  const downloadTemplate = async (templateType) => {
    try {
      setLoading(true);
      setNotification({ show: false, message: '', type: '' });
      
      // Determinăm endpoint-ul și numele fișierului în funcție de tipul de template
      let endpoint;
      let fileName;
      let successMessage;
      
      if (templateType === 'disciplines') {
        endpoint = '/api/secretary/templates/disciplines';
        fileName = 'disciplines_template.xlsx';
        successMessage = 'Template pentru discipline descărcat cu succes!';
        console.log('Downloading disciplines template...');
      } else if (templateType === 'groupLeaders') {
        endpoint = '/api/secretary/templates/group-leaders';
        fileName = 'group_leaders_template.xlsx';
        successMessage = 'Template pentru șefi de grupă descărcat cu succes!';
        console.log('Downloading group leaders template...');
      } else if (templateType === 'rooms') {
        endpoint = '/api/secretary/templates/rooms';
        fileName = 'rooms_template.xlsx';
        successMessage = 'Template pentru săli descărcat cu succes!';
        console.log('Downloading rooms template...');
      } else {
        throw new Error('Tip de template invalid');
      }
      
      // Construim URL-ul complet
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const fullEndpoint = `${apiUrl}${endpoint}`;
      console.log('Downloading template from:', fullEndpoint);
      
      // Facem cererea către server
      const response = await fetch(fullEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Verificăm dacă cererea a fost realizată cu succes
      if (!response.ok) {
        let errorMessage = 'Failed to download template';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        console.error('Template download error:', response.status, response.statusText);
        throw new Error(errorMessage);
      }
      
      // Creăm un blob din răspuns
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'bytes', 'Type:', blob.type);
      
      // Verificăm dacă blob-ul este valid
      if (blob.size === 0) {
        throw new Error('Template-ul descărcat este gol');
      }
      
      // Creăm un URL pentru blob și descărcăm fișierul
      const url = window.URL.createObjectURL(blob);
      console.log('Created URL:', url);
      
      // Creăm un element anchor temporar pentru a declanșa descărcarea
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      
      // Adăugăm elementul la DOM, declanșăm click și apoi îl eliminăm
      document.body.appendChild(a);
      a.click();
      
      // Curățăm resursele
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Afișăm notificarea de succes
      setNotification({
        show: true,
        message: successMessage,
        type: 'success'
      });
      
      // Ascundem notificarea după 3 secunde
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error(`Error downloading ${templateType} template:`, error);
      setNotification({
        show: true,
        message: `Eroare la descărcarea template-ului: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle file upload
  const handleFileUpload = (event) => {
    setFileUpload(event.target.files[0]);
  };

  // Function to submit uploaded file
  const submitFile = async () => {
    if (fileUpload) {
      try {
        setLoading(true);
        console.log('Uploading file of type:', fileUploadType);
        
        // Determine which endpoint to use based on file upload type
        let endpoint;
        let additionalData = {};
        
        if (fileUploadType === 'disciplines') {
          // Folosim endpoint-ul pentru importarea cursurilor
          endpoint = '/api/secretary/disciplines/import';
          console.log('Using secretary endpoint for disciplines import');
        } else if (fileUploadType === 'rooms') {
          endpoint = '/api/secretary/rooms/import';
        } else if (fileUploadType === 'group_leaders') {
          // Folosim endpoint-ul pentru încărcarea șefilor de grupă
          endpoint = '/api/secretary/group-leaders/upload';
          console.log('Using secretary endpoint for group leaders upload');
          // Adăugăm date suplimentare pentru șefi de grupă dacă este necesar
          additionalData = {
            faculty: facultyFilter || '',
            study_program: studyProgramFilter || '',
            year_of_study: yearOfStudyFilter || '',
            semester: semesterFilter || '',
            academic_year: academicYearFilter || ''
          };
        }
        
        if (!endpoint) {
          throw new Error('Tab invalid sau nesuportat pentru încărcarea fișierelor');
        }
        
        console.log('Uploading to endpoint:', endpoint);
        console.log('Additional data:', additionalData);
        
        // Folosim URL-ul complet pentru încărcarea fișierului
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const fullEndpoint = `${apiUrl}${endpoint}`;
        
        // Creăm FormData manual pentru a avea mai mult control
        const formData = new FormData();
        formData.append('file', fileUpload);
        
        // Adăugăm datele suplimentare la FormData
        for (const [key, value] of Object.entries(additionalData)) {
          if (value) formData.append(key, value);
        }
        
        // Facem cererea direct, fără a folosi api.uploadFile
        const response = await fetch(fullEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload error:', errorData);
          throw new Error(errorData.message || 'Eroare la încărcarea fișierului');
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        setNotification({
          show: true,
          message: `Fișierul ${fileUpload.name} a fost încărcat cu succes!`,
          type: 'success'
        });
        
        // Refresh data after upload
        if (activeTab === 'disciplines') {
          // Refresh disciplines
          const disciplinesResponse = await api.courses.getCourses();
          if (disciplinesResponse && disciplinesResponse.courses) {
            setDisciplines(disciplinesResponse.courses);
          }
        } else if (activeTab === 'rooms') {
          // Refresh rooms
          const roomsResponse = await api.student.getRooms();
          if (roomsResponse && roomsResponse.rooms) {
            setRooms(roomsResponse.rooms);
          }
        } else if (activeTab === 'groupLeaders') {
          // Refresh group leaders
          await fetchGroupLeaders();
        }
        
        setFileUpload(null);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
      } catch (error) {
        console.error('Error uploading file:', error);
        setNotification({
          show: true,
          message: `Error uploading file: ${error.message}`,
          type: 'error'
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
      }
    }
  };

  // Function to generate disciplines list
  const generateDisciplinesList = async () => {
    try {
      // Call the API to import schedule from USV
      await api.admin.importUsvSchedule();
      
      // Refresh disciplines data
      const usersResponse = await api.admin.getUsers();
      if (usersResponse.users) {
        const teacherUsers = usersResponse.users.filter(user => user.role === 'teacher');
        setDisciplines(teacherUsers.map(teacher => ({
          id: teacher.id,
          name: teacher.course_name || 'Unknown Course',
          program: teacher.program || 'Unknown Program',
          year: teacher.year || 1,
          group: teacher.group || 'A',
          professor: `${teacher.title || ''} ${teacher.first_name} ${teacher.last_name}`,
          email: teacher.email,
          examType: teacher.exam_type || 'Examen'
        })));
      }
      
      setNotification({
        show: true,
        message: 'Disciplines list generated successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error generating disciplines list:', error);
      setNotification({
        show: true,
        message: `Error generating disciplines list: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to generate available rooms
  const generateRoomsList = async () => {
    try {
      // Call the API to import rooms from USV
      await api.admin.importUsvSchedule({ rooms_only: true });
      
      // Refresh rooms data
      const roomsResponse = await api.student.getRooms();
      if (roomsResponse.rooms) {
        setRooms(roomsResponse.rooms);
      }
      
      setNotification({
        show: true,
        message: 'Rooms list generated successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error generating rooms list:', error);
      setNotification({
        show: true,
        message: `Error generating rooms list: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to notify group leaders
  const notifyGroupLeaders = async () => {
    try {
      // Call the API to notify group leaders
      await api.secretary.notifyGroupLeaders();
      
      setNotification({
        show: true,
        message: 'Group leaders notified successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error notifying group leaders:', error);
      setNotification({
        show: true,
        message: `Error notifying group leaders: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to save exam period
  const saveExamPeriod = async () => {
    try {
      // Validate dates
      if (!examPeriod.start || !examPeriod.end) {
        throw new Error('Please select both start and end dates');
      }
      
      // Get current settings
      const currentSettings = await api.admin.getSettings();
      
      // Update settings with new exam period
      await api.admin.updateSettings({
        ...currentSettings,
        exam_period: {
          start: examPeriod.start,
          end: examPeriod.end
        }
      });
      
      setNotification({
        show: true,
        message: 'Exam period saved successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving exam period:', error);
      setNotification({
        show: true,
        message: `Error saving exam period: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to save colloquium period
  const saveColloquiumPeriod = async () => {
    try {
      // Validate dates
      if (!colloquiumPeriod.start || !colloquiumPeriod.end) {
        throw new Error('Please select both start and end dates');
      }
      
      // Get current settings
      const currentSettings = await api.admin.getSettings();
      
      // Update settings with new colloquium period
      await api.admin.updateSettings({
        ...currentSettings,
        colloquium_period: {
          start: colloquiumPeriod.start,
          end: colloquiumPeriod.end
        }
      });
      
      setNotification({
        show: true,
        message: 'Colloquium period saved successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving colloquium period:', error);
      setNotification({
        show: true,
        message: `Error saving colloquium period: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to download exam schedule as Excel
  const downloadExcelSchedule = async () => {
    try {
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      
      // Request the Excel report from the backend
      const response = await fetch(`${api.API_URL}/secretary/reports/period?format=excel`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download report');
      
      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = 'exam_schedule.xlsx';
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setNotification({
        show: true,
        message: 'Exam schedule downloaded as Excel successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error downloading Excel schedule:', error);
      setNotification({
        show: true,
        message: `Error downloading Excel schedule: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to download exam schedule as PDF
  const downloadPdfSchedule = async () => {
    try {
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      
      // Request the PDF report from the backend
      const response = await fetch(`${api.API_URL}/secretary/reports/period?format=pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download report');
      
      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = 'exam_schedule.pdf';
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setNotification({
        show: true,
        message: 'Exam schedule downloaded as PDF successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error downloading PDF schedule:', error);
      setNotification({
        show: true,
        message: `Error downloading PDF schedule: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to download group leader template
  const downloadGroupLeaderTemplate = async () => {
    try {
      // Folosim URL-ul direct pentru a descărca template-ul
      const templateUrl = api.secretary.downloadGroupLeaderTemplate();
      window.open(templateUrl, '_blank');
    } catch (error) {
      console.error('Error downloading group leader template:', error);
      setNotification({
        show: true,
        message: 'Eroare la descărcarea template-ului pentru șefi de grupă.',
        type: 'error'
      });
    }
  };

  // Function to sync disciplines from Orar API
  const syncDisciplines = async () => {
    try {
      setLoading(true);
      setNotification({
        show: true,
        message: 'Se sincronizează disciplinele cu sistemul Orar...',
        type: 'info'
      });
      
      const response = await api.courses.syncCourses();
      
      if (response.status === 'success') {
        setNotification({
          show: true,
          message: `Sincronizare reușită! ${response.data.created} discipline create, ${response.data.updated} actualizate.`,
          type: 'success'
        });
        // Actualizăm lista de discipline
        const coursesResponse = await api.courses.getCourses();
        if (coursesResponse.status === 'success') {
          setDisciplines(coursesResponse.data);
        }
      } else {
        setNotification({
          show: true,
          message: response.message || 'Eroare la sincronizarea disciplinelor.',
          type: 'error'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error syncing disciplines:', error);
      setNotification({
        show: true,
        message: 'Eroare la sincronizarea disciplinelor. Încercați din nou.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  return (
    <div className="secretariat-dashboard">
      <h1>Secretariat Dashboard</h1>
      
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'disciplines' ? 'active' : ''} 
          onClick={() => setActiveTab('disciplines')}
        >
          Disciplines
        </button>
        <button 
          className={activeTab === 'rooms' ? 'active' : ''} 
          onClick={() => setActiveTab('rooms')}
        >
          Rooms
        </button>
        <button 
          className={activeTab === 'groupLeaders' ? 'active' : ''} 
          onClick={() => setActiveTab('groupLeaders')}
        >
          Group Leaders
        </button>
        <button 
          className={activeTab === 'examPeriods' ? 'active' : ''} 
          onClick={() => setActiveTab('examPeriods')}
        >
          Exam Periods
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''} 
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div className="dashboard-content">
        {/* Disciplines Tab */}
        {activeTab === 'disciplines' && (
          <div className="tab-content">
            <h2>Managementul Disciplinelor</h2>
            
            <div className="upload-section">
              <h3>Încărcare Fișier</h3>
              <input 
                id="file-upload"
                type="file" 
                accept=".xls,.xlsx,.csv" 
                onChange={handleFileUpload} 
                className="file-input"
              />
              <div className="file-type-selection">
                <label>Tip fișier:</label>
                <select 
                  value={fileUploadType} 
                  onChange={(e) => setFileUploadType(e.target.value)}
                >
                  <option value="">Selectați tipul</option>
                  <option value="disciplines">Discipline</option>
                  <option value="group_leaders">Șefi de grupă</option>
                </select>
              </div>
              <div className="upload-actions">
                <button onClick={submitFile} disabled={!fileUpload || loading}>
                  {loading ? 'Se încarcă...' : 'Încarcă Fișier'}
                </button>
                <button onClick={() => downloadTemplate('disciplines')} disabled={loading}>
                  Descarcă Template Discipline
                </button>
                <button onClick={() => downloadTemplate('groupLeaders')} disabled={loading}>
                  Descarcă Template Șefi Grupă
                </button>
                <button onClick={syncDisciplines} disabled={loading}>
                  Sincronizează cu Orar
                </button>
              </div>
            </div>
            
            <div className="disciplines-list">
              <h3>Lista Disciplinelor</h3>
              {disciplines.length === 0 ? (
                <p>Nu există discipline încă. Încărcați un fișier sau sincronizați cu Orar.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cod</th>
                      <th>Denumire</th>
                      <th>Profesor</th>
                      <th>Grupa</th>
                      <th>Program Studiu</th>
                      <th>An Studiu</th>
                      <th>Tip Examen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplines.map((discipline, index) => (
                      <tr key={index}>
                        <td>{discipline.code}</td>
                        <td>{discipline.name}</td>
                        <td>{discipline.teacher?.first_name} {discipline.teacher?.last_name}</td>
                        <td>{discipline.group_name}</td>
                        <td>{discipline.study_program}</td>
                        <td>{discipline.year_of_study}</td>
                        <td>{discipline.exam_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        
        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="tab-content">
            <h2>Examination Rooms</h2>
            <div className="action-buttons">
              <button onClick={generateRoomsList}>Generate Rooms List</button>
            </div>
            
            <div className="data-table">
              <h3>Available Rooms</h3>
              <table>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Capacity</th>
                    <th>Building</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td>{room.name}</td>
                      <td>{room.capacity}</td>
                      <td>{room.building}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Group Leaders Tab */}
        {activeTab === 'groupLeaders' && (
          <div className="tab-content">
            <h2>Managementul Șefilor de Grupă</h2>
            
            <div className="filter-section">
              <h3>Filtrare</h3>
              <div className="filters-grid">
                <div className="filter-item">
                  <label>Facultate:</label>
                  <input 
                    type="text" 
                    value={facultyFilter} 
                    onChange={(e) => setFacultyFilter(e.target.value)} 
                    placeholder="ex: FIESC"
                  />
                </div>
                <div className="filter-item">
                  <label>Program Studiu:</label>
                  <input 
                    type="text" 
                    value={studyProgramFilter} 
                    onChange={(e) => setStudyProgramFilter(e.target.value)} 
                    placeholder="ex: Calculatoare"
                  />
                </div>
                <div className="filter-item">
                  <label>An Studiu:</label>
                  <input 
                    type="number" 
                    value={yearOfStudyFilter} 
                    onChange={(e) => setYearOfStudyFilter(e.target.value)} 
                    placeholder="ex: 2"
                  />
                </div>
                <div className="filter-item">
                  <label>Grupă:</label>
                  <input 
                    type="text" 
                    value={groupFilter} 
                    onChange={(e) => setGroupFilter(e.target.value)} 
                    placeholder="ex: 3211A"
                  />
                </div>
                <div className="filter-item">
                  <label>Semestru:</label>
                  <input 
                    type="text" 
                    value={semesterFilter} 
                    onChange={(e) => setSemesterFilter(e.target.value)} 
                    placeholder="ex: 1"
                  />
                </div>
                <div className="filter-item">
                  <label>An Academic:</label>
                  <input 
                    type="text" 
                    value={academicYearFilter} 
                    onChange={(e) => setAcademicYearFilter(e.target.value)} 
                    placeholder="ex: 2024-2025"
                  />
                </div>
              </div>
              <button onClick={fetchGroupLeaders}>Aplică Filtre</button>
              <button onClick={() => {
                setFacultyFilter('');
                setStudyProgramFilter('');
                setYearOfStudyFilter('');
                setGroupFilter('');
                setSemesterFilter('');
                setAcademicYearFilter('');
                fetchGroupLeaders();
              }}>Resetează Filtre</button>
            </div>
            
            <div className="upload-section">
              <h3>Încărcare Șefi de Grupă</h3>
              <div className="upload-info">
                <p>Pentru a încărca șefi de grupă:</p>
                <ol>
                  <li>Descărcați template-ul de șefi de grupă de la secțiunea Discipline</li>
                  <li>Completați datele în template</li>
                  <li>Încărcați fișierul completat, selectând tipul "Șefi de grupă"</li>
                </ol>
              </div>
            </div>
            
            <div className="group-leaders-list">
              <h3>Lista Șefilor de Grupă</h3>
              {loading ? (
                <p>Se încarcă șefii de grupă...</p>
              ) : groupLeaders.length === 0 ? (
                <p>Nu există șefi de grupă care să corespundă filtrelor selectate.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Email</th>
                      <th>Grupă</th>
                      <th>Program Studiu</th>
                      <th>An Studiu</th>
                      <th>Facultate</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupLeaders.map((leader, index) => (
                      <tr key={index}>
                        <td>{`${leader.user.first_name} ${leader.user.last_name}`}</td>
                        <td>{leader.user.email}</td>
                        <td>{leader.group_name}</td>
                        <td>{leader.study_program}</td>
                        <td>{leader.year_of_study}</td>
                        <td>{leader.faculty}</td>
                        <td>
                          <button 
                            className="delete-button" 
                            onClick={() => deleteGroupLeader(leader.id)}
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
        
        {/* Exam Periods Tab */}
        {activeTab === 'examPeriods' && (
          <div className="tab-content">
            <h2>Examination Periods Configuration</h2>
            
            <div className="period-config">
              <h3>Exam Period</h3>
              <div className="date-inputs">
                <div>
                  <label>Start Date:</label>
                  <input 
                    type="date" 
                    value={examPeriod.start} 
                    onChange={(e) => setExamPeriod({...examPeriod, start: e.target.value})} 
                  />
                </div>
                <div>
                  <label>End Date:</label>
                  <input 
                    type="date" 
                    value={examPeriod.end} 
                    onChange={(e) => setExamPeriod({...examPeriod, end: e.target.value})} 
                  />
                </div>
              </div>
              <button onClick={saveExamPeriod}>Save Exam Period</button>
            </div>
            
            <div className="period-config">
              <h3>Colloquium Period</h3>
              <div className="date-inputs">
                <div>
                  <label>Start Date:</label>
                  <input 
                    type="date" 
                    value={colloquiumPeriod.start} 
                    onChange={(e) => setColloquiumPeriod({...colloquiumPeriod, start: e.target.value})} 
                  />
                </div>
                <div>
                  <label>End Date:</label>
                  <input 
                    type="date" 
                    value={colloquiumPeriod.end} 
                    onChange={(e) => setColloquiumPeriod({...colloquiumPeriod, end: e.target.value})} 
                  />
                </div>
              </div>
              <button onClick={saveColloquiumPeriod}>Save Colloquium Period</button>
            </div>
          </div>
        )}
        
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="tab-content">
            <h2>Examination Reports</h2>
            
            <div className="reports-section">
              <h3>Download Exam Schedule</h3>
              <div className="action-buttons">
                <button onClick={downloadExcelSchedule}>Download as Excel</button>
                <button onClick={downloadPdfSchedule}>Download as PDF</button>
              </div>
            </div>
            
            <div className="completion-status">
              <h3>Exam Schedule Completion Status</h3>
              {examStats.total > 0 ? (
                <>
                  <p>Completed: {examStats.completed}/{examStats.total} exams scheduled</p>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${(examStats.completed / examStats.total) * 100}%` }}
                    ></div>
                  </div>
                  {examStats.incomplete && examStats.incomplete.length > 0 && (
                    <div className="incomplete-exams">
                      <h4>Incomplete Exams:</h4>
                      <ul>
                        {examStats.incomplete.map((exam, index) => (
                          <li key={index}>{exam.name} - {exam.group}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p>No exam data available. Please check the connection to the server.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretariatDashboard;
