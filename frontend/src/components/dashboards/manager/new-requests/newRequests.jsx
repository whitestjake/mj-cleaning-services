


import { useState, useEffect } from "react";
import { RequestsAPI } from "../../../../api.js";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import FilterTable from '../filter-bar/filterBar.jsx';

import "../managerWindow.css";

const NewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [managerQuote, setManagerQuote] = useState("");
  const [managerTime, setManagerTime] = useState("");
  const [managerNotes, setManagerNotes] = useState("");

  useEffect(() => {
    RequestsAPI.getByStatus("new").then(setRequests);
  }, []);

  const openModal = (req) => {
    setSelectedRequest(req);
    setManagerQuote("");
    setManagerTime("");
    setManagerNotes("");
  };

  const handleSubmitResponse = async () => {
    if (!managerQuote || !managerTime) {
      alert("Please enter a quote and time window");
      return;
    }

    await RequestsAPI.move(
      selectedRequest.id,
      "new",
      "pending_response",
      {
        managerQuote,
        scheduledTime: managerTime,
        managerNote: managerNotes,
      }
    );

    const refreshed = await RequestsAPI.getByStatus("new");
    setRequests(refreshed);
    setSelectedRequest(null);
    alert("Response sent to client!");
  };

  // Table snapshot: only key info
  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Service", key: "serviceType", filterType: "text" },
    { key: "submittedDate", label: "Submitted Date", filterType: "date" },
    { label: "Requested Date/Time", key: "scheduledTime", filterType: "text", render: (val) => val || "-" },
  ];

  // Modal fields: full data
  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Number of Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: v => v ? "Yes" : "No" },
    { label: "Address", key: "serviceAddress" },
    { key: "submittedDate", label: "Submitted Date", filterType: "date" },
    { label: "Requested Date/Time", key: "scheduledTime", filterType: "text", render: (val) => val || "-" },
    { label: "Client Notes", key: "notes" },
    { label: "Client Budget", key: "clientBudget" },
    {
      label: "Quote",
      key: "managerQuote",
      render: () => (
        <input type="text" value={managerQuote} onChange={(e) => setManagerQuote(e.target.value)} placeholder="$250" />
      )
    },
    {
      label: "Scheduled Time Window",
      key: "managerTime",
      render: () => (
        <input type="datetime-local" value={managerTime} onChange={(e) => setManagerTime(e.target.value)} />
      )
    },
    {
      label: "Notes to Client",
      key: "managerNotes",
      render: () => (
        <textarea value={managerNotes} onChange={(e) => setManagerNotes(e.target.value)} placeholder="Optional notes..." />
      )
    },
    {
      label: "Photos",
      key: "photos",
      render: (photos) => photos?.length ? photos.map((p, i) => <img key={i} src={typeof p === "string" ? p : URL.createObjectURL(p)} alt="" style={{ width: 60, marginRight: 5 }} />) : "-"
    }
  ];

  return (
    <div className="manager-window-container">
      <h2>New Cleaning Requests</h2>
      <FilterTable columns={columns} data={requests} onRowClick={openModal} />
      {selectedRequest && (
        <SubWindowModal
          title="Respond to Client"
          data={selectedRequest}
          fields={modalFields}
          actions={<button onClick={handleSubmitResponse}>Send Response to Client</button>}
          onClose={() => setSelectedRequest(null)}
          type="new"
        />
      )}
    </div>
  );
};

export default NewRequests;


