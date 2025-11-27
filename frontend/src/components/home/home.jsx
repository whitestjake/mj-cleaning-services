


const Home = () => {


    return (

        <div>

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
                                Move Out deep <br />
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
                        <tr>
                            <td>Yard services</td>
                            <td>30 per hour</td>
                        </tr>
                    </tbody>
                </table>

                <h2>
                    Interested in a quote? sign up now to submit a request!
                </h2>
            </div>


        </div>
    )
}


export default Home;