

import { useState, useEffect } from "react";
import { RequestsAPI } from "../../../../api.js";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import FilterTable from "../filter-bar/filterBar.jsx";

import "../managerWindow.css";

const AwaitingCompletion = () => {
  const [queued, setQueued] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchQueued = async () => {
      const data = await RequestsAPI.getByStatus("awaiting_completion");
      setQueued(data);
    };
    fetchQueued();
  }, []);

  // Table snapshot columns
  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Service Type", key: "serviceType", filterType: "text" },
    { label: "Scheduled Time", key: "scheduledTime", filterType: "date" },
    { label: "Quoted Price", key: "managerQuote", filterType: "text" },
  ];

  // Modal fields show all relevant details
  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Number of Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Address", key: "serviceAddress" },
    { label: "Client Notes", key: "notes" },
    { label: "Scheduled Time", key: "scheduledTime" },
    { label: "Quoted Price", key: "managerQuote" },
    { label: "Manager Note", key: "managerNote" },
    { label: "Photos", key: "photos", render: (photos) =>
        photos && photos.length > 0
          ? `${photos.length} photo(s) uploaded`
          : "No photos"
      },
  ];

  const handleComplete = async () => {
    if (!selectedRequest) return;

    await RequestsAPI.move(
      selectedRequest.id,
      "awaiting_completion",
      "completed",
      { completionDate: new Date().toISOString().slice(0, 10) }
    );

    const refreshed = await RequestsAPI.getByStatus("awaiting_completion");
    setQueued(refreshed);
    setSelectedRequest(null);
  };

  return (
    <div className="manager-window-container">
      <h2>Awaiting Completion</h2>

      <FilterTable columns={columns} data={queued} onRowClick={setSelectedRequest} />

      {selectedRequest && (
        <SubWindowModal
          title="Awaiting Completion Details"
          data={selectedRequest}
          fields={modalFields}
          actions={
            <button className="modal-action" onClick={handleComplete}>
              Mark as Completed
            </button>
          }
          onClose={() => setSelectedRequest(null)}
          type="queued"
        />
      )}
    </div>
  );
};

export default AwaitingCompletion;


