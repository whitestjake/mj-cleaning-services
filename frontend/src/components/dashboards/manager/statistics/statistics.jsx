// Statistics dashboard - displays service and financial analytics
import { useState, useEffect } from 'react';
import { Card, Table, Tabs, Spin, DatePicker, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API_ENDPOINTS } from '../../../../config';

const { TabPane } = Tabs;

const Statistics = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [data, setData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);

    const getToken = () => sessionStorage.getItem('token');

    // Generic fetch function for statistics data
    const fetchData = async (endpoint, params = {}) => {
        setLoading(true);
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_ENDPOINTS.BASE}${endpoint}${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url, {
                headers: { 
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }
            
            const result = await response.json();
            setData(result.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        switch (key) {
            case '1':
                fetchData('/statistics/frequent-clients');
                break;
            case '2':
                fetchData('/statistics/uncommitted-clients');
                break;
            case '3':
                fetchData('/statistics/monthly-quotes', { year: selectedYear, month: selectedMonth });
                break;
            case '4':
                fetchData('/statistics/prospective-clients');
                break;
            case '5':
                fetchData('/statistics/largest-jobs');
                break;
            case '6':
                fetchData('/statistics/overdue-bills');
                break;
            case '7':
                fetchData('/statistics/bad-clients');
                break;
            case '8':
                fetchData('/statistics/good-clients');
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        handleTabChange('1');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = {
        '1': [
            { title: 'Client ID', dataIndex: 'clientID', key: 'clientID' },
            { title: 'Name', dataIndex: 'clientName', key: 'clientName' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Completed Orders', dataIndex: 'completedOrders', key: 'completedOrders' }
        ],
        '2': [
            { title: 'Client ID', dataIndex: 'clientID', key: 'clientID' },
            { title: 'Name', dataIndex: 'clientName', key: 'clientName' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Total Requests', dataIndex: 'totalRequests', key: 'totalRequests' },
            { title: 'Completed', dataIndex: 'completedOrders', key: 'completedOrders' }
        ],
        '3': [
            { title: 'Request ID', dataIndex: 'id', key: 'id' },
            { title: 'Client ID', dataIndex: 'clientID', key: 'clientID' },
            { title: 'Client Name', dataIndex: 'clientName', key: 'clientName' },
            { title: 'Service Type', dataIndex: 'serviceType', key: 'serviceType' },
            { title: 'Agreed Price', dataIndex: 'agreedPrice', key: 'agreedPrice', render: (val) => `$${val}` },
            { title: 'Quote Date', dataIndex: 'quoteDate', key: 'quoteDate', render: (val) => new Date(val).toLocaleDateString() }
        ],
        '4': [
            { title: 'Client ID', dataIndex: 'clientID', key: 'clientID' },
            { title: 'Name', dataIndex: 'clientName', key: 'clientName' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber' }
        ],
        '5': [
            { title: 'Request ID', dataIndex: 'id', key: 'id' },
            { title: 'Client ID', dataIndex: 'clientID', key: 'clientID' },
            { title: 'Client Name', dataIndex: 'clientName', key: 'clientName' },
            { title: 'Service Type', dataIndex: 'serviceType', key: 'serviceType' },
            { title: 'Number of Rooms', dataIndex: 'numRooms', key: 'numRooms' },
            { title: 'Address', dataIndex: 'serviceAddress', key: 'serviceAddress' },
            { title: 'Completion Date', dataIndex: 'completionDate', key: 'completionDate', render: (val) => new Date(val).toLocaleDateString() }
        ],
        '6': [
            { title: 'Request ID', dataIndex: 'id', key: 'id' },
            { title: 'Client ID', dataIndex: 'clientID', key: 'clientID' },
            { title: 'Client Name', dataIndex: 'clientName', key: 'clientName' },
            { title: 'Service Type', dataIndex: 'serviceType', key: 'serviceType' },
            { title: 'Bill Amount', dataIndex: 'billAmount', key: 'billAmount', render: (val) => `$${val}` },
            { title: 'Completion Date', dataIndex: 'completionDate', key: 'completionDate', render: (val) => new Date(val).toLocaleDateString() },
            { title: 'Days Overdue', dataIndex: 'daysOverdue', key: 'daysOverdue' }
        ],
        '7': [
            { title: 'Client ID', dataIndex: 'clientID', key: 'clientID' },
            { title: 'Name', dataIndex: 'clientName', key: 'clientName' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Overdue Bills', dataIndex: 'overdueCount', key: 'overdueCount' },
            { title: 'Total Owed', dataIndex: 'totalOwed', key: 'totalOwed', render: (val) => `$${val}` }
        ],
        '8': [
            { title: 'Client ID', dataIndex: 'clientID', key: 'clientID' },
            { title: 'Name', dataIndex: 'clientName', key: 'clientName' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Completed Orders', dataIndex: 'totalCompletedOrders', key: 'totalCompletedOrders' }
        ]
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Statistics & Reports</h1>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane tab="Frequent Clients" key="1">
                    <Card title="Clients with Most Completed Orders" extra={
                        <Button icon={<ReloadOutlined />} onClick={() => handleTabChange('1')}>Refresh</Button>
                    }>
                        <Spin spinning={loading}>
                            <Table dataSource={data} columns={columns['1']} rowKey="clientID" pagination={{ pageSize: 10 }} />
                        </Spin>
                    </Card>
                </TabPane>

                <TabPane tab="Uncommitted Clients" key="2">
                    <Card title="Clients with 3+ Requests but No Completed Orders" extra={
                        <Button icon={<ReloadOutlined />} onClick={() => handleTabChange('2')}>Refresh</Button>
                    }>
                        <Spin spinning={loading}>
                            <Table dataSource={data} columns={columns['2']} rowKey="clientID" pagination={{ pageSize: 10 }} />
                        </Spin>
                    </Card>
                </TabPane>

                <TabPane tab="Monthly Quotes" key="3">
                    <Card title="Accepted Quotes This Month" extra={
                        <Space>
                            <DatePicker 
                                picker="month" 
                                defaultValue={dayjs()}
                                onChange={(date) => {
                                    if (date) {
                                        setSelectedYear(date.year());
                                        setSelectedMonth(date.month() + 1);
                                        fetchData('/statistics/monthly-quotes', { year: date.year(), month: date.month() + 1 });
                                    }
                                }}
                            />
                            <Button icon={<ReloadOutlined />} onClick={() => handleTabChange('3')}>Refresh</Button>
                        </Space>
                    }>
                        <Spin spinning={loading}>
                            <Table dataSource={data} columns={columns['3']} rowKey="id" pagination={{ pageSize: 10 }} />
                        </Spin>
                    </Card>
                </TabPane>

                <TabPane tab="Prospective Clients" key="4">
                    <Card title="Registered but Never Submitted Request" extra={
                        <Button icon={<ReloadOutlined />} onClick={() => handleTabChange('4')}>Refresh</Button>
                    }>
                        <Spin spinning={loading}>
                            <Table dataSource={data} columns={columns['4']} rowKey="clientID" pagination={{ pageSize: 10 }} />
                        </Spin>
                    </Card>
                </TabPane>

                <TabPane tab="Largest Jobs" key="5">
                    <Card title="Service Requests with Most Rooms" extra={
                        <Button icon={<ReloadOutlined />} onClick={() => handleTabChange('5')}>Refresh</Button>
                    }>
                        <Spin spinning={loading}>
                            <Table dataSource={data} columns={columns['5']} rowKey="id" pagination={{ pageSize: 10 }} />
                        </Spin>
                    </Card>
                </TabPane>

                <TabPane tab="Overdue Bills" key="6">
                    <Card title="Unpaid Bills Older Than 1 Week" extra={
                        <Button icon={<ReloadOutlined />} onClick={() => handleTabChange('6')}>Refresh</Button>
                    }>
                        <Spin spinning={loading}>
                            <Table dataSource={data} columns={columns['6']} rowKey="id" pagination={{ pageSize: 10 }} />
                        </Spin>
                    </Card>
                </TabPane>

                <TabPane tab="Bad Clients" key="7">
                    <Card title="Clients with Unpaid Overdue Bills" extra={
                        <Button icon={<ReloadOutlined />} onClick={() => handleTabChange('7')}>Refresh</Button>
                    }>
                        <Spin spinning={loading}>
                            <Table dataSource={data} columns={columns['7']} rowKey="clientID" pagination={{ pageSize: 10 }} />
                        </Spin>
                    </Card>
                </TabPane>

                <TabPane tab="Good Clients" key="8">
                    <Card title="Clients Who Always Pay Within 24 Hours" extra={
                        <Button icon={<ReloadOutlined />} onClick={() => handleTabChange('8')}>Refresh</Button>
                    }>
                        <Spin spinning={loading}>
                            <Table dataSource={data} columns={columns['8']} rowKey="clientID" pagination={{ pageSize: 10 }} />
                        </Spin>
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Statistics;
