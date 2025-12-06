import { useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Checkbox, Upload, Alert, Row, Col, Card, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const RequestForm = () => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [photos, setPhotos] = useState([]);
    const [estimatedCost, setEstimatedCost] = useState(0);

    const services = ['Basic', 'Deep Clean', 'Move Out'];
    
    // Pricing structure
    const servicePricing = {
        'Basic': 50,
        'Deep Clean': 70,
        'Move Out': 60
    };
    
    const outdoorCost = 40; // per hour

    // Calculate estimated cost when form values change
    const calculateEstimate = () => {
        const formValues = form.getFieldsValue();
        const { serviceType, numRooms, addOutdoor } = formValues;
        
        if (serviceType && numRooms) {
            const basePrice = servicePricing[serviceType] || 0;
            const roomCost = basePrice * parseInt(numRooms);
            const extraCost = addOutdoor ? outdoorCost : 0;
            const total = roomCost + extraCost;
            setEstimatedCost(total);
        } else {
            setEstimatedCost(0);
        }
    };

    const handleFormChange = () => {
        calculateEstimate();
    };

    const handlePhotoChange = ({ fileList }) => {
        if (fileList.length > 5) {
            setMessage('You can only upload up to 5 photos.');
            setMessageType('warning');
            return;
        }
        setPhotos(fileList);
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        setMessage('');
        
        try {
            const formData = new FormData();

            // Add form fields
            Object.keys(values).forEach(key => {
                if (key !== 'photos') {
                    formData.append(key, values[key] || '');
                }
            });

            // Add photos
            photos.forEach((file) => {
                formData.append('photos', file.originFileObj || file);
            });

            const response = await fetch('/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Request submitted successfully!');
                setMessageType('success');
                form.resetFields();
                setPhotos([]);
                setEstimatedCost(0);
            } else {
                setMessage(data.error || 'Failed to submit request');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            setMessageType('error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {message && (
                <Alert 
                    message={message} 
                    type={messageType} 
                    closable
                    style={{ marginBottom: '16px' }}
                    onClose={() => setMessage('')}
                />
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleFormChange}
                size="small"
            >
                <Row gutter={8}>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="serviceType"
                            label="Service"
                            rules={[{ required: true }]}
                            initialValue="Basic"
                            style={{ marginBottom: '12px' }}
                        >
                            <Select size="small">
                                {services.map(service => (
                                    <Option key={service} value={service}>{service}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="numRooms"
                            label="Rooms"
                            rules={[{ required: true }]}
                            style={{ marginBottom: '12px' }}
                        >
                            <Input type="number" min={1} placeholder="1" size="small" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="serviceDate"
                            label="Date"
                            rules={[{ required: true }]}
                            style={{ marginBottom: '12px' }}
                        >
                            <DatePicker style={{ width: '100%' }} size="small" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="serviceAddress"
                            label="Address"
                            rules={[{ required: true }]}
                            style={{ marginBottom: '12px' }}
                        >
                            <TextArea rows={1} placeholder="Service address" size="small" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item name="clientBudget" label="Budget" style={{ marginBottom: '12px' }}>
                            <Input placeholder="Optional" size="small" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item name="addOutdoor" valuePropName="checked" style={{ marginBottom: '12px' }}>
                            <Checkbox>Outdoor Cleaning (+$40/hr)</Checkbox>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item label="Photos" style={{ marginBottom: '12px' }}>
                            <Upload
                                fileList={photos}
                                onChange={handlePhotoChange}
                                beforeUpload={() => false}
                                multiple
                                maxCount={5}
                            >
                                <Button icon={<UploadOutlined />} size="small">Upload</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>


                {estimatedCost > 0 && (
                    <Card size="small" style={{ margin: '12px 0', backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                Estimated Cost: ${estimatedCost}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                * Final quote may vary based on specific requirements
                            </Text>
                        </div>
                    </Card>
                )}


                <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                    block
                    size="small"
                    style={{ marginTop: '8px' }}
                >
                    Submit Request
                </Button>
            </Form>


        </div>
    );
};

export default RequestForm;

