


import { useState, useEffect } from "react";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";

import '../managerWindow.css';

const NewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        // Filter for pending requests only and format for component
        const pendingRequests = data
          .filter(req => req.state === 'pending')
          .map(req => ({
            id: req.request_id,
            clientName: `${req.first_name} ${req.last_name}`,
            serviceType: req.serviceType,
            rooms: req.numRooms,
            outdoor: req.addOutdoor,
            address: req.service_address || 'Not specified',
            notes: req.note || '',
            photos: []
            email: req.email,
            phone: req.phone_number,
            budget: req.clientBudget,
            serviceDate: req.serviceDate,
            created_time: req.created_time
          }));
        setRequests(pendingRequests);
      } else {
        setError('Failed to load requests');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const [pendingResponses, setPendingResponses] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // --- Manager Input State ---
  const [managerQuote, setManagerQuote] = useState("");
  const [managerTime, setManagerTime] = useState("");
  const [managerNotes, setManagerNotes] = useState("");

  // --- When opening modal: reset manager fields ---
  const openModal = (req) => {
    setSelectedRequest(req);
    setManagerQuote("");
    setManagerTime("");
    setManagerNotes("");
  };

  // --- Submit back to client ---
  const handleSubmitResponse = () => {
    if (!managerQuote || !managerTime) {
      alert("Please enter a quote and a time window before sending.");
      return;
    }

    const updated = {
      ...selectedRequest,
      managerQuote,
      managerTime,
      managerNotes,
    };

    setPendingResponses((prev) => [...prev, updated]);


    setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));

    setSelectedRequest(null);
    alert("Response sent to the client!");
  };

  // --- Modal field configurations ---
  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Rooms", key: "rooms" },
    { label: "Outdoor Service", key: "outdoor", render: (v) => (v ? "Yes" : "No") },
    { label: "Service Date", key: "serviceDate", render: (v) => v ? new Date(v).toLocaleDateString() : 'Not specified' },
    { label: "Budget", key: "budget", render: (v) => v ? `$${v}` : 'No limit' },
    { label: "Address", key: "address" },
    { label: "Client Notes", key: "notes" },

    // Input fields for manager response
    {
      label: "Quote",
      key: "managerQuote",
      render: () => (
        <input
          type="text"
          value={managerQuote}
          onChange={(e) => setManagerQuote(e.target.value)}
          placeholder="$250"
        />
      ),
    },
    {
      label: "Scheduled Time Window",
      key: "managerTime",
      render: () => (
        <input
          type="datetime-local"
          value={managerTime}
          onChange={(e) => setManagerTime(e.target.value)}
        />
      ),
    },
    {
      label: "Notes to Client",
      key: "managerNotes",
      render: () => (
        <textarea
          value={managerNotes}
          onChange={(e) => setManagerNotes(e.target.value)}
          placeholder="Optional notes..."
        />
      ),
    },
  ];

  if (loading) return <div className="manager-window-container"><h2>Loading requests...</h2></div>;
  if (error) return <div className="manager-window-container"><h2>Error: {error}</h2></div>;

  return (
    <div className="manager-window-container">
      <h2>New Cleaning Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Rooms</th>
            <th>Date Requested</th>
            <th>Budget</th>
            <th>Outdoor</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr
              key={req.id}
              onClick={(e) => {
                if (e.target.tagName === "TD" || e.target.tagName === "TR") {
                  openModal(req);
                }
              }}
            >
              <td>{req.clientName}</td>
              <td>{req.serviceType}</td>
              <td>{req.rooms}</td>
              <td>{new Date(req.created_time).toLocaleDateString()}</td>
              <td>{req.budget ? `$${req.budget}` : 'No limit'}</td>
              <td>{req.outdoor ? "Yes" : "No"}</td>
            </tr>
          ))}

          {requests.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No new requests at this time.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {selectedRequest && (
        <SubWindowModal
          title="Respond to Client"
          data={selectedRequest}
          fields={modalFields}
          onClose={() => setSelectedRequest(null)}
          actions={
            <button onClick={handleSubmitResponse}>
              Send Response to Client
            </button>
          }
        />
      )}
    </div>
  );
};

export default NewRequests;




