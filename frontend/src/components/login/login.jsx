
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Card, Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthProvider.jsx';

const { Content } = Layout;
const { Title } = Typography;

const Login = () => {
    const { login } = useAuth();
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        setError('');

        const response = await login(values.email, values.password);
        if (!response.success) {
            setError(response.message);
        }

        setLoading(false);
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Content style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '20px'
            }}>
                <Card style={{ width: '400px', border: '1px solid #dee2e6', backgroundColor: '#fff' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={2} style={{ margin: 0, color: '#495057' }}>
                            <LoginOutlined /> Login
                        </Title>
                    </div>

                    {error && (
                        <Alert 
                            message={error} 
                            type="error" 
                            showIcon 
                            style={{ marginBottom: '16px' }} 
                        />
                    )}

                    <Form
                        form={form}
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

                        <Form.Item style={{ marginBottom: '12px' }}>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                block
                                icon={<LoginOutlined />}
                            >
                                Login
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Link to="/register" style={{ marginRight: '16px' }}>
                                Don't have an account? Register
                            </Link>
                            <br />
                            <Link to="/" style={{ color: '#666' }}>
                                <HomeOutlined /> Back to Home
                            </Link>
                        </div>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default Login;