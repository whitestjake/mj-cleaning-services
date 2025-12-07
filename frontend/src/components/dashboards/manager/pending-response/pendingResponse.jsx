

import { useState, useEffect } from "react";
import { message, Timeline } from 'antd';
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

const PendingResponses = () => {
  const [pending, setPending] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      const data = await RequestsAPI.getByStatus("pending_response");
      console.log('Pending Response Data:', data);
      if (data.length > 0) console.log('First item:', data[0]);
      setPending(data);
    };
    fetchPending();
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

  const handleAcceptQuote = async () => {
    if (!selectedRequest) return;
    
    try {
      await RequestsAPI.move(selectedRequest.id, "pending_response", "accepted");
      setSelectedRequest(null);
      // Refresh the list
      const refreshed = await RequestsAPI.getByStatus("pending_response");
      setPending(refreshed);
    } catch (error) {
      console.error('Error accepting quote:', error);
      message.error('Failed to accept quote');
    }
  };

  const handleRejectQuote = async () => {
    if (!selectedRequest) return;
    
    try {
      await RequestsAPI.move(selectedRequest.id, "pending_response", "rejected");
      setSelectedRequest(null);
      // Refresh the list
      const refreshed = await RequestsAPI.getByStatus("pending_response");
      setPending(refreshed);
    } catch (error) {
      console.error('Error rejecting quote:', error);
      message.error('Failed to reject quote');
    }
  };

  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Manager Quote", key: "managerQuote", filterType: "number", render: (quote) => quote ? `$${quote}` : '-' },
    { label: "Scheduled Time", key: "scheduledTime", filterType: "date", render: (date) => formatDateTime(date) },
  ];

  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Number of Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Address", key: "serviceAddress" },
    { label: "Client Notes", key: "note" },
    { label: "Manager Quote", key: "managerQuote", render: (quote) => quote ? `$${quote}` : '-' },
    { label: "Scheduled Time", key: "scheduledTime", render: (date) => formatDateTime(date) },
    { label: "Manager Note", key: "managerNote" },
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
      <h2>Pending Responses</h2>

      <FilterTable columns={columns} data={pending} onRowClick={openModal} />

      {selectedRequest && (
        <SubWindowModal
          title="Pending Response Details"
          data={selectedRequest}
          fields={modalFields}
          onClose={() => setSelectedRequest(null)}
          type="pending"
          actions={
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={handleAcceptQuote}
                style={{ 
                  backgroundColor: '#52c41a', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Accept Quote
              </button>
              <button 
                onClick={handleRejectQuote}
                style={{ 
                  backgroundColor: '#ff4d4f', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Reject Quote
              </button>
            </div>
          }
        />
      )}
    </div>
  );
};

export default PendingResponses;




