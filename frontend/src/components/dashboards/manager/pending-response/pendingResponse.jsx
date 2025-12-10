// Manager view for requests awaiting client response to quotes
import { useState, useEffect } from 'react';
import { message, Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { RequestsAPI } from '../../../../api';
import { API_BASE_URL } from '../../../../config';
import { formatDateTime, fetchNegotiationRecords, renderNegotiationHistory } from '../../../../utils/helpers';

import SubWindowModal from '../sub-window-modal/subWindowModal';
import FilterTable from '../filter-bar/filterBar';

import '../managerWindow.css';

const PendingResponse = () => {
  const [pending, setPending] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await RequestsAPI.getByStatus("pending_response");
        setPending(data);
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
      }
    };
    fetchPending();
  }, []);

  const openModal = async (req) => {
    // Build photos array for SubWindowModal
    const photos = [
      req.photo1Path,
      req.photo2Path,
      req.photo3Path,
      req.photo4Path,
      req.photo5Path
    ].filter(Boolean).map(path => `${API_BASE_URL}${path}`);
    
    setSelectedRequest({ ...req, photos });
    
    try {
      const records = await fetchNegotiationRecords(req.id);
      setNegotiationHistory(records);
    } catch (err) {
      message.error('Failed to fetch negotiation history');
    }
  };

  const handleAcceptCounterOffer = async () => {
    if (!selectedRequest) return;

    try {
      // Find the latest client counter-offer
      const clientOffers = negotiationHistory.filter(r => 
        r.itemType === 'quote' && r.senderName === 'client'
      );
      
      if (clientOffers.length === 0) {
        message.error('No client counter-offer found');
        return;
      }

      const latestOffer = clientOffers[0]; // First one is the latest (DESC order)

      // Update status to accepted
      const statusResult = await RequestsAPI.updateStatus(selectedRequest.id, 'accepted');
      
      if (!statusResult.success) {
        throw new Error('Failed to update status');
      }

      // Update the request with the client's counter-offer price
      await RequestsAPI.update(selectedRequest.id, {
        managerQuote: latestOffer.price,
        scheduledTime: latestOffer.businessTime,
        managerNote: `Accepted client's counter-offer of $${latestOffer.price}`
      });

      // Add a record showing manager accepted the counter-offer
      await RequestsAPI.addRecord(selectedRequest.id, {
        itemType: 'message',
        messageBody: `Manager accepted client's counter-offer of $${latestOffer.price}`,
        senderName: 'manager'
      });

      message.success('Counter-offer accepted! Service scheduled.');
      
      // Refresh the list
      const data = await RequestsAPI.getByStatus("pending_response");
      setPending(data);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Accept counter-offer error:', error);
      message.error('Failed to accept counter-offer');
    }
  };

  const columns = [
    { label: "Client Name", key: "clientName", filterType: "text" },
    { label: "Manager Quote", key: "managerQuote", filterType: "number", render: (quote) => quote ? `$${quote}` : '-' },
    { label: "Scheduled Time", key: "scheduledTime", filterType: "date", render: (date) => formatDateTime(date) },
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
    { label: "Requested Date", key: "serviceDate", render: (date) => formatDateTime(date) },
    
    // Pricing
    { 
      label: "System Estimate", 
      key: "systemEstimate", 
      render: (estimate) => estimate ? (
        <span style={{ fontSize: '14px', color: '#8c8c8c' }}>
          💻 ${estimate} <small>(Auto-calculated)</small>
        </span>
      ) : '-'
    },
    { 
      label: "Client Budget", 
      key: "clientBudget", 
      render: (budget) => budget ? (
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#1890ff' }}>
          💰 ${budget}
        </span>
      ) : <span style={{ color: '#999' }}>Not specified</span>
    },
    { 
      label: "Manager Quote", 
      key: "managerQuote", 
      render: (quote) => quote ? (
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
          ${quote}
        </span>
      ) : '-'
    },
    { label: "Scheduled Time", key: "scheduledTime", render: (date) => formatDateTime(date) },
    
    // Negotiation History
    {
      label: "Negotiation History",
      key: "negotiationHistory",
      render: (_, data) => renderNegotiationHistory(negotiationHistory, { Timeline, ClockCircleOutlined }, data)
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
            <button
              className='accept-counter-offer-btn'
              onClick={handleAcceptCounterOffer}
              style={{
                padding: '10px 20px',
                backgroundColor: '#52c41a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Accept Counter-Offer
            </button>
          }
        />
      )}
    </div>
  );
};

export default PendingResponse;




