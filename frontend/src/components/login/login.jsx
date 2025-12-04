import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout, Card, Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, HomeOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

const Login = ({ setIsLoggedIn, setUserRole }) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            const data = await response.json();

            if (response.ok) {
                setIsLoggedIn(true);
                setUserRole(data.role);
                
                if (data.role === 'client') {
                    navigate('/client-dashboard');
                } else if (data.role === 'manager') {
                    navigate('/manager-dashboard');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ height: '100vh', background: '#f0f2f5' }}>
            <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <Card 
                    style={{ 
                        width: '100%', 
                        maxWidth: '350px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Title level={3}>
                            <LoginOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            Login
                        </Title>
                        <Link to="/" style={{ color: '#666', fontSize: '12px' }}>
                            <HomeOutlined /> Back to Home
                        </Link>
                    </div>

                    {error && (
                        <Alert 
                            message={error} 
                            type="error" 
                            showIcon 
                            style={{ marginBottom: '20px' }}
                            closable
                            onClose={() => setError('')}
                        />
                    )}

                    <Form
                        form={form}
                        name="login"
                        onFinish={handleSubmit}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input 
                                prefix={<UserOutlined />} 
                                placeholder="Email"
                                autoComplete="email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined />} 
                                placeholder="Password"
                                autoComplete="current-password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                block
                                size="large"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <span>Don't have an account? </span>
                        <Link to="/register">Register here</Link>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default Login;