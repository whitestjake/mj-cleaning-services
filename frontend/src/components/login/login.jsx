
// import { useState } from 'react';
// import { useAuth } from '../auth/auth.jsx';


const Login = () => {
    // const { login } = useAuth();
    // const [email, setEmail] = useState('');
    // const [password, setPassword] = useState('');
    // const [error, setError] = useState('');

    
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setError('');

    //     try {
    //         const res = await fetch('', {
    //             method: 'POST',
    //             headers: {'Content-Type': 'application/json'},
    //             body: JSON.stringify({email, password}),
    //         });

    //         if (!res.ok) {
    //             setError('Invalid email or password');
    //             return;
    //         }

    //         const data = await res.json();

    //         // data.token contains JWT, used by AuthProvider
    //         login(data.token);

    //     } catch (err) {
    //         console.error(err);
    //         setError('Something went wrong');
    //     }

    // };



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

                <button type="submit">Login</button>

            </form>

        </div>
)};


export default Login;