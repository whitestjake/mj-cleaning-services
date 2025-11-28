
import { useState } from 'react';

import './client.css';

const ClientDashboard = () => {

    const [formData, setFormData] = useState({
        serviceType: 'Basic',
        numRooms: 1,
        serviceDate: '',
        serviceAddress: '',
        clientBudget: '',
        addYard: false,
        addOutdoor: false,
        photos: []
    });

    const services = ['Basic', 'Deep Clean', 'Move Out'];
    const yardServices = 40;
    const outdoorServices = 40;
    const prices = {
        'Basic': 50,
        'Deep Clean': 70,
        'Move Out': 60
    };
    let estimate = formData.numRooms * prices[formData.serviceType];
    if(formData.addYard) estimate += yardServices;
    if(formData.addOutdoor) estimate += outdoorServices;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(
            prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            })
        )
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.file);

        const total = formData.photos.length + files.length;

        if (total > 5) {
            alert('You may only upload up to 5 photos.')
            return;
        }

        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...files]
        }))
    };

    const removePhoto = (index) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }))
    };

    

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
                            <td>40 per hour</td>
                        </tr>
                        <tr>
                            <td>Yard services</td>
                            <td>lawn care, snow removal</td>
                            <td>40 per hour</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* service selector bar */}
            <div id='service-selector'>
                <div 
                    id='selector-highlight'
                    style={{ transform: `translateX(${services.indexOf(formData.serviceType) * 100}%)` }} 
                />

                {services.map(service => (
                    <button
                        key={service}
                        id={formData.serviceType === service ? "selected" : ""}
                        onClick={() => setFormData(prev => ({ ...prev, serviceType: service}))}
                    >
                        {service}
                    </button>
                ))}
            </div>

            {/* client input form */}
            <div id='client-service-request'>
                <h3>Service Request</h3>

                <label>Service Address</label>
                <input
                    type='text'
                    name='client-address'
                    placeholder='street, city, state, zip'
                    value={formData.serviceAddress}
                    onChange={handleChange}
                />

                <label>Number of Rooms</label>
                <input
                    type='number'
                    name='numRooms'
                    min='1'
                    value={formData.numRooms}
                    onChange={handleChange}
                />

                <label>Select Date</label>
                <input
                    type='date'
                    name='serviceDate'
                    value={formData.serviceDate}
                    onChange={handleChange}
                />

                <div>
                    <label>
                        <input
                            type='checkbox'
                            name='addYard'
                            checked={formData.addYard}
                            onChange={handleChange}
                        />
                        Add Yard Services (+$40/hr)
                    </label>

                    <label>
                        <input
                            type='checkbox'
                            name='addOutdoor'
                            checked={formData.addOutdoor}
                            onChange={handleChange}
                        />
                        Add Outdoor House Cleaning (+$40/hr)
                    </label>
                </div>

                <label>Budget Constraints?</label>
                <input
                    type='text'
                    name='clientBudget'
                    placeholder='"free" = surcharge'
                    value={formData.clientBudget}
                    onChange={handleChange}
                />


                <div id='service-estimate'>
                    <p><strong>Estimated Cost:</strong> ${estimate}</p>
                </div>
            </div>

            <div id='client-photo-upload'>
                <h3> Upload Photos (max 5)</h3>

                <input
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={handlePhotoUpload}
                />

                <div id="photo-preview-container">
                    {formData.photos.map((photo, index) => (
                        <div id='photo-preview' key={index}>
                            <img
                                src={URL.createObjectURL(photo)}
                                alt={`upload-${index}`}
                            />
                            <button
                                id="remove-photo-btn"
                                onClick={() => removePhoto(index)}
                            >
                                Remove
                            </button>
                        </div>    
                    ))}
                </div>
            </div>
        </div>
    )

}

export default ClientDashboard;
