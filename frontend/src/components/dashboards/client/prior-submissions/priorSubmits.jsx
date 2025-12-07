import { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert, Button, Space, Modal, Typography, Descriptions, Timeline, Card, Input, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

const PriorSubmits = ({ onUpdate }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [communicationHistory, setCommunicationHistory] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/service-requests', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests || []);
            } else {
                setError('Failed to load requests');
            }
        } catch (err) {
            console.error('Request fetch error:', err);
            setError('Network error');
        } finally {
            setLoading(false);
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

    const getStatusTag = (status) => {
        const statusConfig = {
            'new': { color: 'blue', text: 'Submitted' },
            'pending_response': { color: 'orange', text: 'Quote Received - Action Required' },
            'accepted': { color: 'purple', text: 'In Progress' },
            'completed': { color: 'cyan', text: 'Completed' },
            'rejected': { color: 'red', text: 'Rejected' },
            'cancelled': { color: 'default', text: 'Cancelled' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const handleAcceptQuote = async (request) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/service-requests/${request.id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'accepted' })
            });
            
            if (response.ok) {
                // Create acceptance record
                await fetch(`http://localhost:5000/api/service-requests/${request.id}/records`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        itemType: 'response',
                        messageBody: `Client accepted quote of $${request.managerQuote}`
                    })
                });
                
                Modal.success({
                    content: 'Quote accepted! The service will be completed at the scheduled time.',
                });
                fetchRequests();
                setModalVisible(false);
                if (onUpdate) onUpdate();
            } else {
                Modal.error({ content: 'Failed to accept quote' });
            }
        } catch (err) {
            console.error('Accept quote error:', err);
            Modal.error({ content: 'Network error' });
        }
    };

    const handleRejectQuote = async (request) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/service-requests/${request.id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'new' })
            });
            
            if (response.ok) {
                // Create rejection record
                await fetch(`http://localhost:5000/api/service-requests/${request.id}/records`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        itemType: 'response',
                        messageBody: `Client rejected quote of $${request.managerQuote}. Requesting new quote.`
                    })
                });
                
                Modal.success({
                    content: 'Quote rejected. The request has been returned to the manager for a new quote.',
                });
                fetchRequests();
                setModalVisible(false);
                if (onUpdate) onUpdate();
            } else {
                Modal.error({ content: 'Failed to reject quote' });
            }
        } catch (err) {
            console.error('Reject quote error:', err);
            Modal.error({ content: 'Network error' });
        }
    };

    const showQuoteDetails = async (record) => {
        console.log('Opening quote details for:', record);
        setSelectedRequest(record);
        setModalVisible(true);
        
        // Fetch communication history
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/service-requests/${record.id}/records`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setCommunicationHistory(data.records || []);
            }
        } catch (err) {
            console.error('Failed to fetch communication history:', err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) {
            message.warning('Please enter a message');
            return;
        }

        setSendingMessage(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/service-requests/${selectedRequest.id}/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: newMessage })
            });
            
            if (response.ok) {
                message.success('Message sent!');
                setNewMessage('');
                // Refresh communication history
                showQuoteDetails(selectedRequest);
            } else {
                message.error('Failed to send message');
            }
        } catch (err) {
            console.error('Send message error:', err);
            message.error('Network error');
        } finally {
            setSendingMessage(false);
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
            render: getStatusTag,
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
                if (record.state === 'pending_response') {
                    return (
                        <Button 
                            type="primary" 
                            size="small"
                            onClick={() => showQuoteDetails(record)}
                        >
                            Review Quote
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
                                    ${selectedRequest.managerQuote}
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

                        {/* Communication History */}
                        <Card 
                            title={<><MessageOutlined /> Communication History</>} 
                            style={{ marginTop: '20px' }}
                            size="small"
                        >
                            {communicationHistory.length > 0 ? (
                                <Timeline mode="left">
                                    {communicationHistory.map((record, idx) => (
                                        <Timeline.Item 
                                            key={idx}
                                            color={record.senderName === 'client' ? 'blue' : 'green'}
                                            dot={<ClockCircleOutlined />}
                                        >
                                            <div>
                                                <Text strong>{record.senderName === 'client' ? 'You' : 'Manager'}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {formatDate(record.createdAt || new Date())}
                                                </Text>
                                                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                                    {record.messageBody}
                                                </div>
                                            </div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            ) : (
                                <Text type="secondary">No messages yet</Text>
                            )}

                            {/* Message Input */}
                            <div style={{ marginTop: '16px' }}>
                                <TextArea
                                    rows={3}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message to the manager..."
                                    maxLength={500}
                                />
                                <Button
                                    type="primary"
                                    icon={<MessageOutlined />}
                                    onClick={handleSendMessage}
                                    loading={sendingMessage}
                                    style={{ marginTop: '8px' }}
                                >
                                    Send Message
                                </Button>
                            </div>
                        </Card>

                        {selectedRequest.state === 'pending_response' && (
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <Space size="large">
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        size="large"
                                        onClick={() => handleAcceptQuote(selectedRequest)}
                                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                    >
                                        Accept Quote
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        size="large"
                                        onClick={() => handleRejectQuote(selectedRequest)}
                                    >
                                        Reject Quote
                                    </Button>
                                </Space>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );

}

export default PriorSubmits
