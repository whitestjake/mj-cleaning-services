import { useState, useEffect, useRef } from 'react';
import { Table, Tag, Spin, Alert, Button, Space, Modal, Typography, Descriptions, Card, Input, Radio, InputNumber, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, CreditCardOutlined, ReloadOutlined } from '@ant-design/icons';
import { RequestsAPI } from '../../../../api';

const { Text } = Typography;
const { TextArea } = Input;

const PriorSubmits = ({ onUpdate }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [clientNote, setClientNote] = useState('');
    const [counterOffer, setCounterOffer] = useState('');
    const [responseType, setResponseType] = useState('accept'); // 'accept', 'reject', 'counter'
    const [disputeNote, setDisputeNote] = useState('');
    const [billModalVisible, setBillModalVisible] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchRequests();
        
        // Poll for updates every 10 seconds
        intervalRef.current = setInterval(() => {
            fetchRequests(true); // Silent refresh
        }, 10000);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const fetchRequests = async (silent = false) => {
        if (!silent) {
            setRefreshing(true);
        }
        try {
            const data = await RequestsAPI.getByStatus();
            setRequests(data || []);
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
            if (!silent) {
                setRefreshing(false);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusTag = (status, record) => {
        // Special handling for completed but unpaid bills
        if (status === 'completed') {
            if (record.isPaid) {
                return <Tag color="green">Paid</Tag>;
            } else if (record.isDisputed) {
                return <Tag color="orange">Bill Disputed</Tag>;
            } else {
                return <Tag color="red">Payment Due</Tag>;
            }
        }

        const statusConfig = {
            'new': { color: 'blue', text: 'Submitted' },
            'pending_response': { color: 'orange', text: 'Quote Received - Action Required' },
            'rejected': { color: 'default', text: 'Cancelled' },
            'accepted': { color: 'green', text: 'Accepted - Service Scheduled' },
            'cancelled': { color: 'default', text: 'Cancelled' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const handleAcceptQuote = async (request) => {
        try {
            const result = await RequestsAPI.updateStatus(request.id, 'accepted');
            
            if (result.success) {
                // Update the latest pending quote with client's acceptance
                const noteText = clientNote.trim() || 'No additional notes';
                await RequestsAPI.updateQuoteResponse(request.id, { 
                    clientResponse: `Accepted. ${noteText}`,
                    state: 'accepted'
                });
                
                Modal.success({
                    content: 'Quote accepted! The service will be completed at the scheduled time.',
                });
                setClientNote('');
                setCounterOffer('');
                setResponseType('accept');
                fetchRequests();
                setModalVisible(false);
                if (onUpdate) onUpdate();
            } else {
                Modal.error({ content: 'Failed to accept quote' });
            }
        } catch (err) {
            Modal.error({ content: 'Network error' });
        }
    };

    const handleCounterOffer = async (request) => {
        if (!counterOffer || parseFloat(counterOffer) <= 0) {
            Modal.error({ content: 'Please enter a valid counter-offer amount' });
            return;
        }

        try {
            const result = await RequestsAPI.updateStatus(request.id, 'new');
            
            if (result.success) {
                // Clean up the client note - remove if it's just repeating the price
                let noteText = clientNote.trim();
                // Check if note is just the price repeated (e.g., "120", "$120", "120.00")
                if (!noteText || noteText === counterOffer.toString() || noteText === `$${counterOffer}` || parseFloat(noteText) === parseFloat(counterOffer)) {
                    noteText = ''; // Use empty note instead of repeating price
                }
                
                // First, mark the manager's latest quote as rejected by updating clientResponse
                const responseText = noteText ? `Counter-offer: $${counterOffer}. ${noteText}` : `Counter-offer: $${counterOffer}`;
                await RequestsAPI.updateQuoteResponse(request.id, { 
                    clientResponse: responseText,
                    state: 'rejected'
                });
                
                // Then, create a NEW record for client's counter-offer quote
                await RequestsAPI.addRecord(request.id, {
                    itemType: 'quote',
                    price: parseFloat(counterOffer),
                    businessTime: null,
                    senderName: 'client',
                    messageBody: noteText || 'Client counter-offer'
                });
                
                Modal.success({ 
                    title: 'Counter-offer Submitted',
                    content: `Your counter-offer of $${counterOffer} has been sent to the manager for review.` 
                });
                setClientNote('');
                setCounterOffer('');
                setResponseType('accept');
                fetchRequests();
                setModalVisible(false);
                if (onUpdate) onUpdate();
            } else {
                Modal.error({ content: 'Failed to submit counter-offer' });
            }
        } catch (err) {
            Modal.error({ content: 'Network error' });
        }
    };

    const handleRejectQuote = async (request) => {
        try {
            const result = await RequestsAPI.updateStatus(request.id, 'rejected');
            
            if (result.success) {
                // Update the latest pending quote with client's cancellation
                const noteText = clientNote.trim() || 'No reason provided';
                await RequestsAPI.updateQuoteResponse(request.id, { 
                    clientResponse: `Cancelled. Reason: ${noteText}`,
                    state: 'rejected'
                });
                
                Modal.success({
                    content: 'Service request cancelled. Thank you for considering our services.',
                });
                setClientNote('');
                setCounterOffer('');
                setResponseType('accept');
                fetchRequests();
                setModalVisible(false);
                if (onUpdate) onUpdate();
            } else {
                Modal.error({ content: result.message || 'Failed to cancel request' });
            }
        } catch (err) {
            Modal.error({ content: 'Network error: ' + err.message });
        }
    };

    const handlePayBill = async (request) => {
        try {
            const result = await RequestsAPI.payBill(request.id);
            
            if (result.success) {
                // Add record for payment
                await RequestsAPI.addRecord(request.id, {
                    itemType: 'message',
                    messageBody: `Client completed payment of $${request.managerQuote}`,
                    senderName: 'client'
                });
                
                message.success('Payment successful! Receipt sent to your email.');
                
                // Close modal first
                setBillModalVisible(false);
                setSelectedRequest(null);
                
                // Then refresh data
                await fetchRequests();
                
                if (onUpdate) onUpdate();
            } else {
                message.error('Payment failed. Please try again.');
            }
        } catch (err) {
            console.error('handlePayBill error:', err);
            message.error('Network error: ' + err.message);
        }
    };

    const handleDisputeBill = async (request) => {
        if (!disputeNote.trim()) {
            message.warning('Please provide a reason for disputing the bill.');
            return;
        }

        try {
            const result = await RequestsAPI.disputeBill(request.id, disputeNote);
            
            if (result.success) {
                message.info('Dispute submitted. Manager will review and respond.');
                
                // Close modal first
                setBillModalVisible(false);
                setSelectedRequest(null);
                setDisputeNote('');
                
                // Then refresh data
                await fetchRequests();
                
                if (onUpdate) onUpdate();
            } else {
                message.error('Failed to submit dispute.');
            }
        } catch (err) {
            message.error('Network error: ' + err.message);
        }
    };

    const showBillModal = async (record) => {
        // Fetch latest data to get current payment status
        try {
            const freshData = await RequestsAPI.getById(record.id);
            setSelectedRequest(freshData);
        } catch (err) {
            setSelectedRequest(record);
        }
        setBillModalVisible(true);
        setDisputeNote('');
    };

    const showQuoteDetails = async (record) => {
        setSelectedRequest(record);
        setModalVisible(true);
        setClientNote('');
        setCounterOffer('');
        setResponseType('accept');
        
        // Fetch communication history to check if already responded
        try {
            const data = await RequestsAPI.getRecords(record.id);
            const records = data || [];
            
            // Check if the latest PENDING quote has been responded to
            // Records are sorted by id DESC (newest first)
            const latestPendingQuote = records.find(r => r.itemType === 'quote' && r.state === 'pending');
            const hasResponded = latestPendingQuote && latestPendingQuote.clientResponse;
            
            // Add flag to selected request
            setSelectedRequest({
                ...record,
                hasResponded: hasResponded
            });
        } catch (err) {
            // Silently fail for communication history
        }
    };



    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (text) => formatDate(text),
            width: '15%'
        },
        {
            title: 'Service',
            dataIndex: 'serviceType',
            key: 'service',
            width: '12%'
        },
        {
            title: 'Requested Date',
            dataIndex: 'serviceDate',
            key: 'serviceDate',
            render: (text) => formatDate(text),
            width: '15%'
        },
        {
            title: 'Status',
            dataIndex: 'state',
            key: 'status',
            render: (state, record) => getStatusTag(state, record),
            width: '18%'
        },
        {
            title: 'Manager Quote',
            dataIndex: 'managerQuote',
            key: 'managerQuote',
            render: (quote) => quote ? `$${quote}` : '-',
            width: '12%'
        },
        {
            title: 'Scheduled Time',
            dataIndex: 'scheduledTime',
            key: 'scheduledTime',
            render: (time) => time ? formatDate(time) : '-',
            width: '15%'
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                // Show "Review Quote" for pending_response with a quote
                if (record.state === 'pending_response' && record.managerQuote) {
                    return (
                        <Button 
                            type="primary" 
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                showQuoteDetails(record);
                            }}
                        >
                            Review Quote
                        </Button>
                    );
                }
                // Show "View Bill" for completed but unpaid
                if (record.state === 'completed' && !record.isPaid) {
                    return (
                        <Button 
                            type="primary"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                showBillModal(record);
                            }}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                            View Bill
                        </Button>
                    );
                }
                return '-';
            },
            width: '13%'
        }
    ];

    if (loading) return <Spin tip="Loading your requests..." />;
    if (error) return <Alert message="Error" description={error} type="error" />;

    return (
        <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => fetchRequests(false)}
                        loading={refreshing}
                    >
                        Refresh
                    </Button>
                    <span style={{ marginLeft: 12, color: '#999', fontSize: '12px' }}>
                        Auto-refreshes every 10 seconds
                    </span>
                </div>
            </div>
            <Table
                dataSource={requests}
                columns={columns}
                pagination={{ pageSize: 10 }}
                size="small"
                rowKey="id"
                locale={{
                    emptyText: 'No requests submitted yet. Create your first request in the "New Request" tab!'
                }}
                scroll={{ y: 400 }}
            />

            <Modal
                title="Manager Quote Details"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                width={700}
                footer={null}
            >
                {selectedRequest && (
                    <div>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Service Type" span={2}>
                                {selectedRequest.serviceType}
                            </Descriptions.Item>
                            <Descriptions.Item label="Number of Rooms">
                                {selectedRequest.numRooms}
                            </Descriptions.Item>
                            <Descriptions.Item label="Outdoor Service">
                                {selectedRequest.addOutdoor ? 'Yes' : 'No'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Service Address" span={2}>
                                {selectedRequest.serviceAddress || 'Not specified'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Your Budget">
                                {selectedRequest.clientBudget ? `$${selectedRequest.clientBudget}` : 'No limit'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Manager Quote">
                                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                    {selectedRequest.managerQuote ? `$${selectedRequest.managerQuote}` : '-'}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Scheduled Time" span={2}>
                                <Text strong>{formatDate(selectedRequest.scheduledTime)}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Your Notes" span={2}>
                                {selectedRequest.note || 'None'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Manager Notes" span={2}>
                                {selectedRequest.managerNote || 'None'}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedRequest.photos && selectedRequest.photos.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <h4>Uploaded Photos:</h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {selectedRequest.photos.map((photo, idx) => (
                                        <img
                                            key={idx}
                                            src={photo}
                                            alt={`Uploaded ${idx + 1}`}
                                            style={{ 
                                                width: '120px', 
                                                height: '120px', 
                                                objectFit: 'cover',
                                                cursor: 'pointer',
                                                border: '1px solid #d9d9d9',
                                                borderRadius: '4px'
                                            }}
                                            onClick={() => window.open(photo, '_blank')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {(selectedRequest.state === 'pending_response' || selectedRequest.state === 'rejected') && !selectedRequest.hasResponded && (
                            <div style={{ marginTop: '20px' }}>
                                <Card title="Your Response" size="small" style={{ marginBottom: '16px' }}>
                                    <Radio.Group 
                                        value={responseType} 
                                        onChange={(e) => setResponseType(e.target.value)}
                                        style={{ marginBottom: '16px', width: '100%' }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Radio value="accept">
                                                <Text strong style={{ color: '#52c41a' }}>
                                                    <CheckCircleOutlined /> Accept the quote (${selectedRequest.managerQuote})
                                                </Text>
                                            </Radio>
                                            <Radio value="counter">
                                                <Text strong style={{ color: '#1890ff' }}>
                                                    <DollarOutlined /> Make a counter-offer (continue negotiation)
                                                </Text>
                                            </Radio>
                                            <Radio value="reject">
                                                <Text strong style={{ color: '#ff4d4f' }}>
                                                    <CloseCircleOutlined /> Cancel service request (end negotiation)
                                                </Text>
                                            </Radio>
                                        </Space>
                                    </Radio.Group>

                                    {responseType === 'counter' && (
                                        <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '4px' }}>
                                            <Text strong>Your Counter-Offer Price:</Text>
                                            <InputNumber
                                                prefix="$"
                                                style={{ width: '200px', marginLeft: '12px' }}
                                                min={0}
                                                step={10}
                                                value={counterOffer}
                                                onChange={(value) => setCounterOffer(value)}
                                                placeholder="Enter your price"
                                            />
                                        </div>
                                    )}

                                    <TextArea
                                        rows={3}
                                        value={clientNote}
                                        onChange={(e) => setClientNote(e.target.value)}
                                        placeholder={
                                            responseType === 'accept' ? "Optional: Add a note about accepting..." :
                                            responseType === 'counter' ? "Optional: Explain why you're offering this price..." :
                                            "Optional: Tell us why you're cancelling..."
                                        }
                                        maxLength={500}
                                        showCount
                                    />
                                </Card>
                                
                                <div style={{ textAlign: 'center' }}>
                                    {responseType === 'accept' && (
                                        <Button
                                            type="primary"
                                            icon={<CheckCircleOutlined />}
                                            size="large"
                                            onClick={() => handleAcceptQuote(selectedRequest)}
                                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                        >
                                            Accept Quote
                                        </Button>
                                    )}
                                    {responseType === 'counter' && (
                                        <Button
                                            type="primary"
                                            icon={<DollarOutlined />}
                                            size="large"
                                            onClick={() => handleCounterOffer(selectedRequest)}
                                        >
                                            Submit Counter-Offer
                                        </Button>
                                    )}
                                    {responseType === 'reject' && (
                                        <Button
                                            danger
                                            icon={<CloseCircleOutlined />}
                                            size="large"
                                            onClick={() => handleRejectQuote(selectedRequest)}
                                        >
                                            Cancel Service Request
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {(selectedRequest.state === 'pending_response') && selectedRequest.hasResponded && (
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <Card style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
                                    <Text style={{ color: '#1890ff', fontSize: '14px' }}>
                                        ⏳ You have already responded to this quote. Waiting for manager to send a new quote...
                                    </Text>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Bill Payment/Dispute Modal */}
            <Modal
                title="Service Bill"
                open={billModalVisible}
                onCancel={() => setBillModalVisible(false)}
                width={600}
                footer={null}
            >
                {selectedRequest && (
                    <div>
                        <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f6ffed' }}>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Service Type">
                                    {selectedRequest.serviceType}
                                </Descriptions.Item>
                                <Descriptions.Item label="Completion Date">
                                    {formatDate(selectedRequest.completionDate)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Final Amount">
                                    <Text strong style={{ fontSize: '20px', color: '#52c41a' }}>
                                        ${selectedRequest.managerQuote}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Payment Card">
                                    <Text code>
                                        {selectedRequest.cardNumber ? `****-****-****-${selectedRequest.cardNumber.slice(-4)}` : 'No card on file'}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Manager Notes">
                                    {selectedRequest.managerNote || 'No additional notes'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Show payment/dispute options only if not paid */}
                        {!selectedRequest.clientPaid && !selectedRequest.isPaid ? (
                            <div style={{ marginTop: '20px' }}>
                                <Text strong>Choose an option:</Text>
                                
                                <Space direction="vertical" style={{ width: '100%', marginTop: '12px' }} size="large">
                                    <Card 
                                        hoverable
                                        onClick={() => handlePayBill(selectedRequest)}
                                        style={{ borderColor: '#52c41a', cursor: 'pointer' }}
                                    >
                                        <Space>
                                            <CreditCardOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                                            <div>
                                                <Text strong style={{ color: '#52c41a' }}>Pay Now with Credit Card</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Complete payment immediately
                                                </Text>
                                            </div>
                                        </Space>
                                    </Card>

                                    <Card style={{ borderColor: '#faad14' }}>
                                        <Text strong style={{ color: '#faad14' }}>Dispute This Bill</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px', marginBottom: '12px', display: 'block' }}>
                                            If you believe the bill is incorrect, explain the issue:
                                        </Text>
                                        <TextArea
                                            rows={3}
                                            value={disputeNote}
                                            onChange={(e) => setDisputeNote(e.target.value)}
                                            placeholder="Explain why you're disputing this bill..."
                                            maxLength={500}
                                            showCount
                                        />
                                        <Button
                                            type="default"
                                            danger
                                            onClick={() => handleDisputeBill(selectedRequest)}
                                            style={{ marginTop: '12px' }}
                                            block
                                        >
                                            Submit Dispute
                                        </Button>
                                    </Card>
                                </Space>
                            </div>
                        ) : (
                            <div style={{ marginTop: '20px', padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
                                <Text strong>Payment Status: </Text>
                                <Text type="success">{selectedRequest.isPaid ? 'Paid & Confirmed' : 'Payment Received (Awaiting Confirmation)'}</Text>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );

}

export default PriorSubmits
