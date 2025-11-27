
import './App.css';
import { useState } from 'react';

import Nav from './components/nav/nav.jsx';
import Login from './components/login/login.jsx';
import Register from './components/register/register.jsx';

function App() {

  const [page, setPage] = useState('login');

  return (
    <div className="App">

      <Nav route={setPage} />

      {page === 'home' && <Login route={setPage} />}
      {page === 'login' && <Login route={setPage} />}
      {page === 'register' && <Register route={setPage} />}
  
    </div>
  );
}

export default App;
