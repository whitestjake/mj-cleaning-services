
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import './App.css';

// primary web pages
import Home from './components/home/home.jsx';
import Login from './components/login/login.jsx';
import Register from './components/register/register.jsx';
import ClientDashboard from './components/dashboards/client/client.jsx';
import ManagerDashboard from './components/dashboards/manager/manager.jsx';


function App() {
  // for tracking logged in status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");


  return (
    <div className="App">

      <Routes>
        {/* Home, Login, Register apart of navbar */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole}/>} />
        <Route path='/register' element={<Register setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole}/>} />

        {/* client and manager dashboards currently accessible by two buttons in login */}
        <Route path='/client-dashboard' element={<ClientDashboard />}/>
        <Route path='/manager-dashboard' element={<ManagerDashboard />} />
        

      </Routes>
  
    </div>
  );
}

export default App;
