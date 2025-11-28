
import { Link } from 'react-router-dom';


const Navbar = () => {

    return (
    <nav id='navbar-container'>
      <h2 id='logo'>MJ</h2>

      <ul id='navbar-links'>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/login'>Login</Link></li>
        <li><Link to='/register'>Register</Link></li>
      </ul>

    </nav>
  );
}



export default Navbar
