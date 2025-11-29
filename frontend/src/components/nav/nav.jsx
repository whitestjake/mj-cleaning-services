
import { Link, useNavigate } from 'react-router-dom';


const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    setIsLoggedIn(false);
    navigate('/');
  }

    return (
    <nav id='navbar-container'>
      <h2 id='logo'>MJ</h2>

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


export default Navbar

