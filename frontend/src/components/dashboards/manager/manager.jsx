
import { useState } from 'react';

const ManagerDashboard = () => {

    const [formData, setFormData] = useState({
        serviceType: 'Basic',
        numRooms: 1,
        serviceDate: '',
        serviceAddress: '',
        clientBudget: '',
        addOutdoor: false,
        photos: []
    });

    const submittedRequests = [
        {
            id: 1,
            date: "2025-01-12",
            services: "Basic",
            address: '',
            rooms: 3,
            outdoor: false,
            quote: "$280",
            budget: "$250",
            photos: []
        },
        {
            id: 1,
            date: "2025-01-12",
            services: "Deep Clean",
            address: '',
            rooms: 5,
            outdoor: true,
            quote: "$390",
            budget: "$350",
            photos: []
        },
        {
            id: 1,
            date: "2025-01-12",
            services: "Move Out",
            address: '',
            rooms: 6,
            outdoor: true,
            quote: "$400",
            budget: "$400",
            photos: []
        }
    ];

    return (

        <div className='manager-dashboard-container'>
            <div className='manager-welcome'>
                <h2>Manager Dashboard</h2>
                <p>Welcome, Manager!</p>
            </div>


        </div>
    )

}

export default ManagerDashboard;
