
import { Routes, Route } from 'react-router-dom';

import './App.css';
import Nav from './components/nav/nav.jsx';
import Home from './components/home/home.jsx';
import Login from './components/login/login.jsx';
import Register from './components/register/register.jsx';

function App() {


  return (
    <div className="App">

      <Nav />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
  
    </div>
  );
}

export default App;
