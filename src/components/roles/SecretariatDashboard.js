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
  const [selectedExam, setSelectedExam] = useState(null);
  const [showPlanificaModal, setShowPlanificaModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  
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
        
        // Fetch teachers from USV API
        try {
          const teachersResponse = await api.external.getTeachers();
          if (teachersResponse && teachersResponse.assistants) {
            console.log('Profesori obținuți de la API-ul USV:', teachersResponse.assistants.length);
            setTeachers(teachersResponse.assistants);
          }
        } catch (error) {
          console.error('Eroare la obținerea profesorilor de la API-ul USV:', error);
        }
        
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
        
        // Încărcăm disciplinele
        await fetchCourses();
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching secretary data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Funcția pentru încărcarea disciplinelor
  const fetchCourses = async () => {
    try {
      // Construim parametrii pentru filtrare (dacă avem nevoie de filtre)
      const params = {};
      
      // Apelăm API-ul pentru a obține disciplinele
      const response = await api.courses.getCourses(params);
      
      if (response && response.data) {
        // Adăugăm profesorii de la API-ul USV la disciplinele din baza de date
        const enhancedDisciplines = response.data.map(discipline => {
          // Căutăm profesorul în lista de profesori de la API-ul USV
          let teacherName = discipline.teacher?.name || 'Nedefinit';
          
          // Dacă avem profesori încărcați de la API-ul USV
          if (teachers.length > 0) {
            // Folosim un seed bazat pe ID-ul disciplinei pentru a avea o distribuție consistentă
            // Doar pentru disciplinele care nu au profesor definit
            if (teacherName === 'Nedefinit') {
              const seed = discipline.id % teachers.length;
              teacherName = teachers[seed].name;
            } else {
              // Încercăm să găsim un profesor mai potrivit în lista de la API-ul USV
              // Căutăm după nume sau email
              const teacherObj = discipline.teacher;
              const lastName = teacherObj?.last_name;
              const firstName = teacherObj?.first_name;
              const email = teacherObj?.email;
              
              const matchingTeacher = teachers.find(t => 
                (email && t.email === email) || 
                (lastName && t.name.includes(lastName)) ||
                (firstName && t.name.includes(firstName))
              );
              
              if (matchingTeacher) {
                teacherName = matchingTeacher.name;
              }
            }
          }
          
          return {
            ...discipline,
            teacherName: teacherName
          };
        });
        
        setDisciplines(enhancedDisciplines);
      } else {
        // Dacă nu avem date, setăm o listă goală
        setDisciplines([]);
        console.log('Nu s-au găsit discipline.');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
    }
  };
  
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
      if (semesterFilter) params.current_semester = semesterFilter; // Corectăm numele parametrului pentru semestru
      if (academicYearFilter) params.academic_year = academicYearFilter;
      
      console.log('Parametri pentru filtrare șefi de grupă:', params);
      
      try {
        // Încercăm să folosim endpoint-ul specific pentru secretariat
        const response = await api.secretary.getGroupLeaders(params);
        console.log('Răspuns API pentru șefi de grupă:', response);
        
        // Verificăm diferite formate posibile de răspuns
        if (response && response.group_leaders) {
          // Format: { group_leaders: [...] }
          setGroupLeaders(response.group_leaders);
          console.log('Șefi de grupă încărcați (format 1):', response.group_leaders);
        } else if (response && response.data) {
          // Format: { status: 'success', data: [...] }
          setGroupLeaders(response.data);
          console.log('Șefi de grupă încărcați (format 2):', response.data);
        } else if (Array.isArray(response)) {
          // Format: [...]
          setGroupLeaders(response);
          console.log('Șefi de grupă încărcați (format 3):', response);
        } else {
          // Dacă nu avem date de la endpoint, setăm o listă goală
          setGroupLeaders([]);
          console.log('Nu s-au găsit șefi de grupă pentru parametrii specificați. Răspuns:', response);
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
      
      console.log('Trimit cerere DELETE la /api/group-leaders/' + id);
    // Apelăm API-ul pentru a șterge șeful de grupă - folosim direct delete pentru că ruta este pe alt controller
    await api.delete(`/api/group-leaders/${id}`);
      
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

  // Function to generate available rooms list from Orar USV API
  const generateRoomsList = async () => {
    try {
      setLoading(true);
      console.log('Generating rooms list from Orar USV API...');
      
      // Call the API to import rooms from USV Orar system
      const importResponse = await api.admin.importUsvSchedule({ 
        rooms_only: true,
        source: 'orar.usv.ro', // Specificăm sursa pentru a folosi API-ul Orar USV
        force_recreate: true // Forțăm ștergerea și recrearea tuturor sălilor pentru a actualiza corect proprietățile
      });
      
      console.log('Import response:', importResponse);
      
      // Refresh rooms data - folosim endpoint-ul pentru secretariat
      const roomsResponse = await api.secretary.getRooms();
      console.log('Rooms response:', roomsResponse); // Log complet pentru depanare
      
      if (roomsResponse && roomsResponse.rooms && roomsResponse.rooms.length > 0) {
        // Verificăm și procesăm fiecare sală pentru a ne asigura că toate proprietățile sunt corecte
        const processedRooms = roomsResponse.rooms.map(room => {
          console.log('Processing room:', room); // Log pentru fiecare sală
          return {
            id: room.id,
            name: room.name || 'N/A',
            capacity: room.capacity !== undefined ? room.capacity : 'N/A',
            building: room.building || 'N/A',
            floor: room.floor !== undefined ? room.floor : 'N/A',
            room_type: room.room_type || 'N/A',
            features: room.features || [],
            description: room.description || ''
          };
        });
        
        setRooms(processedRooms);
        console.log(`Loaded ${processedRooms.length} rooms from the database`);
        
        // Afișăm statistici despre sălile importate
        let successMessage = 'Lista de săli a fost generată cu succes din sistemul Orar USV';
        if (importResponse.stats) {
          const stats = importResponse.stats;
          successMessage += `\nSăli importate: ${stats.rooms_imported || 0}`;
          successMessage += `\nSăli actualizate: ${stats.rooms_updated || 0}`;
        }
        
        setNotification({
          show: true,
          message: successMessage,
          type: 'success'
        });
      } else {
        console.warn('No rooms found or invalid response format:', roomsResponse);
        setNotification({
          show: true,
          message: 'Lista de săli a fost generată, dar nu s-au găsit săli disponibile',
          type: 'warning'
        });
      }
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error generating rooms list from Orar USV:', error);
      setNotification({
        show: true,
        message: `Eroare la generarea listei de săli: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
      
      setLoading(false);
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
  const downloadExcelSchedule = () => {
    try {
      // Obținem token-ul de autentificare
      const token = localStorage.getItem('accessToken');
      
      // Creăm URL-ul pentru descărcare
      const downloadUrl = `http://localhost:5000/api/secretary/reports/period?format=excel&token=${token}`;
      
      // Deschidem URL-ul într-o fereastră nouă (sau tab) - browserul va gestiona descărcarea
      window.open(downloadUrl, '_blank');
      
      setNotification({
        show: true,
        message: 'Descărcarea planificării în Excel a început. Verificați folderul de descărcări.',
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
        message: `Eroare la descărcarea planificării în Excel: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to download exam schedule as PDF
  const downloadPdfSchedule = () => {
    try {
      // Obținem token-ul de autentificare
      const token = localStorage.getItem('accessToken');
      
      // Creăm URL-ul pentru descărcare
      const downloadUrl = `http://localhost:5000/api/secretary/reports/period?format=pdf&token=${token}`;
      
      // Deschidem URL-ul într-o fereastră nouă (sau tab) - browserul va gestiona descărcarea
      window.open(downloadUrl, '_blank');
      
      setNotification({
        show: true,
        message: 'Descărcarea planificării în PDF a început. Verificați folderul de descărcări.',
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
        message: `Eroare la descărcarea planificării în PDF: ${error.message}`,
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

  // Function to plan an exam
  const planificaExam = (exam) => {
    console.log('Planificare examen:', exam);
    setSelectedExam(exam);
    setShowPlanificaModal(true);
    
    // Show notification for now until the modal is implemented
    setNotification({
      show: true,
      message: `Planificare examen pentru ${exam.name}. Această funcționalitate va fi implementată în curând.`,
      type: 'info'
    });
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };
  
  // Function to notify about an exam
  const notificaExam = (exam) => {
    console.log('Notificare pentru examen:', exam);
    
    // Show notification
    setNotification({
      show: true,
      message: `Notificare trimisă pentru examenul ${exam.name}.`,
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
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
      
      // Parametrii pentru sincronizare
      const syncParams = {
        faculty: 'FIESC', // Valoare implicită pentru Facultatea de Inginerie Electrică și Știința Calculatoarelor
        study_program: studyProgramFilter || undefined,
        year_of_study: yearOfStudyFilter || undefined,
        semester: semesterFilter || undefined,
        group_name: groupFilter || undefined
      };
      
      console.log('Sending sync request with params:', syncParams);
      
      // Apelăm API-ul pentru sincronizare
      const response = await api.courses.syncCourses(syncParams);
      
      console.log('Sync response:', response);
      
      if (response.status === 'success') {
        // Calculăm statistici
        const results = response.results || {};
        const created = results.created || 0;
        const updated = results.updated || 0;
        const errors = results.errors || 0;
        
        setNotification({
          show: true,
          message: `Sincronizare reușită! ${created} discipline create, ${updated} actualizate, ${errors} erori.`,
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
        message: `Eroare la sincronizarea disciplinelor: ${error.message}`,
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
          Discipline
        </button>
        <button 
          className={activeTab === 'rooms' ? 'active' : ''} 
          onClick={() => setActiveTab('rooms')}
        >
          Săli Examinare
        </button>
        <button 
          className={activeTab === 'groupLeaders' ? 'active' : ''} 
          onClick={() => setActiveTab('groupLeaders')}
        >
          Șefi de grupă
        </button>
        <button 
          className={activeTab === 'examPeriods' ? 'active' : ''} 
          onClick={() => setActiveTab('examPeriods')}
        >
          Perioade Examinare
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''} 
          onClick={() => setActiveTab('reports')}
        >
          Rapoarte și Statistici
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div className="dashboard-content">
        {/* Disciplines Tab */}
        {activeTab === 'disciplines' && (
          <div className="tab-content">
            <h2>Managementul Disciplinelor</h2>
            
            <div className="upload-section">
              <h3>Încărcare fișier discipline</h3>
              <input 
                id="file-upload-disciplines"
                type="file" 
                accept=".xls,.xlsx,.csv" 
                onChange={e => { setFileUpload(e.target.files[0]); setFileUploadType('disciplines'); }}
                className="file-input"
              />
              <div className="upload-actions">
                <button onClick={submitFile} disabled={!fileUpload || fileUploadType !== 'disciplines' || loading}>
                  {loading ? 'Se încarcă...' : 'Încarcă fișier discipline'}
                </button>
                <button onClick={() => downloadTemplate('disciplines')} disabled={loading}>
                  Descarcă template discipline
                </button>
                <button onClick={syncDisciplines} disabled={loading}>
                  Sincronizează orar
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
                        <td>{discipline.teacherName || discipline.teacher?.name || 'Nedefinit'}</td>
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
            <h2>Managementul Sălilor de Examinare</h2>
            <div className="action-buttons">
              <button onClick={generateRoomsList}>Generează Lista de Săli</button>
              <p className="info-text">Apăsați butonul pentru a importa sălile disponibile din sistemul Orar USV.</p>
            </div>
            
            <div className="data-table">
              <h3>Săli Disponibile</h3>
              {rooms.length === 0 ? (
                <p>Nu există săli încă. Generați lista de săli folosind butonul de mai sus.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Sală</th>
                      <th>Capacitate</th>
                      <th>Clădire</th>
                      <th>Etaj</th>
                      <th>Tip Sală</th>
                      <th>Descriere</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room, index) => {
                      console.log(`Room ${index} data:`, JSON.stringify(room)); // Debug log pentru a vedea datele primite
                      return (
                        <tr key={room.id || index}>
                          <td>{room.name || 'N/A'}</td>
                          <td>
                            {room.capacity !== undefined && room.capacity !== null 
                              ? (typeof room.capacity === 'number' ? room.capacity : 'N/A') 
                              : 'N/A'}
                          </td>
                          <td>{room.building || 'N/A'}</td>
                          <td>
                            {room.floor !== undefined && room.floor !== null 
                              ? (typeof room.floor === 'number' ? room.floor : 'N/A') 
                              : 'N/A'}
                          </td>
                          <td>{room.room_type || 'N/A'}</td>
                          <td>{room.description || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        
        {/* Group Leaders Tab */}
        {activeTab === 'groupLeaders' && (
          <div className="tab-content">
            <h2>Managementul Șefilor de grupă</h2>
            
            <div className="upload-section">
              <h3>Încărcare șefi de grupă</h3>
              <input 
                id="file-upload-group-leaders"
                type="file" 
                accept=".xls,.xlsx,.csv" 
                onChange={e => { setFileUpload(e.target.files[0]); setFileUploadType('group_leaders'); }}
                className="file-input"
              />
              <div className="upload-actions">
                <button onClick={submitFile} disabled={!fileUpload || fileUploadType !== 'group_leaders' || loading}>
                  {loading ? 'Se încarcă...' : 'Încarcă fișier șefi de grupă'}
                </button>
                <button onClick={() => downloadTemplate('groupLeaders')} disabled={loading}>
                  Descarcă template șefi grupă
                </button>
              </div>
            </div>

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
            <h2>Configurare Perioade de Examinare</h2>
            <p className="info-text">Configurați perioadele permise pentru colocvii și examene. Alocarea datelor de examinare se poate face doar în limitele acestor perioade.</p>
            
            <div className="period-config">
              <div className="period-section">
                <h3>Perioada de Examene</h3>
                <div className="date-inputs">
                  <div className="date-input">
                    <label>Data de început:</label>
                    <input 
                      type="date" 
                      value={examPeriod.start} 
                      onChange={(e) => setExamPeriod({...examPeriod, start: e.target.value})}
                    />
                  </div>
                  <div className="date-input">
                    <label>Data de sfârșit:</label>
                    <input 
                      type="date" 
                      value={examPeriod.end} 
                      onChange={(e) => setExamPeriod({...examPeriod, end: e.target.value})}
                    />
                  </div>
                </div>
                <button onClick={saveExamPeriod} disabled={!examPeriod.start || !examPeriod.end || loading}>
                  {loading ? 'Se salvează...' : 'Salvează Perioada de Examene'}
                </button>
              </div>
              
              <div className="period-section">
                <h3>Perioada de Colocvii</h3>
                <div className="date-inputs">
                  <div className="date-input">
                    <label>Data de început:</label>
                    <input 
                      type="date" 
                      value={colloquiumPeriod.start} 
                      onChange={(e) => setColloquiumPeriod({...colloquiumPeriod, start: e.target.value})}
                    />
                  </div>
                  <div className="date-input">
                    <label>Data de sfârșit:</label>
                    <input 
                      type="date" 
                      value={colloquiumPeriod.end} 
                      onChange={(e) => setColloquiumPeriod({...colloquiumPeriod, end: e.target.value})}
                    />
                  </div>
                </div>
                <button onClick={saveColloquiumPeriod} disabled={!colloquiumPeriod.start || !colloquiumPeriod.end || loading}>
                  {loading ? 'Se salvează...' : 'Salvează Perioada de Colocvii'}
                </button>
              </div>
            </div>
            
            <div className="current-settings">
              <h3>Setări Curente</h3>
              <div className="settings-info">
                <p><strong>Perioada de Examene:</strong> {examPeriod.start && examPeriod.end ? 
                  `${new Date(examPeriod.start).toLocaleDateString('ro-RO')} - ${new Date(examPeriod.end).toLocaleDateString('ro-RO')}` : 
                  'Neconfigurata'}</p>
                <p><strong>Perioada de Colocvii:</strong> {colloquiumPeriod.start && colloquiumPeriod.end ? 
                  `${new Date(colloquiumPeriod.start).toLocaleDateString('ro-RO')} - ${new Date(colloquiumPeriod.end).toLocaleDateString('ro-RO')}` : 
                  'Neconfigurata'}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="tab-content">
            <h2>Rapoarte și Statistici</h2>
            
            <div className="reports-section">
              <h3>Rapoarte Planificare Examene</h3>
              <p className="info-text">Descărcați planificarea examenelor în diferite formate pentru a o distribui sau tipări.</p>
              <div className="report-actions">
                <div className="download-actions">
                  <button className="green-download" onClick={downloadExcelSchedule} disabled={loading}>
                    Descarcă Planificare în Excel
                  </button>
                  <button className="green-download" onClick={downloadPdfSchedule} disabled={loading}>
                    Descarcă Planificare în PDF
                  </button>
                </div>
              </div>
            </div>
            
            <div className="stats-section">
              <h3>Statistici Completare Examene</h3>
              <p className="info-text">Verificați gradul de completare a datelor de examen, cu sublinierea celor care încă nu au fost stabilite.</p>
              
              <div className="stats-info">
                <p><strong>Total Examene:</strong> {examStats.total}</p>
                <p><strong>Examene Planificate:</strong> {examStats.completed}</p>
                <p><strong>Examene Neplanificate:</strong> {examStats.total - examStats.completed}</p>
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{
                      width: `${examStats.total ? (examStats.completed / examStats.total) * 100 : 0}%`,
                      backgroundColor: examStats.total && examStats.completed === examStats.total ? '#4CAF50' : '#FFA500'
                    }}
                  ></div>
                </div>
                <p className="progress-text">
                  {examStats.total ? `${Math.round((examStats.completed / examStats.total) * 100)}% completat` : 'Nu există date'}
                </p>
              </div>
              
              {examStats.incomplete && examStats.incomplete.length > 0 && (
                <div className="incomplete-exams">
                  <h4>Examene Neplanificate:</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Disciplină</th>
                        <th>Cadru Didactic</th>
                        <th>Program Studiu</th>
                        <th>An/Grupă</th>
                        <th>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examStats.incomplete.map((exam, index) => (
                        <tr key={index} className="incomplete-exam-row">
                          <td>{exam.name}</td>
                          <td>{exam.teacher}</td>
                          <td>{exam.study_program}</td>
                          <td>{exam.year_of_study}/{exam.group_name}</td>
                          <td>
                            <button className="small-button" onClick={() => planificaExam(exam)}>Planifică</button>
                            <button className="small-button" onClick={() => notificaExam(exam)}>Notifică</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="notification-section">
              <h3>Notificare Șefi de Grupă</h3>
              <p className="info-text">Trimiteți notificări prin email către șefii de grupă despre planificarea examenelor.</p>
              <button onClick={notifyGroupLeaders} disabled={loading}>
                {loading ? 'Se trimit notificări...' : 'Notifică Șefii de Grupă'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretariatDashboard;
