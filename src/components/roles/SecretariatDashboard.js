import React, { useState } from 'react';
import './SecretariatDashboard.css';

// Mock data - would be replaced with actual API calls
const mockDisciplines = [
  { id: 1, name: 'Programare Web', program: 'Informatică', year: 2, group: 'A', professor: 'Prof. Ionescu', email: 'ionescu@usm.ro', examType: 'Examen' },
  { id: 2, name: 'Baze de Date', program: 'Informatică', year: 2, group: 'A', professor: 'Prof. Popescu', email: 'popescu@usm.ro', examType: 'Colocviu' },
];

const mockRooms = [
  { id: 1, name: 'C401', capacity: 30, building: 'Corp C' },
  { id: 2, name: 'C402', capacity: 25, building: 'Corp C' },
];

const mockGroupLeaders = [
  { id: 1, name: 'Ion Popescu', email: 'ion.popescu@student.usv.ro', group: 'Informatică 2A' },
  { id: 2, name: 'Maria Ionescu', email: 'maria.ionescu@student.usv.ro', group: 'Informatică 2B' },
];

const SecretariatDashboard = () => {
  const [activeTab, setActiveTab] = useState('disciplines');
  const [disciplines, setDisciplines] = useState(mockDisciplines);
  const [rooms, setRooms] = useState(mockRooms);
  const [groupLeaders, setGroupLeaders] = useState(mockGroupLeaders);
  const [examPeriod, setExamPeriod] = useState({ start: '', end: '' });
  const [colloquiumPeriod, setColloquiumPeriod] = useState({ start: '', end: '' });
  const [fileUpload, setFileUpload] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Function to download Excel template
  const downloadTemplate = (templateType) => {
    // In a real application, this would generate or fetch an Excel file
    console.log(`Downloading ${templateType} template`);
    setNotification({
      show: true,
      message: `Template for ${templateType} downloaded successfully`,
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
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
  const submitFile = () => {
    if (fileUpload) {
      // Process file upload logic would go here
      console.log(`Processing file: ${fileUpload.name}`);
      setNotification({
        show: true,
        message: `File ${fileUpload.name} uploaded successfully`,
        type: 'success'
      });
      setFileUpload(null);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to generate disciplines list
  const generateDisciplinesList = () => {
    // In a real application, this would call an API to fetch data from Orar
    console.log('Generating disciplines list');
    setNotification({
      show: true,
      message: 'Disciplines list generated successfully',
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Function to generate available rooms
  const generateRoomsList = () => {
    // In a real application, this would call an API to fetch data from Orar
    console.log('Generating rooms list');
    setNotification({
      show: true,
      message: 'Rooms list generated successfully',
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Function to notify group leaders
  const notifyGroupLeaders = () => {
    // In a real application, this would send emails to group leaders
    console.log('Notifying group leaders');
    setNotification({
      show: true,
      message: 'Group leaders notified successfully',
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Function to save exam period
  const saveExamPeriod = () => {
    console.log('Exam period saved:', examPeriod);
    setNotification({
      show: true,
      message: 'Exam period saved successfully',
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Function to save colloquium period
  const saveColloquiumPeriod = () => {
    console.log('Colloquium period saved:', colloquiumPeriod);
    setNotification({
      show: true,
      message: 'Colloquium period saved successfully',
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Function to download exam schedule as Excel
  const downloadExcelSchedule = () => {
    // In a real application, this would generate an Excel file
    console.log('Downloading exam schedule as Excel');
    setNotification({
      show: true,
      message: 'Exam schedule downloaded as Excel',
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Function to download exam schedule as PDF
  const downloadPdfSchedule = () => {
    // In a real application, this would generate a PDF file
    console.log('Downloading exam schedule as PDF');
    setNotification({
      show: true,
      message: 'Exam schedule downloaded as PDF',
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
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
              <p>Completed: 8/10 exams scheduled</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: '80%' }}></div>
              </div>
              <div className="incomplete-exams">
                <h4>Incomplete Exams:</h4>
                <ul>
                  <li>Programare Avansată - Informatică Anul 3</li>
                  <li>Inteligență Artificială - Informatică Anul 3</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretariatDashboard;
