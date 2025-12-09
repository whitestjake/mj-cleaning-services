// Shared utility functions

/**
 * Format date/time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateString) => {
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

/**
 * Get auth token from sessionStorage
 * @returns {string|null} JWT token
 */
export const getAuthToken = () => {
  return sessionStorage.getItem('token');
};

/**
 * Fetch negotiation records for a service request
 * DEPRECATED: Use RequestsAPI.getRecords() instead
 * @param {number} requestId - Service request ID
 * @returns {Promise<Array>} Array of records
 */
export const fetchNegotiationRecords = async (requestId) => {
  const { RequestsAPI } = await import('../api');
  return await RequestsAPI.getRecords(requestId);
};

/**
 * Render negotiation history timeline
 * @param {Array} negotiationHistory - Array of negotiation records
 * @param {Object} React - React object with Timeline and ClockCircleOutlined
 * @param {Object} requestData - Original request data with systemEstimate and clientBudget
 * @returns {JSX.Element} Rendered timeline
 */
export const renderNegotiationHistory = (negotiationHistory, { Timeline, ClockCircleOutlined }, requestData = null) => {
  const processedHistory = [];
  
  // Add initial system estimate and client budget at the beginning
  if (requestData) {
    if (requestData.systemEstimate) {
      processedHistory.push({
        type: 'system-estimate',
        price: requestData.systemEstimate,
        createdAt: requestData.createdAt
      });
    }
    
    if (requestData.clientBudget) {
      processedHistory.push({
        type: 'client-budget',
        price: requestData.clientBudget,
        note: requestData.note,
        createdAt: requestData.createdAt
      });
    }
  }
  
  // Add all negotiation records (reverse to show oldest first)
  const reversedHistory = [...negotiationHistory].reverse();
  
  // Track if we've already shown the initial client budget
  let initialClientBudgetShown = requestData?.clientBudget ? true : false;
  
  reversedHistory.forEach((record, index) => {
    if (record.itemType === 'quote') {
      // Skip the first client quote if it matches the initial budget (it's a duplicate)
      if (
        initialClientBudgetShown && 
        index === 0 && 
        record.senderName === 'client' && 
        requestData?.clientBudget && 
        parseFloat(record.price) === parseFloat(requestData.clientBudget)
      ) {
        return; // Skip this duplicate record
      }
      
      // Skip client counter-offer quotes if the previous manager quote already shows it in clientResponse
      if (
        record.senderName === 'client' &&
        index > 0 &&
        reversedHistory[index - 1].itemType === 'quote' &&
        reversedHistory[index - 1].senderName === 'manager' &&
        reversedHistory[index - 1].clientResponse &&
        reversedHistory[index - 1].clientResponse.includes('Counter-offer')
      ) {
        return; // Skip this duplicate - it's already shown in the manager quote's response
      }
      
      processedHistory.push({
        type: 'quote',
        sender: record.senderName,
        price: record.price,
        time: record.businessTime,
        note: record.messageBody,
        createdAt: record.createdAt,
        clientResponse: record.clientResponse,
        responseTime: record.responseTime,
        state: record.state
      });
    } else if (record.itemType === 'message') {
      processedHistory.push({
        type: 'message',
        sender: record.senderName,
        message: record.messageBody,
        createdAt: record.createdAt
      });
    }
  });
  
  if (processedHistory.length === 0) {
    return <p style={{ color: '#999' }}>No negotiation history yet</p>;
  }
  
  return (
    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <Timeline mode="left">
        {processedHistory.map((item, idx) => {
          // System Estimate
          if (item.type === 'system-estimate') {
            return (
              <Timeline.Item 
                key={idx}
                color="gray"
                dot={<ClockCircleOutlined />}
              >
                <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: '2px dashed #d9d9d9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#8c8c8c', fontSize: '15px' }}>
                      💻 System Estimate
                    </strong>
                    <small style={{ color: '#999' }}>
                      {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8c8c8c', marginBottom: '4px' }}>
                    ${item.price}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                    Auto-calculated based on service details
                  </div>
                </div>
              </Timeline.Item>
            );
          }
          
          // Client Initial Budget
          if (item.type === 'client-budget') {
            return (
              <Timeline.Item 
                key={idx}
                color="blue"
                dot={<ClockCircleOutlined />}
              >
                <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: '2px solid #91d5ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#1890ff', fontSize: '15px' }}>
                      💰 Client Initial Budget
                    </strong>
                    <small style={{ color: '#999' }}>
                      {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
                    ${item.price}
                  </div>
                  {item.note && (
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f5ff', borderRadius: '4px', fontSize: '13px' }}>
                      📝 {item.note}
                    </div>
                  )}
                </div>
              </Timeline.Item>
            );
          }
          
          // Manager or Client Quote
          if (item.type === 'quote') {
            const isManager = item.sender === 'manager';
            const statusColor = item.state === 'accepted' ? '#52c41a' : item.state === 'rejected' ? '#ff4d4f' : '#faad14';
            
            return (
              <Timeline.Item 
                key={idx}
                color={isManager ? 'green' : 'blue'}
                dot={<ClockCircleOutlined />}
              >
                <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: `2px solid ${isManager ? '#b7eb8f' : '#91d5ff'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: isManager ? '#52c41a' : '#1890ff', fontSize: '15px' }}>
                      {isManager ? '💼 Manager Quote' : '💰 Client Counter-Offer'}
                    </strong>
                    <small style={{ color: '#999' }}>
                      {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: isManager ? '#52c41a' : '#1890ff', marginBottom: '8px' }}>
                    ${item.price}
                  </div>
                  {item.time && (
                    <div style={{ marginBottom: '4px', color: '#666' }}>
                      📅 Scheduled: {new Date(item.time).toLocaleString()}
                    </div>
                  )}
                  {item.note && (
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px', fontSize: '13px' }}>
                      📝 {item.note}
                    </div>
                  )}
                  
                  {item.clientResponse && (
                    <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: '#1890ff' }}>👤 Client Response</strong>
                        <small style={{ color: '#999' }}>
                          {new Date(item.responseTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                      <div>{item.clientResponse}</div>
                      <div style={{ marginTop: '8px', fontWeight: 'bold', color: statusColor }}>
                        Status: {item.state?.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </Timeline.Item>
            );
          } else {
            // Message
            const isManager = item.sender === 'manager';
            const messageText = item.message || '';
            
            // Determine message type based on content
            let icon = isManager ? '📝' : '💬';
            let title = isManager ? 'Manager Note' : 'Client Message';
            let bgColor = 'white';
            let borderColor = '#d9d9d9';
            
            if (messageText.includes('completed payment')) {
              icon = '[Payment]';
              title = 'Payment Completed';
              bgColor = '#f6ffed';
              borderColor = '#b7eb8f';
            } else if (messageText.includes('confirmed payment')) {
              icon = '[Confirmed]';
              title = 'Payment Confirmed';
              bgColor = '#f6ffed';
              borderColor = '#b7eb8f';
            } else if (messageText.includes('disputed bill')) {
              icon = '[Dispute]';
              title = 'Bill Disputed';
              bgColor = '#fff7e6';
              borderColor = '#ffd591';
            } else if (messageText.includes('Service completed')) {
              icon = '[Complete]';
              title = 'Service Completed';
              bgColor = '#f0f5ff';
              borderColor = '#adc6ff';
            } else if (messageText.includes('accepted counter-offer')) {
              icon = '[Accepted]';
              title = 'Counter-Offer Accepted';
              bgColor = '#f6ffed';
              borderColor = '#b7eb8f';
            }
            
            return (
              <Timeline.Item 
                key={idx}
                color="gray"
                dot={<ClockCircleOutlined />}
              >
                <div style={{ padding: '10px', backgroundColor: bgColor, borderRadius: '4px', border: `1px solid ${borderColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: isManager ? '#52c41a' : '#1890ff' }}>
                      {icon} {title}
                    </strong>
                    <small style={{ color: '#999' }}>
                      {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <div style={{ color: '#666' }}>{item.message}</div>
                </div>
              </Timeline.Item>
            );
          }
        })}
      </Timeline>
    </div>
  );
};
