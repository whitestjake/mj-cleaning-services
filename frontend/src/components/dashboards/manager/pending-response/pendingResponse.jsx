

import { useState, useEffect } from "react";
import { RequestsAPI } from "../../../../api.js";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import FilterTable from "../filter-bar/filterBar.jsx";

import "../managerWindow.css";

const PendingResponses = () => {
  const [pending, setPending] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      const data = await RequestsAPI.getByStatus("pending_response");
      setPending(data);
    };
    fetchPending();
  }, []);

  // Table only shows snapshot
  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Manager Quote", key: "managerQuote", filterType: "number" },
    { label: "Scheduled Time", key: "scheduledTime", filterType: "date" },
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
    { label: "Manager Quote", key: "managerQuote" },
    { label: "Scheduled Time", key: "scheduledTime" },
    { label: "Manager Note", key: "managerNote" },
    { label: "Photos", key: "photos", render: (photos) =>
        photos && photos.length > 0
          ? `${photos.length} photo(s) uploaded`
          : "No photos"
      },
  ];

  return (
    <div className="manager-window-container">
      <h2>Pending Responses</h2>

      <FilterTable columns={columns} data={pending} onRowClick={setSelectedRequest} />

      {selectedRequest && (
        <SubWindowModal
          title="Pending Response Details"
          data={selectedRequest}
          fields={modalFields}
          onClose={() => setSelectedRequest(null)}
          type="pending"
        />
      )}
    </div>
  );
};

export default PendingResponses;




