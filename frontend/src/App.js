import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';

import './App.css';

// Page components
import Home from './components/home/home';
import Login from './components/login/login';
import Register from './components/register/register';
import ClientDashboard from './components/dashboards/client/client';
import ManagerDashboard from './components/dashboards/manager/manager';
import ProtectedRoute from './components/protected-route/protectedRoute';


function App() {

  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protected routes - require authentication */}
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
