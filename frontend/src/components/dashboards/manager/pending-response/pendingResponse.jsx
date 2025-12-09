

import { useState, useEffect } from "react";
import { message, Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { RequestsAPI } from "../../../../api.js";
import { formatDateTime, fetchNegotiationRecords } from '../../../../utils/helpers';

import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";
import FilterTable from '../filter-bar/filterBar.jsx';

import "../managerWindow.css";

const PendingResponse = () => {
  const [pending, setPending] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      const data = await RequestsAPI.getByStatus("pending_response");
      setPending(data);
    };
    fetchPending();
  }, []);

  const openModal = async (req) => {
    setSelectedRequest(req);
    
    try {
      const records = await fetchNegotiationRecords(req.id);
      setNegotiationHistory(records);
    } catch (err) {
      message.error('Failed to fetch negotiation history');
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
    { 
      label: "System Estimated Cost", 
      key: "systemEstimate", 
      render: (estimate) => estimate ? (
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a', backgroundColor: '#f6ffed', padding: '4px 12px', borderRadius: '4px', border: '1px solid #b7eb8f' }}>
          ${estimate}
        </span>
      ) : (
        <span style={{ color: '#999' }}>Not calculated</span>
      )
    },
    { 
      label: "Client Budget", 
      key: "clientBudget", 
      render: (budget) => budget ? (
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff', backgroundColor: '#e6f7ff', padding: '4px 12px', borderRadius: '4px', border: '1px solid #91d5ff' }}>
          ${budget}
        </span>
      ) : (
        <span style={{ color: '#999' }}>No limit</span>
      )
    },
    { 
      label: "Manager Quote", 
      key: "managerQuote", 
      render: (quote, data) => {
        // Find the latest accepted quote from negotiation history
        const acceptedQuotes = negotiationHistory.filter(r => 
          r.itemType === 'quote' && 
          r.clientResponse && 
          r.clientResponse.includes('Accepted')
        );
        const latestAcceptedQuote = acceptedQuotes.length > 0 ? acceptedQuotes[0] : null;
        const finalPrice = latestAcceptedQuote ? latestAcceptedQuote.price : quote;
        
        return finalPrice ? (
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
            ${finalPrice}
          </span>
        ) : '-';
      }
    },
    { label: "Scheduled Time", key: "scheduledTime", render: (date) => formatDateTime(date) },
    { label: "Manager Note", key: "managerNote" },
    {
      label: "Uploaded Photos",
      key: "photos",
      render: (_, data) => {
        const photos = [
          data.photo1Path,
          data.photo2Path,
          data.photo3Path,
          data.photo4Path,
          data.photo5Path
        ].filter(Boolean);

        return photos.length > 0 ? (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {photos.map((photo, idx) => (
              <img
                key={idx}
                src={`http://localhost:5000${photo}`}
                alt={`Uploaded ${idx + 1}`}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px'
                }}
                onClick={() => window.open(`http://localhost:5000${photo}`, '_blank')}
              />
            ))}
          </div>
        ) : (
          <span style={{ color: '#999' }}>No photos uploaded</span>
        );
      }
    },
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
          actions={null}
        />
      )}
    </div>
  );
};

export default PendingResponse;




