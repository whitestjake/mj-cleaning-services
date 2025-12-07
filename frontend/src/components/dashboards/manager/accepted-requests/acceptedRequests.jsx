


import { useState, useEffect } from "react";
import { message, Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { RequestsAPI } from "../../../../api.js";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import FilterTable from "../filter-bar/filterBar.jsx";

import "../managerWindow.css";

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AcceptedRequests = () => {
  const [completed, setCompleted] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);

  const fetchCompleted = async () => {
    const data = await RequestsAPI.getByStatus("completed");
    console.log('=== Completed Requests Debug ===');
    console.log('Query status:', "completed");
    console.log('Returned data:', data);
    console.log('Data length:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('First item:', data[0]);
      console.log('First item state:', data[0].state);
    }
    setCompleted(data);
  };

  useEffect(() => {
    fetchCompleted();
  }, []);

  const openModal = async (req) => {
    setSelectedRequest(req);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/service-requests/${req.id}/records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNegotiationHistory(data.records || []);
      }
    } catch (err) {
      console.error('Failed to fetch negotiation history:', err);
    }
  };

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

  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Service Type", key: "serviceType", filterType: "text" },
    { label: "Completion Date", key: "completionDate", filterType: "date", render: (date) => formatDateTime(date) },
    { label: "Quoted Price", key: "managerQuote", filterType: "number", render: (price) => price ? `$${price}` : '-' },
    { label: "Paid Status", 
      key: "isPaid", 
      filterType: "text", 
      render: (val) => val ? <span className="status-badge status-paid">PAID</span> : <span className='status-badge status-unpaid'>UNPAID</span>
    },
  ];

  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Number of Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Address", key: "serviceAddress" },
    { label: "Client Notes", key: "note" },
    { label: "Completion Date", key: "completionDate", render: (date) => formatDateTime(date) },
    { label: "Quoted Price", key: "managerQuote", render: (price) => price ? `$${price}` : '-' },
    { label: "Manager Note", key: "managerNote" },
    { label: "Payment Status", key: "isPaid", render: (val) => (val ? "PAID" : "UNPAID") },
    { label: "Disputed", key: "isDisputed", render: (val, data) => val ? `YES - Note: ${data.disputeNote}` : "NO" },
    { label: "Pending Revision", key: "pendingRevision", render: (val) => val ? "YES" : "NO" },
    {
      label: "Negotiation History",
      key: "negotiationHistory",
      render: () => (
        negotiationHistory.length > 0 ? (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Timeline mode="left">
              {negotiationHistory.map((record, idx) => {
                const isManagerQuote = record.itemType === 'record' && record.senderName === 'manager';
                const isClientResponse = record.senderName === 'client';
                
                return (
                  <Timeline.Item 
                    key={idx}
                    color={isManagerQuote ? 'green' : isClientResponse ? 'blue' : 'gray'}
                    dot={<ClockCircleOutlined />}
                  >
                    <div>
                      <strong style={{ color: isManagerQuote ? '#52c41a' : '#1890ff' }}>
                        {isManagerQuote ? '💼 Manager Quote' : isClientResponse ? '👤 Client Response' : '📝 Note'}
                      </strong>
                      <br />
                      <small style={{ color: '#999' }}>
                        {new Date(record.createdAt || new Date()).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                      <div style={{ marginTop: '8px' }}>
                        {record.price && <div><strong>Price:</strong> ${record.price}</div>}
                        {record.businessTime && <div><strong>Time:</strong> {new Date(record.businessTime).toLocaleString()}</div>}
                        {record.messageBody && <div><strong>Note:</strong> {record.messageBody}</div>}
                        {record.state && <div><strong>Status:</strong> {record.state}</div>}
                      </div>
                    </div>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </div>
        ) : (
          <p style={{ color: '#999' }}>No negotiation history yet</p>
        )
      )
    }
  ];

  return (
    <div className="manager-window-container">
      <h2>Completed Requests</h2>

      <FilterTable 
        columns={columns}
        data={completed} 
        onRowClick={openModal} 
      />

      {selectedRequest && (
        <SubWindowModal
          title="Completed Request Details"
          data={selectedRequest}
          fields={modalFields}
          onClose={() => setSelectedRequest(null)}
          type="completed"
          actions={
            (!selectedRequest.isPaid && !selectedRequest.isDisputed) ? (
              <button
                className='mark-paid-btn'
                onClick={() => handleMarkAsPaid(selectedRequest.id)}
              >
                Mark as Paid
              </button>
            ) : (selectedRequest.isDisputed && !selectedRequest.pendingRevision) ? (
              <ReviseForm request={selectedRequest} handleRevise={handleRevise} />
            ) : null
          }
        />
      )}
    </div>
  );
};

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


