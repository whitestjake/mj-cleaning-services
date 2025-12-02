


import { useState } from "react";
import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import "../managerWindow.css";

export const sampleCompletedRequests = [
  {
    id: 201,
    clientName: "Alice Williams",
    completionDate: "2025-11-25",
    services: "Basic Cleaning",
    rooms: 2,
    outdoor: false,
    address: "321 Oak St, Bloomfield Hills MI",
    budget: "$200",
    quote: "$210",
    note: "Arrived on time, client very satisfied",
    photos: [],
  },
  {
    id: 202,
    clientName: "Bob Brown",
    completionDate: "2025-11-28",
    services: "Deep Clean",
    rooms: 5,
    outdoor: true,
    address: "654 Pine Rd, Royal Oak MI",
    budget: "$350",
    quote: "$360",
    note: "Extra carpet cleaning requested",
    photos: [],
  },
  {
    id: 203,
    clientName: "Clara Evans",
    completionDate: "2025-11-30",
    services: "Move Out Cleaning",
    rooms: 6,
    outdoor: true,
    address: "987 Maple Ave, Troy MI",
    budget: "$400",
    quote: "$400",
    note: "Client happy with the timing",
    photos: [],
  },
];

const CompletedRequests = ({ completedRequests }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fields = [
    { label: "Client Name", key: "clientName" },
    { label: "Completion Date", key: "completionDate" },
    { label: "Service", key: "services" },
    { label: "Rooms", key: "rooms" },
    { label: "Outdoor", key: "outdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Address", key: "address" },
    { label: "Client Budget", key: "budget" },
    { label: "Quoted Price", key: "quote" },
    { label: "Manager Note", key: "note" },
  ];

  return (
    <div className="manager-window-container">
      <h2>Completed Requests</h2>

      <div className="table-wrapper">
        <table className="completed-request-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Completion Date</th>
              <th>Services Completed</th>
            </tr>
          </thead>

          <tbody>
            {/* replace with completedRequests later */}
            {sampleCompletedRequests.map((req) => (
              <tr key={req.id} onClick={() => setSelectedRequest(req)}>
                <td>{req.clientName}</td>
                <td>{req.completionDate}</td>
                <td>{req.services}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <SubWindowModal
          title="Completed Request Details"
          data={selectedRequest}
          fields={fields}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

export default CompletedRequests;



