import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Table, Button, Space, Card } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const Home = () => {
    const navigate = useNavigate();
 
    const loginRedirect = () => {
        navigate('/login')
    }

    const registerRedirect = () => {
        navigate('/register')
    }

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

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Header style={{ background: '#495057', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                    <HomeOutlined style={{ marginRight: '8px' }} />
                    MJ Cleaning Services
                </div>
            </Header>
            
            <Content style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <div style={{ maxWidth: '900px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Title level={1} style={{ color: '#495057', marginBottom: '8px', fontSize: '1.8rem' }}>
                            Welcome to MJ Cleaning Services!
                        </Title>
                    </div>

                    <Card title="Our Services" style={{ marginBottom: '16px', border: '1px solid #dee2e6', backgroundColor: '#fff' }} size="small">
                        <Table 
                            dataSource={servicesData} 
                            columns={columns} 
                            pagination={false}
                            size="small"
                            showHeader={false}
                            bordered
                        />
                    </Card>
                    
                    <div style={{ textAlign: 'center', padding: '16px', background: '#fff', border: '1px solid #dee2e6' }}>
                        <Space size="large">
                            <Button 
                                style={{ 
                                    background: '#495057', 
                                    borderColor: '#495057', 
                                    color: '#fff'
                                }} 
                                size="large" 
                                onClick={registerRedirect}
                            >
                                Register
                            </Button>
                            <Button 
                                style={{ 
                                    background: '#fff', 
                                    borderColor: '#6c757d', 
                                    color: '#495057'
                                }} 
                                size="large" 
                                onClick={loginRedirect}
                            >
                                Login
                            </Button>
                        </Space>
                    </div>
                </div>
            </Content>
            
            <Footer style={{ textAlign: 'center', background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                MJ Cleaning Services (c) 2025 Created with care
            </Footer>
        </Layout>
    );
}

export default Home;