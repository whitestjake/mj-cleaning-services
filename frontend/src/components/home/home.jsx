
import { useNavigate } from 'react-router-dom';


const Home = () => {

    const navigate = useNavigate();
 
    const loginRedirect = () => {
        navigate('/login')
    }

    const registerRedirect = () => {
        navigate('/register')
    }

    return (

        <div id='homepage-container'>

            <h1>
                Welcome to MJ Cleaning Services!
            </h1>

            <div id='home-services-table'>
                <table>
                    <caption>Services we offer!</caption>
                    <thead>
                        <tr>
                            <th>Services</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basic cleaning</td>
                            <td>50 per room</td>
                        </tr>
                        <tr>
                            <td>Deep cleaning</td>
                            <td>70 per room</td>
                        </tr>
                        <tr>
                            <td>
                                Move out cleaning <br />
                                <p id='move-out-subtext'>
                                    (deep cleaning)
                                </p>
                            </td>
                            <td>60 per room</td>
                        </tr>
                        <tr>
                            <td>
                                Outdoor cleaning <br />
                                <p id='outdoor-cleaning-subtext'>
                                (gutters, siding, etc.)
                                </p>
                            </td>
                            <td>50 per hour</td>
                        </tr>
                    </tbody>
                </table>
            </div>

                <div id='home-quote-container'>
                    <h2>
                        Interested in a quote? sign up or login now to submit a request!
                    </h2>

                    <div id='home-register-container'>
                        <h3>Register Here</h3>
                        <button 
                            type="submit"
                            id='register-redirect'
                            onClick={registerRedirect}
                        >
                            Register
                        </button>
                    </div>

                    <div id='home-login-container'>
                        <h3>Login Here</h3>
                        <button 
                            type="submit"
                            id='login-redirect'
                            onClick={loginRedirect}
                        >
                            login
                        </button>
                    </div>
                </div>


        </div>
    )
}


export default Home;