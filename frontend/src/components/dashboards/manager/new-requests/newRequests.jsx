


import { useState } from "react";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";

import '../managerWindow.css';

const NewRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      clientName: "John Doe",
      serviceType: "Basic Cleaning",
      rooms: 3,
      outdoor: false,
      address: "123 Main St",
      notes: "Please bring eco-friendly materials",
      photos: [],
    },
    {
      id: 2,
      clientName: "Sarah Connor",
      serviceType: "Deep Clean",
      rooms: 5,
      outdoor: true,
      address: "455 Maple Ave",
      notes: "",
      photos: [],
    },
  ]);

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

    // remove from new requests
    setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));

    setSelectedRequest(null);
    alert("Response sent to the client!");
  };

  // --- Modal field configurations ---
  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Service Type", key: "serviceType" },
    { label: "Rooms", key: "rooms" },
    { label: "Outdoor Service", key: "outdoor", render: (v) => (v ? "Yes" : "No") },
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

  return (
    <div className="manager-window-container">
      <h2>New Cleaning Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Rooms</th>
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
              <td>{req.outdoor ? "Yes" : "No"}</td>
            </tr>
          ))}

          {requests.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                No new requests.
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




