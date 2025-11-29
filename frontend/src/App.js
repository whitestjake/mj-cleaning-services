
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import './App.css';
import Nav from './components/nav/nav.jsx';
import Home from './components/home/home.jsx';
import Login from './components/login/login.jsx';
import Register from './components/register/register.jsx';
import ClientDashboard from './components/dashboards/client/client.jsx';
import ManagerDashboard from './components/dashboards/manager/manager.jsx';



function App() {
  // for tracking logged in status
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  return (
    <div className="App">

      <Nav isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Routes>
        {/* Home, Login, Register apart of navbar */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path='/register' element={<Register setIsLoggedIn={setIsLoggedIn}/>} />
        {/* client and manager dashboards currently accessible 
        by two buttons in login */}
        <Route path='/client-dashboard' element={<ClientDashboard />}/>
        <Route path='/manager-dashboard' element={<ManagerDashboard />}/>
      </Routes>
  
    </div>
  );
}

export default App;
