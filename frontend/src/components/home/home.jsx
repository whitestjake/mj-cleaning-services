import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Table, Button, Space, Card, Row, Col } from 'antd';
import { LoginOutlined, UserAddOutlined, HomeOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

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
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#001529', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                    <HomeOutlined style={{ marginRight: '8px' }} />
                    AJ Cleaning Services
                </div>
            </Header>
            
            <Content style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <div style={{ maxWidth: '900px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Title level={1} style={{ color: '#1890ff', marginBottom: '8px', fontSize: '1.8rem' }}>
                            Welcome to AJ Cleaning Services!
                        </Title>
                    </div>

                    <Card title="Our Services" style={{ marginBottom: '16px' }} size="small">
                        <Table 
                            dataSource={servicesData} 
                            columns={columns} 
                            pagination={false}
                            size="small"
                            showHeader={false}
                        />
                    </Card>
                    
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <Space size="large">
                            <Button type="primary" size="large" onClick={registerRedirect}>
                                Register
                            </Button>
                            <Button size="large" onClick={loginRedirect}>
                                Login
                            </Button>
                        </Space>
                    </div>
                </div>
            </Content>
            
            <Footer style={{ textAlign: 'center' }}>
                AJ Cleaning Services ©2025 Created with care
            </Footer>
        </Layout>
    );
}

export default Home;