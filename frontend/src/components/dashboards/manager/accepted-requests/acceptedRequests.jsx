


import { useState, useEffect } from 'react';
import { message, Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { RequestsAPI } from '../../../../api.js';
import { formatDateTime, fetchNegotiationRecords } from '../../../../utils/helpers';

import SubWindowModal from '../sub-window-modal/subWindowModal.jsx';
import FilterTable from "../filter-bar/filterBar.jsx";

import "../managerWindow.css";

const AcceptedRequests = ({ title = "Completed Requests", isRejected = false }) => {
  const [completed, setCompleted] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);

  useEffect(() => {
    const fetchCompleted = async () => {
      const status = isRejected ? "rejected" : "completed";
      const data = await RequestsAPI.getByStatus(status);
      
      // For rejected requests, fetch who cancelled each one and when
      if (isRejected && data.length > 0) {
        const enrichedData = await Promise.all(
          data.map(async (request) => {
            try {
              const records = await fetchNegotiationRecords(request.id);
              
              // Look for cancellation - client cancels via clientResponse, manager via message
              let cancelledBy = 'unknown';
              let cancelledDate = request.createdAt;
              
              // Check if client cancelled (clientResponse contains "Cancelled")
              const clientCancelRecord = records.find(r => 
                r.itemType === 'quote' && 
                r.clientResponse && 
                r.clientResponse.toLowerCase().includes('cancelled')
              );
              
              if (clientCancelRecord) {
                cancelledBy = 'client';
                cancelledDate = clientCancelRecord.responseTime || clientCancelRecord.createdAt;
              } else {
                // Check if manager declined (message with decline/cancel)
                const managerDeclineRecord = records.find(r => 
                  r.itemType === 'message' && 
                  r.senderName === 'manager' &&
                  r.messageBody && 
                  (r.messageBody.toLowerCase().includes('declined') || 
                   r.messageBody.toLowerCase().includes('cancel'))
                );
                
                if (managerDeclineRecord) {
                  cancelledBy = 'manager';
                  cancelledDate = managerDeclineRecord.createdAt;
                }
              }
              
              return {
                ...request,
                cancelledBy,
                cancelledDate
              };
            } catch (err) {
              return { 
                ...request, 
                cancelledBy: 'unknown',
                cancelledDate: request.createdAt
              };
            }
          })
        );
        setCompleted(enrichedData);
      } else {
        setCompleted(data);
      }
    };
    fetchCompleted();
  }, [isRejected]);

  const openModal = async (req) => {
    setSelectedRequest(req);
    
    try {
      const records = await fetchNegotiationRecords(req.id);
      setNegotiationHistory(records);
    } catch (err) {
      message.error('Failed to fetch negotiation history');
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
    { 
      label: isRejected ? "Cancelled Date" : "Completion Date", 
      key: isRejected ? "cancelledDate" : "completionDate", 
      filterType: "date", 
      render: (date) => date ? formatDateTime(date) : '-' 
    },
    { label: "Quoted Price", key: "managerQuote", filterType: "number", render: (price) => price ? `$${price}` : '-' },
    ...(isRejected ? [{
      label: "Cancelled By",
      key: "cancelledBy",
      filterType: "text",
      render: (val) => {
        if (val === 'client') {
          return <span style={{ color: '#1890ff', fontWeight: 'bold' }}>Client</span>;
        } else if (val === 'manager') {
          return <span style={{ color: '#722ed1', fontWeight: 'bold' }}>Manager</span>;
        }
        return '-';
      }
    }] : [{ 
      label: "Paid Status", 
      key: "isPaid", 
      filterType: "text", 
      render: (val) => val ? <span className="status-badge status-paid">PAID</span> : <span className='status-badge status-unpaid'>UNPAID</span>
    }]),
  ];

  const modalFields = [
    // Basic Information
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Address", key: "serviceAddress" },
    { label: "Completion Date", key: "completionDate", render: (date) => date ? formatDateTime(date) : '-' },
    
    // Pricing
    { 
      label: "Final Price", 
      key: "finalPrice", 
      render: (_, data) => {
        const acceptedQuotes = negotiationHistory.filter(r => 
          r.itemType === 'quote' && 
          r.clientResponse && 
          r.clientResponse.includes('Accepted')
        );
        const latestAcceptedQuote = acceptedQuotes.length > 0 ? acceptedQuotes[0] : null;
        const finalPrice = latestAcceptedQuote ? latestAcceptedQuote.price : data.managerQuote;
        
        return (
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
            ${finalPrice}
          </span>
        );
      }
    },
    
    { 
      label: "Payment Status", 
      key: "isPaid", 
      render: (val) => (
        <span style={{ 
          padding: '4px 12px', 
          borderRadius: '4px', 
          backgroundColor: val ? '#f6ffed' : '#fff7e6',
          color: val ? '#52c41a' : '#fa8c16',
          fontWeight: 'bold'
        }}>
          {val ? 'PAID' : 'UNPAID'}
        </span>
      )
    },
    
    // Notes
    { label: "Client Notes", key: "note" },
    { label: "Manager Notes", key: "managerNote" },
    
    // Photos
    {
      label: "Photos",
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {photos.map((photo, idx) => (
              <img
                key={idx}
                src={`http://localhost:5000${photo}`}
                alt={`Uploaded ${idx + 1}`}
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  objectFit: 'cover',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                onClick={() => window.open(`http://localhost:5000${photo}`, '_blank')}
              />
            ))}
          </div>
        ) : '-';
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
      <h2>{title}</h2>

      <FilterTable 
        columns={columns}
        data={completed} 
        onRowClick={openModal} 
      />

      {selectedRequest && (
        <SubWindowModal
          title={isRejected ? "Cancelled/Rejected Request Details" : "Completed Request Details"}
          data={selectedRequest}
          fields={modalFields}
          onClose={() => setSelectedRequest(null)}
          type="completed"
          actions={
            !isRejected && (!selectedRequest.isPaid && !selectedRequest.isDisputed) ? (
              <button
                className='mark-paid-btn'
                onClick={() => handleMarkAsPaid(selectedRequest.id)}
              >
                Mark as Paid
              </button>
            ) : (!isRejected && selectedRequest.isDisputed && !selectedRequest.pendingRevision) ? (
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


