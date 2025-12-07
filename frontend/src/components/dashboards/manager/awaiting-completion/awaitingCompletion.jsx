

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

const AwaitingCompletion = () => {
  const [queued, setQueued] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);

  useEffect(() => {
    const fetchQueued = async () => {
      const data = await RequestsAPI.getByStatus("accepted");
      console.log('=== Awaiting Completion Debug ===');
      console.log('Query status:', "accepted");
      console.log('Returned data:', data);
      console.log('Data length:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('First item:', data[0]);
        console.log('First item state:', data[0].state);
      }
      setQueued(data);
    };
    fetchQueued();
  }, []);

  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Service Type", key: "serviceType", filterType: "text" },
    { label: "Scheduled Time", key: "scheduledTime", filterType: "date", render: (date) => formatDateTime(date) },
    { label: "Quoted Price", key: "managerQuote", filterType: "number", render: (price) => price ? `$${price}` : '-' },
  ];

  const modalFields = [
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Number of Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Address", key: "serviceAddress" },
    { label: "Client Notes", key: "note" },
    { label: "Scheduled Time", key: "scheduledTime", render: (date) => formatDateTime(date) },
    { label: "Quoted Price", key: "managerQuote", render: (price) => price ? `$${price}` : '-' },
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

  const handleComplete = async () => {
    if (!selectedRequest) return;

    await RequestsAPI.move(
      selectedRequest.id,
      "accepted",
      "completed",
      { completionDate: new Date().toISOString().slice(0, 10) }
    );

    const refreshed = await RequestsAPI.getByStatus("accepted");
    setQueued(refreshed);
    setSelectedRequest(null);
  };

  return (
    <div className="manager-window-container">
      <h2>Awaiting Completion</h2>

      <FilterTable columns={columns} data={queued} onRowClick={openModal} />

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


