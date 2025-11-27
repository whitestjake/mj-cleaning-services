


const Register = ({route}) => {

 

    return (
        <div>
            <h2>Register</h2>

            {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}

            <form /* onSubmit={handleSubmit} */>

                <label>Email</label>
                <input
                    type="email"
                    id='email'
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>First Name</label>
                <input
                    type="text"
                    id='first-name'
                    // value={firstName}
                    // onChange={(e) => setFirstName(e.target.value)}
                    required
                />

                <label>Last Name</label>
                <input
                    type="text"
                    id='last-name'
                    // value={lastName}
                    // onChange={(e) => setLastName(e.target.value)}
                    required
                />

                <label>Phone Number</label>
                <input
                    type="tel"
                    id='phone'
                    // value={phone}
                    // onChange={(e) => setPhone(e.target.value)}
                    required
                />

                <label>Password</label>
                <input
                    type='password'
                    id='password'
                    // value={password}
                    // onChange={(e) => setPassword(e.target.value)}
                    required 
                />

                <button type="submit">Login</button>

            </form>

        </div>
)};


export default Register;