

import { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert } from 'antd';

const PriorSubmits = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/requests');
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            } else {
                setError('Failed to load requests');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            'pending': { color: 'orange', text: 'Pending Review' },
            'quoted': { color: 'blue', text: 'Quote Received' },
            'accepted': { color: 'green', text: 'Accepted' },
            'rejected': { color: 'red', text: 'Rejected' },
            'cancelled': { color: 'default', text: 'Cancelled' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'created_time',
            key: 'date',
            render: (text) => formatDate(text),
            width: '15%'
        },
        {
            title: 'Service',
            dataIndex: 'serviceType',
            key: 'service',
            width: '15%'
        },
        {
            title: 'Rooms',
            key: 'rooms',
            render: (record) => `${record.numRooms} ${record.addOutdoor ? '+ Outdoor' : ''}`,
            width: '15%'
        },
        {
            title: 'Address',
            dataIndex: 'service_address',
            key: 'address',
            render: (text) => text || 'Not specified',
            width: '25%'
        },
        {
            title: 'Budget',
            dataIndex: 'clientBudget',
            key: 'budget',
            render: (text) => text ? `$${text}` : 'No limit',
            width: '15%'
        },
        {
            title: 'Status',
            dataIndex: 'state',
            key: 'status',
            render: getStatusTag,
            width: '15%'
        }
    ];

    if (loading) return <Spin tip="Loading your requests..." />;
    if (error) return <Alert message="Error" description={error} type="error" />;

    return (
        <Table
            dataSource={requests}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="request_id"
            locale={{
                emptyText: 'No requests submitted yet. Create your first request in the "New Request" tab!'
            }}
            scroll={{ y: 300 }}
        />
    );

}

export default PriorSubmits

