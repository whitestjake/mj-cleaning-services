
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider.jsx';


const Navbar = () => {

  const {isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "client") navigate('/client-dashboard')
    if (user.role === "manager") navigate('/manager-dashboard')
  }

    return (
    <nav id='navbar-container'>
      <h2 id='logo'>AJ</h2>

      <ul id='navbar-links'>
        <li><Link to='/'>Home</Link></li>

          {!isLoggedIn && (
            <>
              <li><Link to='/login'>Login</Link></li>
              <li><Link to='/register'>Register</Link></li>
            </>
          )}

          {isLoggedIn && (
            <>
              <li>
                <button
                  onClick={goToDashboard}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  id='signout-btn' 
                  onClick={() => { logout(); navigate('/'); }}
                >
                  Sign Out
                </button>
              </li>
            </>
          )}
      </ul>
    </nav>
  );
}


export default Navbar;

