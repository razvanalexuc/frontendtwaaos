import React, { useState } from 'react';
import './App.css';
import SecretariatApp from './components/SecretariatApp';

// Separate component for the original app functionality
function OriginalApp() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  const handleAddTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const handleToggleTodo = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  return (
    <div className="app-container">
      <h1>My React Application</h1>
      
      <div className="card">
        <h2>Welcome to my React App!</h2>
        <p>This is a simple React application created with Create React App.</p>
        
        <div className="counter">
          <h3>Counter: {count}</h3>
          <div className="button-group">
            <button onClick={decrement}>-</button>
            <button onClick={increment}>+</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>To-Do List</h2>
        <div className="todo-input-container">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="todo-input"
          />
          <button onClick={handleAddTodo} className="add-button">Add</button>
        </div>
        
        <ul className="todo-list">
          {todos.length === 0 ? (
            <li className="empty-message">No tasks yet. Add one above!</li>
          ) : (
            todos.map(todo => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <span 
                  className="todo-text" 
                  onClick={() => handleToggleTodo(todo.id)}
                >
                  {todo.text}
                </span>
                <button 
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

// Main App component
function App() {
  const [currentView, setCurrentView] = useState('secretariat');
  
  // Function to render the appropriate view based on the current selection
  const renderView = () => {
    switch (currentView) {
      case 'secretariat':
        return <SecretariatApp />;
      case 'original':
        return <OriginalApp />;
      default:
        return <SecretariatApp />;
    }
  };

  return (
    <div className="main-app">
      {/* View selector - can be removed or modified as needed */}
      <div className="view-selector">
        <button 
          className={currentView === 'secretariat' ? 'active' : ''}
          onClick={() => setCurrentView('secretariat')}
        >
          Secretariat View
        </button>
      </div>
      
      {/* Render the current view */}
      {renderView()}
    </div>
  );
}

export default App;
