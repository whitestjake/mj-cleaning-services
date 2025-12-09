import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';

import './App.css';

// primary web pages
import Home from './components/home/home.jsx';
import Login from './components/login/login.jsx';
import Register from './components/register/register.jsx';
import ClientDashboard from './components/dashboards/client/client.jsx';
import ManagerDashboard from './components/dashboards/manager/manager.jsx';
import ProtectedRoute from './components/protected-route/protectedRoute.jsx';


function App() {

  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          {/* Home, Login, Register apart of navbar */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* client and manager dashboards under protected routes */}
          <Route 
            path='/client-dashboard'
            element={
              <ProtectedRoute requiredRole="client" >
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route 
            path='/manager-dashboard'
            element={
              <ProtectedRoute requiredRole="manager" >
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
