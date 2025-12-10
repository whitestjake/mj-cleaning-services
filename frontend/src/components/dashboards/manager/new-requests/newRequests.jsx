// Manager view for new service requests - allows reviewing and responding to requests
import { useState, useEffect } from 'react';
import { message, Timeline, Button, InputNumber, DatePicker, Input, Radio, Space } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { RequestsAPI } from '../../../../api';
import { formatDateTime, fetchNegotiationRecords } from '../../../../utils/helpers';
import dayjs from 'dayjs';

import SubWindowModal from '../sub-window-modal/subWindowModal';
import FilterTable from '../filter-bar/filterBar';

import '../managerWindow.css';

const NewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Response form fields
  const [responseType, setResponseType] = useState('revise');
  const [managerQuote, setManagerQuote] = useState("");
  const [managerTime, setManagerTime] = useState("");
  const [managerNotes, setManagerNotes] = useState("");
  
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await RequestsAPI.getByStatus("new");
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch new requests:', error);
      }
    };
    fetchRequests();
  }, []);

  // Open request details and load negotiation history
  const openModal = async (req) => {
    setSelectedRequest(req);
    
    // Fetch negotiation history first
    try {
      const records = await fetchNegotiationRecords(req.id);
      setNegotiationHistory(records);
      
      // Find the latest client counter-offer (senderName='client', itemType='quote')
      const clientCounterOffers = records.filter(r => 
        r.itemType === 'quote' && 
        r.senderName === 'client'
      );
      
      // Get the first one (which is the latest due to DESC order)
      const latestClientOffer = clientCounterOffers.length > 0 ? clientCounterOffers[0] : null;
      
      // Use client's counter-offer price if exists, otherwise use manager's previous quote
      let initialQuote = req.managerQuote || "";
      if (latestClientOffer && latestClientOffer.price) {
        initialQuote = latestClientOffer.price.toString();
      }
      
      // Format scheduledTime for datetime-local input
      let formattedTime = "";
      if (req.scheduledTime) {
        const date = new Date(req.scheduledTime);
        formattedTime = date.toISOString().slice(0, 16);
      }
      
      setManagerQuote(initialQuote);
      setManagerTime(formattedTime);
      setManagerNotes(req.managerNote || "");
    } catch (err) {
      message.error('Failed to fetch negotiation history');
      // Fallback to original values
      setManagerQuote(req.managerQuote || "");
      
      let formattedTime = "";
      if (req.scheduledTime) {
        const date = new Date(req.scheduledTime);
        formattedTime = date.toISOString().slice(0, 16);
      }
      setManagerTime(formattedTime);
      setManagerNotes(req.managerNote || "");
    }
  };

  const handleSubmitResponse = async () => {
    // Handle rejection
    if (responseType === 'reject') {
      try {
        const statusResult = await RequestsAPI.updateStatus(selectedRequest.id, 'rejected');
        
        if (!statusResult || !statusResult.success) {
          throw new Error(statusResult?.message || 'Failed to update status');
        }
        
        // Add a record for rejection
        const recordResult = await RequestsAPI.addRecord(selectedRequest.id, {
          itemType: 'message',
          messageBody: managerNotes || 'Manager declined this request',
          senderName: 'manager'
        });
        
        if (!recordResult || !recordResult.success) {
          throw new Error(recordResult?.message || 'Failed to add record');
        }
        
        const refreshed = await RequestsAPI.getByStatus("new");
        setRequests(refreshed);
        setSelectedRequest(null);
        message.success("Request declined");
      } catch (error) {
        message.error('Failed to decline request: ' + error.message);
      }
      return;
    }
    
    // Handle accept or revise (both need quote and time)
    if (!managerQuote || !managerTime) {
      message.warning("Please enter a quote and time window");
      return;
    }

    const parsedQuote = parseFloat(managerQuote);
    if (isNaN(parsedQuote) || parsedQuote <= 0) {
      message.warning("Please enter a valid quote amount");
      return;
    }

    try {
      const targetStatus = responseType === 'accept' ? 'accepted' : 'pending_response';
      
      // Move request to appropriate status
      await RequestsAPI.move(
        selectedRequest.id,
        "new",
        targetStatus,
        {
          managerQuote,
          scheduledTime: managerTime,
          managerNote: managerNotes,
        }
      );

      // Create negotiation record
      await RequestsAPI.addRecord(selectedRequest.id, {
        itemType: 'quote',
        price: parsedQuote,
        businessTime: managerTime,
        messageBody: managerNotes || (responseType === 'accept' ? 'Manager accepted client offer' : 'Manager provided quote')
      });

      const refreshed = await RequestsAPI.getByStatus("new");
      setRequests(refreshed);
      setSelectedRequest(null);
      message.success(responseType === 'accept' ? "Client offer accepted!" : "Response sent to client!");
    } catch (error) {
      message.error('Failed to submit response');
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
    
    // Latest Client Response & Full History (if exists) - Show history FIRST
    ...(selectedRequest?.managerQuote
      ? [
          {
            label: "💬 Negotiation History",
            key: "latestResponse",
            render: () => {
              const quotesWithResponse = negotiationHistory.filter(r => r.itemType === 'quote' && r.clientResponse);
              const lastResponseQuote = quotesWithResponse.length > 0 ? quotesWithResponse[0] : null;
              
              // Determine response type from clientResponse text
              let displayText = '';
              let bgColor = '#f5f5f5';
              let borderColor = '#d9d9d9';
              let textColor = '#999';
              
              if (lastResponseQuote) {
                const response = lastResponseQuote.clientResponse || '';
                if (response.includes('Accepted')) {
                  displayText = '✓ Accepted';
                  bgColor = '#f6ffed';
                  borderColor = '#b7eb8f';
                  textColor = '#52c41a';
                } else if (response.includes('Counter-offer')) {
                  displayText = '💰 Counter-Offer';
                  bgColor = '#e6f7ff';
                  borderColor = '#91d5ff';
                  textColor = '#1890ff';
                } else if (response.includes('Cancelled')) {
                  displayText = '❌ Cancelled';
                  bgColor = '#fff1f0';
                  borderColor = '#ffccc7';
                  textColor = '#ff4d4f';
                } else {
                  displayText = '⚠️ Rejected';
                  bgColor = '#fff7e6';
                  borderColor = '#ffd591';
                  textColor = '#fa8c16';
                }
              }
              
              return (
                <div>
                  {/* Latest Response */}
                  {lastResponseQuote ? (
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: bgColor, 
                      border: `1px solid ${borderColor}`, 
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: textColor }}>
                          {displayText}
                        </strong>
                        <span style={{ marginLeft: '12px', fontSize: '12px', color: '#999' }}>
                          {new Date(lastResponseQuote.responseTime).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#262626' }}>
                        {lastResponseQuote.clientResponse}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontSize: '14px', marginBottom: '12px' }}>Waiting for client response...</div>
                  )}
                  
                  {/* View Full History Button */}
                  {negotiationHistory.length > 0 && (
                    <div>
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setShowFullHistory(!showFullHistory)}
                        style={{ padding: 0, marginBottom: '10px' }}
                      >
                        {showFullHistory ? 'Hide Full History' : 'View Full Negotiation History'} ({negotiationHistory.length} records)
                      </Button>
                      
                      {showFullHistory && (
                        <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
                          <Timeline mode="start">
                            {/* System Estimate */}
                            {selectedRequest?.systemEstimate && (
                              <Timeline.Item 
                                color="gray"
                                dot={<ClockCircleOutlined />}
                              >
                                <div>
                                  <strong style={{ color: '#8c8c8c' }}>💻 System Estimate</strong>
                                  <br />
                                  <small style={{ color: '#999' }}>
                                    {new Date(selectedRequest.createdAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </small>
                                  <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: '4px' }}>
                                    <div><strong>Estimated Price:</strong> ${selectedRequest.systemEstimate}</div>
                                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#8c8c8c' }}>
                                      Auto-calculated based on service parameters
                                    </div>
                                  </div>
                                </div>
                              </Timeline.Item>
                            )}
                            
                            {/* Client Initial Budget */}
                            {selectedRequest?.clientBudget && (
                              <Timeline.Item 
                                color="blue"
                                dot={<ClockCircleOutlined />}
                              >
                                <div>
                                  <strong style={{ color: '#1890ff' }}>💰 Client Initial Budget</strong>
                                  <br />
                                  <small style={{ color: '#999' }}>
                                    {new Date(selectedRequest.createdAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </small>
                                  <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px' }}>
                                    <div><strong>Client's Budget:</strong> ${selectedRequest.clientBudget}</div>
                                    {selectedRequest.note && (
                                      <div style={{ marginTop: '4px' }}>
                                        <strong>Note:</strong> {selectedRequest.note}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Timeline.Item>
                            )}
                            
                            {[...negotiationHistory].reverse().map((record, idx) => {
                              const isManagerQuote = record.itemType === 'quote' && record.senderName === 'manager';
                              const isClientQuote = record.itemType === 'quote' && record.senderName === 'client';
                              const hasResponse = record.clientResponse && record.responseTime;
                              const isAccepted = record.state === 'accepted';
                              const isRejected = record.state === 'rejected';
                              const isManagerMessage = record.itemType === 'message' && record.senderName === 'manager';
                              const isClientMessage = record.itemType === 'message' && record.senderName === 'client';
                              
                              return (
                                <Timeline.Item 
                                  key={idx}
                                  color={isAccepted ? 'green' : isRejected ? 'red' : (isManagerQuote || isManagerMessage) ? 'green' : 'blue'}
                                  dot={<ClockCircleOutlined />}
                                >
                                  <div>
                                    <strong style={{ color: isAccepted ? '#52c41a' : isRejected ? '#ff4d4f' : (isManagerQuote || isManagerMessage) ? '#52c41a' : '#1890ff' }}>
                                      {isManagerQuote ? '💼 Manager Quote' : 
                                       isClientQuote ? '💰 Client Offer' :
                                       isManagerMessage ? '📝 Manager Message' :
                                       isClientMessage ? 'Client Message' : 'System Note'}
                                      {hasResponse && (isAccepted ? ' [Accepted]' : isRejected ? ' [Rejected]' : '')}
                                    </strong>
                                    <br />
                                    <small style={{ color: '#999' }}>
                                      {new Date(record.createdAt || new Date()).toLocaleString()}
                                    </small>
                                    
                                    {(isManagerQuote || isClientQuote) && (
                                      <div style={{ marginTop: '8px', padding: '10px', backgroundColor: isManagerQuote ? '#f6ffed' : '#e6f7ff', border: `1px solid ${isManagerQuote ? '#b7eb8f' : '#91d5ff'}`, borderRadius: '4px' }}>
                                        {record.price && <div><strong>Price:</strong> ${record.price}</div>}
                                        {record.businessTime && <div><strong>Time:</strong> {new Date(record.businessTime).toLocaleString()}</div>}
                                        {record.messageBody && <div><strong>{isManagerQuote ? 'Manager' : 'Client'} Note:</strong> {record.messageBody}</div>}
                                      </div>
                                    )}
                                    
                                    {hasResponse && (
                                      <div style={{ marginTop: '8px', padding: '10px', backgroundColor: isAccepted ? '#f6ffed' : '#fff1f0', border: `1px solid ${isAccepted ? '#b7eb8f' : '#ffccc7'}`, borderRadius: '4px' }}>
                                        <div><strong>👤 Client Response:</strong></div>
                                        <div style={{ marginTop: '4px' }}>{record.clientResponse}</div>
                                        <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                                          {new Date(record.responseTime).toLocaleString()}
                                        </small>
                                      </div>
                                    )}
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
        ]
      : []),
    
    // Pricing Reference Section - AFTER history (only show system estimate and client budget)
    {
      label: "💰 Pricing Reference",
      key: "pricingReference",
      render: (_, data) => {
        // Find the latest client counter-offer to show as their current budget
        const clientCounterOffers = negotiationHistory.filter(r => 
          r.itemType === 'quote' && 
          r.senderName === 'client'
        );
        
        const latestClientOffer = clientCounterOffers.length > 0 ? clientCounterOffers[0] : null;
        const displayBudget = latestClientOffer ? latestClientOffer.price : data.clientBudget;
        
        return (
          <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>🤖 System Estimate</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                  {data.systemEstimate ? `$${data.systemEstimate}` : 'N/A'}
                </div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '6px', border: '1px solid #91d5ff' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  👤 {latestClientOffer ? 'Client Counter-Offer' : 'Client Budget'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                  {displayBudget ? `$${displayBudget}` : 'No limit'}
                </div>
              </div>
            </div>
          </div>
        );
      }
    },

    // Your Response Section
    {
      label: selectedRequest?.managerQuote ? "Your Response" : "Your Quote",
      key: "newQuote",
      render: () => {
        const hasClientCounterOffer = negotiationHistory.some(r => r.senderName === 'client' && r.itemType === 'quote');
        
        return (
          <div style={{ backgroundColor: '#f0f5ff', padding: '20px', borderRadius: '8px', border: '1px solid #adc6ff' }}>
            {hasClientCounterOffer && (
              <div style={{ marginBottom: '20px' }}>
                <Radio.Group
                  value={responseType}
                  onChange={(e) => setResponseType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="accept">
                      <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                        <CheckCircleOutlined /> Accept client's counter-offer (${managerQuote})
                      </span>
                    </Radio>
                    <Radio value="revise">
                      <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        <DollarOutlined /> Send a revised quote (continue negotiation)
                      </span>
                    </Radio>
                    <Radio value="reject">
                      <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                        <CloseCircleOutlined /> Decline this request (end negotiation)
                      </span>
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>
            )}
            
            {(responseType === 'accept' || responseType === 'revise') && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Price ($):
                  </label>
                  <InputNumber
                    prefix="$"
                    value={managerQuote}
                    onChange={(value) => setManagerQuote(value)}
                    placeholder="Enter price"
                    min={0}
                    step={10}
                    disabled={responseType === 'accept'}
                    style={{ width: '100%', fontSize: '16px' }}
                    size="large"
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    Scheduled Date & Time:
                  </label>
                  <DatePicker
                    showTime={{ format: 'HH:00', minuteStep: 60 }}
                    format="MM/DD/YYYY HH:00"
                    value={managerTime ? dayjs(managerTime) : null}
                    onChange={(date) => setManagerTime(date ? date.format('YYYY-MM-DDTHH:00') : '')}
                    placeholder="Select date and time"
                    style={{ width: '100%' }}
                    size="large"
                  />
                </div>
              </>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                {responseType === 'reject' ? 'Reason for declining (Optional):' : 'Notes to Client (Optional):'}
              </label>
              <Input.TextArea
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder={
                  responseType === 'reject' 
                    ? "Explain why you cannot accept this request..." 
                    : "Add any notes or explanation for your quote..."
                }
                rows={3}
                maxLength={500}
                showCount
                style={{ fontSize: '14px' }}
              />
            </div>
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


