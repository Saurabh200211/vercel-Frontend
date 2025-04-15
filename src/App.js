import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './App.css';
import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <div className="calendar-container">
          <Sidebar />
          <Calendar />
        </div>
      </div>
    </Provider>
  );
}

export default App;
