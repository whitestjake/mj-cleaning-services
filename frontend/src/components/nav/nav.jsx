



const Navbar = ({route}) => {

    return (
    <nav >
      <h2>MJ Cleaning</h2>

      <ul >
        <li><button onClick={() => route("home")}>Home</button></li>
        <li><button onClick={() => route("login")}>Login</button></li>
        <li><button onClick={() => route("register")}>Register</button></li>
      </ul>
    </nav>
  );
}



export default Navbar
