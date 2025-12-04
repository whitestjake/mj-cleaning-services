


import { useState, useEffect } from "react";
import { RequestsAPI } from "../../../../api.js";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import FilterTable from "../filter-bar/filterBar.jsx";

import "../managerWindow.css";

const AcceptedRequests = () => {
  const [completed, setCompleted] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchCompleted = async () => {
      const data = await RequestsAPI.getByStatus("completed");
      setCompleted(data);
    };
    fetchCompleted();
  }, []);

  // Table snapshot columns
  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Service Type", key: "serviceType", filterType: "text" },
    { label: "Completion Date", key: "completionDate", filterType: "date" },
    { label: "Quoted Price", key: "managerQuote", filterType: "text" },
  ];

  // Modal fields show full details
  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Number of Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Address", key: "serviceAddress" },
    { label: "Client Notes", key: "notes" },
    { label: "Completion Date", key: "completionDate" },
    { label: "Quoted Price", key: "managerQuote" },
    { label: "Manager Note", key: "managerNote" },
    { label: "Status", key: "status" },
    { label: "Photos", key: "photos", render: (photos) =>
        photos && photos.length > 0
          ? `${photos.length} photo(s) uploaded`
          : "No photos"
      },
  ];

  return (
    <div className="manager-window-container">
      <h2>Completed Requests</h2>

      <FilterTable columns={columns} data={completed} onRowClick={setSelectedRequest} />

      {selectedRequest && (
        <SubWindowModal
          title="Completed Request Details"
          data={selectedRequest}
          fields={modalFields}
          onClose={() => setSelectedRequest(null)}
          type="completed"
        />
      )}
    </div>
  );
};

export default AcceptedRequests;



