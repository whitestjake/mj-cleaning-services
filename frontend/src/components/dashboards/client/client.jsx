

import { useState } from 'react';

import './client.css';
import RequestForm from './request-form/requestForm.jsx';
import PriorSubmits from './prior-submissions/priorSubmits.jsx';

const ClientDashboard = () => {

    // "request" or "submitted"
    const [activeTab, setActiveTab] = useState("request"); 



    return (
        <div className='client-dashboard-container'>

            <div className='client-welcome-container'>
                <h2>Client Dashboard</h2>
                <p>Welcome, Client!</p>
            </div>

            {/* offered services table */}
            <div className='client-services-table'>
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
                        <tr><td>Basic cleaning</td><td>vacuum, surface cleaning/disinfecting and laundry</td><td>$50/room</td></tr>
                        <tr><td>Deep cleaning</td><td>Basic + carpet cleaning</td><td>$70/room</td></tr>
                        <tr><td>Move out cleaning</td><td>discounted deep cleaning</td><td>$60/room</td></tr>
                        <tr><td>Outdoor cleaning</td><td>gutters, siding, windows</td><td>$40/hr</td></tr>
                    </tbody>
                </table>
            </div>


            <div className='client-tabs'>
                <div
                    className='tab-highlight'
                    style={{
                        transform: `translateX(${activeTab === 'request' ? 0 : 100}%)`
                    }}
                />

                <button
                    className={activeTab === "request" ? "selected" : ""}
                    onClick={() => setActiveTab("request")}
                >
                    New Request
                </button>

                <button
                    className={activeTab === "submitted" ? "selected" : ""}
                    onClick={() => setActiveTab("submitted")}
                >
                    Submitted Requests
                </button>
            </div>

            {/* this container controls tab switching within the dashboard */}
            <div className="client-tab-content">

                {/* This displays the "request" tab content */}
                {activeTab === "request" && (
                    <RequestForm />
                )}

                {/* This displays the "submitted" tab content */}
                {activeTab === "submitted" && (
                    <PriorSubmits />
                )}
            </div>

        </div>
    );
};

export default ClientDashboard;
