
import { useNavigate } from 'react-router-dom';


const Login = ({ setIsLoggedIn, setUserRole }) => {

    const navigate = useNavigate();
 
    const handleClientLogin = () => {
        setIsLoggedIn(true)
        setUserRole('client')
        navigate('/client-dashboard')
    }

    const handleManagerLogin = () => {
        setIsLoggedIn(true)
        setUserRole('manager')
        navigate('/manager-dashboard')
    }


    return (
        <div>

            <h2>Login</h2>

            {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}

            <form /* onSubmit={handleSubmit} */>

                <label>Email</label>
                <input
                    type="email"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>
                <input
                    type='password'
                    // value={password}
                    // onChange={(e) => setPassword(e.target.value)}
                    required 
                />
                
                {/* two seperate buttons temporarily for easier navigation */}
                <button 
                    type="submit"
                    id='client-login'
                    onClick={handleClientLogin}
                >
                    Client Login
                </button>

                <button 
                    type="submit"
                    id='manager-login'
                    onClick={handleManagerLogin}
                >
                    Manager Login
                </button>

            </form>

        </div>
)};


export default Login;