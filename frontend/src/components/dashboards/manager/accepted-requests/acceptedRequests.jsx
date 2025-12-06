


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
    const data = await RequestsAPI.getByStatus('completed');
    setCompleted(data);
    setSelectedRequest((prev) => (prev ? { ...prev, isPaid: true } : null));
  };

  const handleRevise = async (id, revisedQuote, revisedNote) => {
    await RequestsAPI.reviseDisputedRequest(id, { managerQuote: revisedQuote, managerNote: revisedNote });
    const data = await RequestsAPI.getByStatus('completed');
    setCompleted(data);
    setSelectedRequest((prev) => (prev
      ? { ...prev, managerQuote: revisedQuote, managerNote: revisedNote, pendingRevision: true, isDisputed: false, disputeNote: "" }
      : null
    ));
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
      render: (val) => val ? <span className="status-badge status-paid">PAID</span> : <span className='status-badge status-unpaid'>UNPAID</span>
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
    { label: "Disputed", key: "isDisputed", render: (val, data) => val ? `YES — Note: ${data.disputeNote}` : "NO" },
    { label: "Pending Revision", key: "pendingRevision", render: (val) => val ? "YES" : "NO" },
    { label: "Photos", key: "photos", render: (photos) =>
        photos && photos.length > 0 ? `${photos.length} photo(s) uploaded` : "No photos"
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
            <>
              {/* Mark as Paid Button */}
              {!selectedRequest.isPaid && !selectedRequest.isDisputed && (
                <button
                  className='mark-paid-btn'
                  onClick={() => handleMarkAsPaid(selectedRequest.id)}
                >
                  Mark as Paid
                </button>
              )}

              {/* Revise Button + Inline Form */}
              {selectedRequest.isDisputed && !selectedRequest.pendingRevision && (
                <ReviseForm request={selectedRequest} handleRevise={handleRevise} />
              )}
            </>
          }
        />
      )}
    </div>
  );
};

// Inline form component for revising disputed request
const ReviseForm = ({ request, handleRevise }) => {
  const [quote, setQuote] = useState(request.managerQuote);
  const [note, setNote] = useState("");

  return (
    <div className="revise-form">
      <h4>Revise Disputed Bill</h4>
      <label>
        New Quote: 
        <input type="number" value={quote} onChange={(e) => setQuote(Number(e.target.value))} />
      </label>
      <label>
        Optional Note:
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Explain the revision..." />
      </label>
      <button onClick={() => handleRevise(request.id, quote, note)}>Send Revision</button>
    </div>
  );
};

export default AcceptedRequests;


