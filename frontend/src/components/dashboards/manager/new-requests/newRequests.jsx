


import { useState, useEffect } from "react";
import { message, Timeline, Button } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { RequestsAPI } from "../../../../api.js";

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import FilterTable from '../filter-bar/filterBar.jsx';

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

const NewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [managerQuote, setManagerQuote] = useState("");
  const [managerTime, setManagerTime] = useState("");
  const [managerNotes, setManagerNotes] = useState("");
  
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      const data = await RequestsAPI.getByStatus("new");
      console.log('New Requests Data:', data);
      setRequests(data);
    };
    fetchRequests();
  }, []);

  const openModal = async (req) => {
    console.log('Opening new request modal:', req);
    setSelectedRequest(req);
    setManagerQuote(req.managerQuote || "");
    setManagerTime(req.scheduledTime || "");
    setManagerNotes(req.managerNote || "");
    
    // Fetch negotiation history
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

  const handleSubmitResponse = async () => {
    if (!managerQuote || !managerTime) {
      message.warning("Please enter a quote and time window");
      return;
    }

    try {
      // Move request to pending_response and update quote
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

      // Create negotiation record
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/service-requests/${selectedRequest.id}/records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemType: 'quote',
          price: parseFloat(managerQuote),
          businessTime: managerTime,
          messageBody: managerNotes || 'Manager provided quote'
        })
      });

      const refreshed = await RequestsAPI.getByStatus("new");
      setRequests(refreshed);
      setSelectedRequest(null);
      message.success("Response sent to client!");
    } catch (error) {
      console.error('Submit response error:', error);
      message.error('Failed to send response');
    }
  };

  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Service", key: "serviceType", filterType: "text" },
    { key: "createdAt", label: "Submitted Date", filterType: "date", render: (date) => formatDateTime(date) },
    { label: "Requested Date/Time", key: "serviceDate", filterType: "date", render: (date) => formatDateTime(date) },
    { label: "Status", key: "managerQuote", filterType: "text", render: (quote) => quote ? "🔄 Renegotiation" : "New" },
  ];

  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Number of Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: v => (v ? "Yes" : "No") },
    { label: "Address", key: "serviceAddress" },
    { key: "createdAt", label: "Submitted Date", render: (date) => formatDateTime(date) },
    { label: "Requested Date/Time", key: "serviceDate", render: (date) => formatDateTime(date) },
    { label: "Client Notes", key: "note" },
    { label: "Client Budget", key: "clientBudget", render: (budget) => budget ? `$${budget}` : '-' },
    
    ...(selectedRequest?.managerQuote
      ? [
          {
            label: "Previous Quote (Rejected by Client)",
            key: "previousQuote",
            render: (_, data) => (
              <div style={{ padding: '8px', backgroundColor: '#fff1f0', border: '1px solid #ffccc7', borderRadius: '4px' }}>
                <strong>Price:</strong> ${data.managerQuote}<br/>
                <strong>Time:</strong> {formatDateTime(data.scheduledTime)}<br/>
                {data.managerNote && <><strong>Note:</strong> {data.managerNote}</>}
              </div>
            )
          }
        ]
      : []),

    {
      label: selectedRequest?.managerQuote ? "New Quote (Revised)" : "Quote",
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

    ...(selectedRequest?.isRenegotiation
      ? [
          {
            label: "Client Adjusted Quote",
            key: "clientAdjustment",
            render: (val, data) =>
              data.isRenegotiation && val
                ? `Price: $${val.price}, Scheduled Time: ${formatDateTime(val.time)}${val.note ? `, Note: ${val.note}` : ""}`
                : null
          }
        ]
      : []),

    {
      label: "Negotiation History",
      key: "negotiationHistory",
      render: () => {
        const clientResponses = negotiationHistory.filter(r => r.itemType === 'response');
        const lastClientResponse = clientResponses.length > 0 ? clientResponses[0] : null;
        
        return (
          <div style={{ marginTop: '10px' }}>
            {lastClientResponse && (
              <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px', marginBottom: '10px' }}>
                <strong style={{ color: '#1890ff' }}>💬 Latest Client Response:</strong>
                <br />
                <small style={{ color: '#666' }}>
                  {new Date(lastClientResponse.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  {lastClientResponse.messageBody}
                </div>
              </div>
            )}
            
            {negotiationHistory.length > 0 && (
              <div>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => setShowFullHistory(!showFullHistory)}
                  style={{ padding: 0, marginBottom: '10px' }}
                >
                  {showFullHistory ? '▼ Hide Full History' : '▶ View Full Negotiation History'} ({negotiationHistory.length} records)
                </Button>
                
                {showFullHistory && (
                  <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
                    <Timeline mode="left">
                      {negotiationHistory.map((record, idx) => {
                        const isManagerQuote = record.itemType === 'quote';
                        const isClientResponse = record.itemType === 'response';
                        
                        return (
                          <Timeline.Item 
                            key={idx}
                            color={isManagerQuote ? 'green' : isClientResponse ? 'blue' : 'gray'}
                            dot={<ClockCircleOutlined />}
                          >
                            <div>
                              <strong style={{ color: isManagerQuote ? '#52c41a' : isClientResponse ? '#1890ff' : '#666' }}>
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
                              </div>
                            </div>
                          </Timeline.Item>
                        );
                      })}
                    </Timeline>
                  </div>
                )}
              </div>
            )}
            
            {negotiationHistory.length === 0 && (
              <p style={{ color: '#999' }}>No negotiation history yet</p>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="manager-window-container">
      <h2>New Cleaning Requests</h2>
      <FilterTable columns={columns} data={requests} onRowClick={openModal} />

      {selectedRequest && (
        <SubWindowModal
          title={selectedRequest.managerQuote ? "Renegotiate Quote with Client" : "Respond to Client"}
          data={selectedRequest}
          fields={modalFields}
          actions={<button onClick={handleSubmitResponse}>{selectedRequest.managerQuote ? "Send Revised Quote" : "Send Response to Client"}</button>}
          onClose={() => setSelectedRequest(null)}
          type="new"
        />
      )}
    </div>
  );
};

export default NewRequests;


