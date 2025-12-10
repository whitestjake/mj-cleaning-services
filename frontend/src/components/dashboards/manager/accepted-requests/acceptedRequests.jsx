// Manager view for completed and rejected service requests
import { useState, useEffect, useRef } from 'react';
import { message, Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { RequestsAPI } from '../../../../api';
import { API_BASE_URL } from '../../../../config';
import { formatDateTime, fetchNegotiationRecords, renderNegotiationHistory } from '../../../../utils/helpers';

import SubWindowModal from '../sub-window-modal/subWindowModal';
import FilterTable from '../filter-bar/filterBar';

import '../managerWindow.css';

const AcceptedRequests = ({ title = "Completed Requests", isRejected = false }) => {
  const [completed, setCompleted] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentNegotiationHistory, setCurrentNegotiationHistory] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchCompleted = async () => {
      const status = isRejected ? "rejected" : "completed";
      const data = await RequestsAPI.getByStatus(status);
      
      // Fetch cancellation details for rejected requests
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
                // Check if manager declined/rejected
                // Manager rejection can be:
                // 1. Message with decline/cancel text
                // 2. OR simply no client response (manager rejected before client responded)
                const managerDeclineRecord = records.find(r => 
                  r.itemType === 'message' && 
                  r.senderName === 'manager'
                );
                
                if (managerDeclineRecord) {
                  cancelledBy = 'manager';
                  cancelledDate = managerDeclineRecord.createdAt;
                } else if (records.length === 0 || !records.some(r => r.clientResponse)) {
                  // If no records or no client response, it was manager rejection
                  cancelledBy = 'manager';
                  cancelledDate = request.createdAt;
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
    
    // Poll for updates every 10 seconds to catch client payments
    intervalRef.current = setInterval(() => {
      fetchCompleted();
    }, 10000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRejected]);

  const openModal = async (req) => {
    // Fetch fresh data from server to ensure we have latest payment status
    try {
      const freshData = await RequestsAPI.getById(req.id);
      
      // Build photos array for SubWindowModal
      const photos = [
        freshData.photo1Path,
        freshData.photo2Path,
        freshData.photo3Path,
        freshData.photo4Path,
        freshData.photo5Path
      ].filter(Boolean).map(path => `${API_BASE_URL}${path}`);
      
      setSelectedRequest({ ...freshData, photos });
      
      // Fetch negotiation records
      const records = await fetchNegotiationRecords(req.id);
      setCurrentNegotiationHistory(records);
    } catch (err) {
      message.error('Failed to load request details');
      console.error('Open modal error:', err);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await RequestsAPI.markAsPaid(id);
      
      // Add record for payment confirmation
      await RequestsAPI.addRecord(id, {
        itemType: 'message',
        messageBody: 'Manager confirmed payment received',
        senderName: 'manager'
      });
      
      const data = await RequestsAPI.getByStatus('completed');
      setCompleted(data);
      setSelectedRequest((prev) => (prev ? { ...prev, isPaid: true } : null));
      message.success('Payment confirmed!');
    } catch (error) {
      message.error('Failed to confirm payment');
    }
  };

  const handleRevise = async (id, revisedQuote, revisedNote) => {
    try {
      // Update the service request
      await RequestsAPI.reviseDisputedRequest(id, { 
        managerQuote: revisedQuote, 
        managerNote: revisedNote,
        isDisputed: false,
        disputeNote: ''
      });
      
      // Add a record for the bill revision
      await RequestsAPI.addRecord(id, {
        itemType: 'quote',
        price: revisedQuote,
        messageBody: `Bill revised: ${revisedNote || 'Adjusted pricing'}`,
        senderName: 'manager',
        businessTime: selectedRequest?.scheduledTime
      });
      
      message.success('Bill revised successfully!');
      const data = await RequestsAPI.getByStatus('completed');
      setCompleted(data);
      setSelectedRequest((prev) => (prev
        ? { ...prev, managerQuote: revisedQuote, managerNote: revisedNote, pendingRevision: true, isDisputed: false, disputeNote: "" }
        : null
      ));
    } catch (error) {
      message.error('Failed to revise bill');
    }
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
      render: (val, data) => {
        // Convert to boolean: MySQL BOOLEAN fields return 0/1
        const isPaid = !!val;
        const clientPaid = !!data.clientPaid;
        
        if (isPaid) {
          return <span className="status-badge status-paid">PAID</span>;
        } else if (clientPaid) {
          return <span className="status-badge" style={{ backgroundColor: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff', fontWeight: 'bold' }}>CLIENT PAID</span>;
        } else {
          return <span className='status-badge status-unpaid'>UNPAID</span>;
        }
      }
    }]),
  ];

  const modalFields = [
    // Basic Information
    { label: "Client Name", key: "clientName" },
    { label: "Phone", key: "phone" },
    { label: "Service Address", key: "serviceAddress" },
    
    // Service Details
    { label: "Service Type", key: "serviceType" },
    { label: "Number of Rooms", key: "numRooms" },
    { label: "Outdoor Service", key: "addOutdoor", render: (val) => (val ? "Yes" : "No") },
    { label: "Requested Date", key: "serviceDate", render: (date) => date ? formatDateTime(date) : '-' },
    { label: "Completion Date", key: "completionDate", render: (date) => date ? formatDateTime(date) : '-' },
    
    // Pricing
    {
      label: "System Estimate",
      key: "systemEstimate",
      render: (val) => val ? (
        <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
          💻 ${val} <small>(Auto-calculated)</small>
        </span>
      ) : '-'
    },
    {
      label: "Client Budget",
      key: "clientBudget",
      render: (val) => val ? (
        <span style={{ color: '#1890ff', fontSize: '14px', fontWeight: '500' }}>💰 ${val}</span>
      ) : <span style={{ color: '#999' }}>Not specified</span>
    },
    { 
      label: "Final Price", 
      key: "finalPrice", 
      render: (_, data) => {
        const acceptedQuotes = currentNegotiationHistory.filter(r => 
          r.itemType === 'quote' && 
          r.clientResponse && 
          r.clientResponse.includes('Accepted')
        );
        const latestAcceptedQuote = acceptedQuotes.length > 0 ? acceptedQuotes[0] : null;
        const finalPrice = latestAcceptedQuote ? latestAcceptedQuote.price : data.managerQuote;
        
        return (
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
            ${finalPrice}
          </span>
        );
      }
    },
    { 
      label: "Payment Status", 
      key: "isPaid", 
      render: (val, data) => {
        if (val) {
          return (
            <span style={{ 
              padding: '6px 16px', 
              borderRadius: '4px', 
              backgroundColor: '#f6ffed',
              color: '#52c41a',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              PAID & CONFIRMED
            </span>
          );
        } else if (data.clientPaid) {
          return (
            <span style={{ 
              padding: '6px 16px', 
              borderRadius: '4px', 
              backgroundColor: '#e6f7ff',
              color: '#1890ff',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'inline-block'
            }}>
              💳 CLIENT PAID<br />
              <small style={{ fontSize: '11px', fontWeight: 'normal' }}>(Awaiting Confirmation)</small>
            </span>
          );
        } else if (data.isDisputed) {
          return (
            <span style={{ 
              padding: '6px 16px', 
              borderRadius: '4px', 
              backgroundColor: '#fff1f0',
              color: '#ff4d4f',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              ⚠ DISPUTED
            </span>
          );
        } else {
          return (
            <span style={{ 
              padding: '6px 16px', 
              borderRadius: '4px', 
              backgroundColor: '#fff7e6',
              color: '#fa8c16',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              ⏳ UNPAID
            </span>
          );
        }
      }
    },

    // Dispute Information (if exists)
    ...(selectedRequest?.isDisputed ? [{
      label: "Dispute Reason",
      key: "disputeNote",
      render: (note) => (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fff1f0', 
          border: '1px solid #ffa39e',
          borderRadius: '4px',
          marginTop: '8px'
        }}>
          <strong style={{ color: '#ff4d4f' }}>Client Dispute:</strong>
          <div style={{ marginTop: '8px' }}>{note || 'No reason provided'}</div>
        </div>
      )
    }] : []),
    
    // Negotiation History Section
    {
      label: "Negotiation History",
      key: "negotiationHistory",
      render: (_, data) => renderNegotiationHistory(currentNegotiationHistory, { Timeline, ClockCircleOutlined }, data)
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
            !isRejected && (selectedRequest.clientPaid && !selectedRequest.isPaid && !selectedRequest.isDisputed) ? (
              <button
                className='mark-paid-btn'
                onClick={() => handleMarkAsPaid(selectedRequest.id)}
              >
                Confirm Payment Received
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


