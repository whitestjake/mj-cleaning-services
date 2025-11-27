
import { Routes, Route } from 'react-router-dom';

import './App.css';
import Nav from './components/nav/nav.jsx';
import Home from './components/home/home.jsx';
import Login from './components/login/login.jsx';
import Register from './components/register/register.jsx';
import ClientDashboard from './components/dashboards/client/client.jsx';
import ManagerDashboard from './components/dashboards/manager/manager.jsx';



function App() {


  return (
    <div className="App">

      <Nav />

      <Routes>
        {/* Home, Login, Register apart of navbar */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        {/* client and manager dashboards currently accessible by adding path to URL */}
        <Route path='/client-dashboard' element={<ClientDashboard />}/>
        <Route path='/manager-dashboard' element={<ManagerDashboard />}/>
      </Routes>
  
    </div>
  );
}

export default App;
