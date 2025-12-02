


import { useState } from "react";
import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import "../managerWindow.css";

export const samplePendingResponses = [
  {
    id: 101,
    clientName: "John Doe",
    services: "Basic Cleaning",
    rooms: 3,
    outdoor: false,
    address: "123 Main St, Royal Oak MI",
    managerQuote: "$250",
    scheduledTime: "2025-12-05T10:00",
    managerNote: "Will arrive with 2 staff members",
    photos: [],
  },
  {
    id: 102,
    clientName: "Jane Smith",
    services: "Deep Clean",
    rooms: 5,
    outdoor: true,
    address: "456 Suburb Rd, Bloomfield Hills MI",
    managerQuote: "$390",
    scheduledTime: "2025-12-07T14:00",
    managerNote: "Client requested eco-friendly products",
    photos: [],
  },
  {
    id: 103,
    clientName: "Mark Johnson",
    services: "Move Out Cleaning",
    rooms: 4,
    outdoor: false,
    address: "789 Third Ave, Troy MI",
    managerQuote: "$320",
    scheduledTime: "2025-12-09T09:00",
    managerNote: "",
    photos: [],
  },
];

const PendingResponses = ({ pendingRequests }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fields = [
    { label: "Client Name", key: "clientName" },
    { label: "Service", key: "services" },
    { label: "Rooms", key: "rooms" },
    { label: "Outdoor", key: "outdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Address", key: "address" },
    { label: "Manager Quote", key: "managerQuote" },
    { label: "Scheduled Time", key: "scheduledTime" },
    { label: "Manager Note", key: "managerNote" },
  ];

  return (
    <div className="manager-window-container">
      <h2>Pending Responses</h2>

      <div className="table-wrapper">
        <table className="pending-responses-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Service</th>
              <th>Quote</th>
            </tr>
          </thead>

          <tbody>
            {/* replace with pendingRequests later */}
            {samplePendingResponses.map((req) => (
              <tr
                key={req.id}
                onClick={() => setSelectedRequest(req)}
              >
                <td>{req.clientName}</td>
                <td>{req.services}</td>
                <td>{req.managerQuote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <SubWindowModal
          title="Pending Response Details"
          data={selectedRequest}
          fields={fields}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

export default PendingResponses;



