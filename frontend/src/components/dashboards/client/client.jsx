
import { useState } from 'react';

const ClientDashboard = () => {

    const [selectedService, setSelectedService] = useState(0);

    const services = ['Basic', 'Deep Clean', 'Move Out'];



    return (
        <div id='client-dashboard-container'>

            <div id='client-welcome-container'>
                <h2>Client Dashboard</h2>
                <p>Welcome, Client!</p>
            </div>

            {/* offered services table */}
            <div id='client-services-table'>
                <table>
                    <caption>Available services</caption>
                    <thead>
                        <tr>
                            <th>Services</th>
                            <th>Details</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basic cleaning</td>
                            <td>vacuum, surface cleaning/disenfecting and laundry services</td>
                            <td>50 per room</td>
                        </tr>
                        <tr>
                            <td>Deep cleaning</td>
                            <td>Basic cleaning + carpet cleaning</td>
                            <td>70 per room</td>
                        </tr>
                        <tr>
                            <td>Move out cleaning</td>
                            <td>discounted deep cleaning services for all rooms</td>
                            <td>60 per room</td>
                        </tr>
                        <tr>
                            <td>Outdoor cleaning</td>
                            <td>gutters, siding, patio and outdoor windows</td>
                            <td>50 per hour</td>
                        </tr>
                        <tr>
                            <td>Yard services</td>
                            <td>lawn care, snow removal</td>
                            <td>30 per hour</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* service selector bar - adding sliding functionality later */}
            <div id='service-selector-container'>
                <div id='service-selector-options'>
                    {services.map((s, index) => (
                        <div
                            key={index}
                            id={`service-selector-option ${selectedService === index ? 'active': ''}`}
                            onClick={() => setSelectedService(index)}
                        >
                            {s}    
                        </div>
                    ))}

                </div>

            </div>

        </div>
    )

}

export default ClientDashboard;