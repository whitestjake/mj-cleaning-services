

import { useState } from 'react';
import './requestForm.css';

const RequestForm = () => {

    const [formData, setFormData] = useState({
        serviceType: 'Basic',
        numRooms: '',
        serviceDate: '',
        serviceAddress: '',
        clientBudget: '',
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
    if (formData.addYard) estimate += yardServices;
    if (formData.addOutdoor) estimate += outdoorServices;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // file access
    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);

        const total = formData.photos.length + files.length;
        if (total > 5) {
            alert("You can only upload **up to 5 photos total**.");
            return;
        }

        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...files]
        }));
    };

    const removePhoto = (index) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        const form = new FormData();

        // Append text fields
        for (const key in formData) {
            if (key !== "photos") {
                form.append(key, formData[key]);
            }
        }

        // Append photos
        formData.photos.forEach((photo, i) => {
            form.append("photos", photo);
        });

        const response = await fetch('/submit', {
            method: "POST",
            body: form
        });

        const data = await response.json();
        console.log(data);
    };

// for the backend later
// import multer from 'multer';
// const upload = multer({ dest: 'uploads/' });

// app.post('/submit', upload.array('photos', 5), (req, res) => {
//     console.log(req.body);       // text inputs
//     console.log(req.files);      // uploaded photos

//     res.json({ message: "OK" });
// });



    return (
        <div className='client-dashboard-container'>

            <div className='client-request-container'>
                <h3>Service Request</h3>

                {/* service selector bar */}
                <div className='service-selector'>
                    <div 
                        className='selector-highlight'
                        style={{
                            transform: `translateX(${services.indexOf(formData.serviceType) * 100}%)`
                        }}
                    />
                    {services.map(service => (
                        <button
                            key={service}
                            className={formData.serviceType === service ? "selected" : ""}
                            onClick={() => setFormData(prev => ({ ...prev, serviceType: service }))}
                        >
                            {service}
                        </button>
                    ))}
                </div>


                {/* client input form */}
                <div className='client-service-request'>
                    <input
                        type='text'
                        name='serviceAddress'
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
                        placeholder={
                            formData.serviceType === "Move Out"
                            ? "Requires all rooms"
                            : ""
                        }
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
                                name='addOutdoor'
                                checked={formData.addOutdoor}
                                onChange={handleChange}
                            />
                            Add Outdoor Cleaning (+$40/hr)
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

                    <div className='service-estimate'>
                        <p><strong>Estimated Cost:</strong> ${estimate}</p>
                    </div>
                </div>

                <div className='client-photo-upload'>
                    <h3>Upload Photos (max 5)</h3>

                    <input
                        type='file'
                        accept='image/*'
                        multiple
                        onChange={handlePhotoUpload}
                    />

                    <div className="photo-preview-container">
                        {formData.photos.map((photo, index) => (
                            <div className='photo-preview' key={index}>
                                <img src={URL.createObjectURL(photo)} alt="" />
                                <button onClick={() => removePhoto(index)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* NEW: submit button */}
                <button className="submit-request-btn" onClick={handleSubmit}>
                    Submit Request
                </button>
            </div>
        </div>
    );
};

export default RequestForm;

