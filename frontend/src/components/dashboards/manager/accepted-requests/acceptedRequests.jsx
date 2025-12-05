


import { useState, useEffect } from "react";
import { RequestsAPI } from "../../../../api.js";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import FilterTable from "../filter-bar/filterBar.jsx";

import "../managerWindow.css";

const AcceptedRequests = () => {
  const [completed, setCompleted] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchCompleted = async () => {
      const data = await RequestsAPI.getByStatus("completed");
      setCompleted(data);
  };

  useEffect(() => {
    fetchCompleted();
  }, []);

  const handleMarkAsPaid = async (id) => {
    await RequestsAPI.markAsPaid(id);
    
    // refresh completed requests to update table & modal
    const data = await RequestsAPI.getByStatus('completed');
    setCompleted(data);

    // upate modal state if open
    setSelectedRequest((prev) => (prev ? { ...prev, isPaid: true } : null));
  };

  // Table snapshot columns
  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Service Type", key: "serviceType", filterType: "text" },
    { label: "Completion Date", key: "completionDate", filterType: "date" },
    { label: "Quoted Price", key: "managerQuote", filterType: "number" },
    { label: "Paid Status", 
      key: "isPaid", 
      filterType: "text", 
      render: (val) => 
        val ? (
          <span className="status-badge status-paid">PAID</span>
        ) : (
          <span className='status-badge status-unpaid'>UNPAID</span>
        )
    },
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
    { label: "Payment Status", key: "isPaid", render: (val) => (val ? "PAID" : "UNPAID") },
    { label: "Photos", key: "photos", render: (photos) =>
        photos && photos.length > 0
          ? `${photos.length} photo(s) uploaded`
          : "No photos"
      },
  ];

  return (
    <div className="manager-window-container">
      <h2>Completed Requests</h2>

      <FilterTable 
        columns={columns}
        data={completed} 
        onRowClick={setSelectedRequest} 
      />

      {selectedRequest && (
        <SubWindowModal
          title="Completed Request Details"
          data={selectedRequest}
          fields={modalFields}
          onClose={() => setSelectedRequest(null)}
          type="completed"
          actions={
            !selectedRequest.isPaid && (
              <button
                className='mark-paid-btn'
                onClick={() => handleMarkAsPaid(selectedRequest.id)}
              >
                Mark as Paid
              </button>
            )
          }
        />
      )}
      
    </div>
  );
};

export default AcceptedRequests;



