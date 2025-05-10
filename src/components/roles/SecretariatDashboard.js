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
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [examStats, setExamStats] = useState({ total: 0, completed: 0, incomplete: [] });
  
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
        const settingsResponse = await api.admin.getSettings();
        if (settingsResponse.exam_period) {
          setExamPeriod({
            start: settingsResponse.exam_period.start,
            end: settingsResponse.exam_period.end
          });
        }
        
        if (settingsResponse.colloquium_period) {
          setColloquiumPeriod({
            start: settingsResponse.colloquium_period.start,
            end: settingsResponse.colloquium_period.end
          });
        }
        
        // Fetch users to get group leaders (students)
        const usersResponse = await api.admin.getUsers();
        if (usersResponse.users) {
          const studentUsers = usersResponse.users.filter(user => user.role === 'student');
          setGroupLeaders(studentUsers);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching secretary data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Function to download Excel template
  const downloadTemplate = async (templateType) => {
    try {
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      let url;
      
      if (templateType === 'disciplines') {
        // Request the template from the backend
        const response = await fetch(`${api.API_URL}/secretary/templates/disciplines`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to download template');
        
        // Create a blob from the response
        const blob = await response.blob();
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'disciplines_template.xlsx';
      } else if (templateType === 'rooms') {
        // Request the template from the backend
        const response = await fetch(`${api.API_URL}/secretary/templates/rooms`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to download template');
        
        // Create a blob from the response
        const blob = await response.blob();
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'rooms_template.xlsx';
      }
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setNotification({
        show: true,
        message: `Template for ${templateType} downloaded successfully`,
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error downloading template:', error);
      setNotification({
        show: true,
        message: `Error downloading template: ${error.message}`,
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileUpload(file);
      // In a real application, you would process the file here
      console.log(`File uploaded: ${file.name}`);
    }
  };

  // Function to submit uploaded file
  const submitFile = async () => {
    if (fileUpload) {
      try {
        // Determine which endpoint to use based on file type or active tab
        let endpoint;
        if (activeTab === 'disciplines') {
          endpoint = '/admin/schedule/import';
        } else if (activeTab === 'rooms') {
          endpoint = '/admin/rooms/import';
        }
        
        if (!endpoint) {
          throw new Error('Invalid file type or tab');
        }
        
        // Upload file to the backend
        await api.uploadFile(endpoint, fileUpload);
        
        setNotification({
          show: true,
          message: `File ${fileUpload.name} uploaded successfully`,
          type: 'success'
        });
        
        // Refresh data after upload
        if (activeTab === 'disciplines') {
          // Refresh disciplines
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
        } else if (activeTab === 'rooms') {
          // Refresh rooms
          const roomsResponse = await api.student.getRooms();
          if (roomsResponse.rooms) {
            setRooms(roomsResponse.rooms);
          }
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
            <h2>Disciplines Management</h2>
            <div className="action-buttons">
              <button onClick={() => downloadTemplate('disciplines')}>Download Template</button>
              <button onClick={generateDisciplinesList}>Generate Disciplines List</button>
            </div>
            
            <div className="upload-section">
              <h3>Upload Disciplines Data</h3>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
              <button onClick={submitFile} disabled={!fileUpload}>Upload</button>
            </div>
            
            <div className="data-table">
              <h3>Current Disciplines</h3>
              <table>
                <thead>
                  <tr>
                    <th>Discipline</th>
                    <th>Program</th>
                    <th>Year</th>
                    <th>Group</th>
                    <th>Professor</th>
                    <th>Email</th>
                    <th>Exam Type</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplines.map(discipline => (
                    <tr key={discipline.id}>
                      <td>{discipline.name}</td>
                      <td>{discipline.program}</td>
                      <td>{discipline.year}</td>
                      <td>{discipline.group}</td>
                      <td>{discipline.professor}</td>
                      <td>{discipline.email}</td>
                      <td>{discipline.examType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <h2>Group Leaders Management</h2>
            <div className="action-buttons">
              <button onClick={() => downloadTemplate('groupLeaders')}>Download Template</button>
              <button onClick={notifyGroupLeaders}>Notify Group Leaders</button>
            </div>
            
            <div className="upload-section">
              <h3>Upload Group Leaders Data</h3>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
              <button onClick={submitFile} disabled={!fileUpload}>Upload</button>
            </div>
            
            <div className="data-table">
              <h3>Current Group Leaders</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Group</th>
                  </tr>
                </thead>
                <tbody>
                  {groupLeaders.map(leader => (
                    <tr key={leader.id}>
                      <td>{leader.name}</td>
                      <td>{leader.email}</td>
                      <td>{leader.group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
