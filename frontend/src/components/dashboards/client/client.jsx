import { useState } from 'react';
import { Layout, Menu, Card, Table, Typography, Button, Space } from 'antd';
import { 
    DashboardOutlined, 
    FormOutlined, 
    HistoryOutlined, 
    LogoutOutlined,
    HomeOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import RequestForm from './request-form/requestForm.jsx';
import PriorSubmits from './prior-submissions/priorSubmits.jsx';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("request");
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        // Add logout logic here
        navigate('/');
    };

    const servicesData = [
        {
            key: '1',
            service: 'Basic cleaning',
            description: 'vacuum, surface cleaning/disinfecting and laundry',
            cost: '$50/room'
        },
        {
            key: '2',
            service: 'Deep cleaning',
            description: 'Basic + carpet cleaning',
            cost: '$70/room'
        },
        {
            key: '3',
            service: 'Move out cleaning',
            description: 'discounted deep cleaning',
            cost: '$60/room'
        },
        {
            key: '4',
            service: 'Outdoor cleaning',
            description: 'gutters, siding, windows',
            cost: '$40/hr'
        }
    ];

    const columns = [
        {
            title: 'Services',
            dataIndex: 'service',
            key: 'service',
        },
        {
            title: 'Details',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
        }
    ];

    const menuItems = [
        {
            key: 'request',
            icon: <FormOutlined />,
            label: 'New Request',
        },
        {
            key: 'submitted',
            icon: <HistoryOutlined />,
            label: 'Submitted Requests',
        }
    ];

    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{ 
                background: '#001529', 
                padding: '0 16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                height: '48px'
            }}>
                <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                    <DashboardOutlined style={{ marginRight: '8px' }} />
                    Client Dashboard
                </div>
                <Space>
                    <Button 
                        type="text" 
                        icon={<HomeOutlined />} 
                        onClick={() => navigate('/')}
                        style={{ color: 'white' }}
                    >
                        Home
                    </Button>
                    <Button 
                        type="text" 
                        icon={<LogoutOutlined />} 
                        onClick={handleLogout}
                        style={{ color: 'white' }}
                    >
                        Logout
                    </Button>
                </Space>
            </Header>
            
            <Layout>
                <Sider 
                    collapsible 
                    collapsed={collapsed} 
                    onCollapse={setCollapsed}
                    style={{ background: '#fff' }}
                    width={200}
                    collapsedWidth={50}
                >
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                        <Title level={5} style={{ margin: 0 }}>
                            {collapsed ? 'C' : 'Client Panel'}
                        </Title>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeTab]}
                        items={menuItems}
                        onClick={(e) => setActiveTab(e.key)}
                    />
                </Sider>
                
                <Content style={{ padding: '8px', background: '#f0f2f5', overflow: 'auto', flex: 1 }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', height: '100%' }}>

                        <Card title="Available Services" style={{ marginBottom: '8px' }} size="small">
                            <Table 
                                dataSource={servicesData} 
                                columns={columns} 
                                pagination={false}
                                size="small"
                            />
                        </Card>


                        <Card size="small" style={{ flex: 1 }}>
                            {activeTab === 'request' && (
                                <div>
                                    <Title level={4} style={{ marginBottom: '12px' }}>
                                        Service Request
                                    </Title>
                                    <RequestForm />
                                </div>
                            )}
                            
                            {activeTab === 'submitted' && (
                                <div>
                                    <Title level={4} style={{ marginBottom: '12px' }}>
                                        Submitted Requests
                                    </Title>
                                    <PriorSubmits />
                                </div>
                            )}
                        </Card>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default ClientDashboard;