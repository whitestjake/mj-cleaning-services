
import { Link, useNavigate } from 'react-router-dom';


const Navbar = ({ isLoggedIn, setIsLoggedIn, userRole }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  const goToDashboard = () => {
    if (userRole === "client") navigate('/client-dashboard')
    if (userRole === "manager") navigate('/manager-dashboard')
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
                  onClick={handleSignOut}
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

