import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout, Card, Form, Input, Button, Alert, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, UserAddOutlined, CreditCardOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

const Register = ({ setIsLoggedIn, setUserRole }) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            const data = await response.json();

            if (response.ok) {
                // After successful registration, try to log in
                const loginResponse = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: values.email, 
                        password: values.password 
                    })
                });

                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();
                    setIsLoggedIn(true);
                    setUserRole(loginData.role);
                    
                    if (loginData.role === 'client') {
                        navigate('/client-dashboard');
                    } else if (loginData.role === 'manager') {
                        navigate('/manager-dashboard');
                    }
                } else {
                    // Registration succeeded but auto-login failed, redirect to login
                    navigate('/login');
                }
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ height: '100vh', background: '#f0f2f5' }}>
            <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', overflow: 'auto' }}>
                <Card 
                    style={{ 
                        width: '100%', 
                        maxWidth: '450px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        maxHeight: '95vh',
                        overflow: 'auto'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <Title level={3}>
                            <UserAddOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            Register
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
                        name="register"
                        onFinish={handleSubmit}
                        layout="vertical"
                        size="middle"
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="first_name"
                                    label="First Name"
                                    rules={[{ required: true, message: 'Please input your first name!' }]}
                                >
                                    <Input 
                                        prefix={<UserOutlined />} 
                                        placeholder="First Name"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="last_name"
                                    label="Last Name"
                                    rules={[{ required: true, message: 'Please input your last name!' }]}
                                >
                                    <Input 
                                        prefix={<UserOutlined />} 
                                        placeholder="Last Name"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input 
                                prefix={<MailOutlined />} 
                                placeholder="Email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined />} 
                                placeholder="Password"
                            />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Address"
                        >
                            <Input 
                                prefix={<HomeOutlined />} 
                                placeholder="Address (Optional)"
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="phone_number"
                                    label="Phone Number"
                                >
                                    <Input 
                                        prefix={<PhoneOutlined />} 
                                        placeholder="Phone (Optional)"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="card_number"
                                    label="Card Number"
                                >
                                    <Input 
                                        prefix={<CreditCardOutlined />} 
                                        placeholder="Card (Optional)"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                block
                                size="large"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <span>Already have an account? </span>
                        <Link to="/login">Login here</Link>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default Register;