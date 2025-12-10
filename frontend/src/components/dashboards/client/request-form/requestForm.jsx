// Service request form - allows clients to submit cleaning requests
import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Checkbox, Upload, Alert, Row, Col, Card, Typography, Radio } from 'antd';
import { UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { RequestsAPI } from '../../../../api';

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
    const [savedAddress, setSavedAddress] = useState('');
    const [useNewAddress, setUseNewAddress] = useState(false);

    const services = ['Basic', 'Deep Clean', 'Move Out'];
    
    // Service pricing rates
    const servicePricing = {
        'Basic': 50,
        'Deep Clean': 70,
        'Move Out': 60
    };
    
    const outdoorCost = 40; // per hour

    // Load user's saved address on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await RequestsAPI.getCurrentUser();
                
                if (user && user.address) {
                    setSavedAddress(user.address);
                    // Set saved address as default
                    form.setFieldsValue({ serviceAddress: user.address });
                } else {
                    setUseNewAddress(true);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUseNewAddress(true);
            }
        };
        fetchUserData();
    }, [form]);

    const handleAddressTypeChange = (e) => {
        const isNew = e.target.value === 'new';
        setUseNewAddress(isNew);
        if (!isNew && savedAddress) {
            form.setFieldsValue({ serviceAddress: savedAddress });
        } else {
            form.setFieldsValue({ serviceAddress: '' });
        }
    };

    // Calculate estimate based on service type and rooms
    const calculateEstimate = () => {
        const formValues = form.getFieldsValue();
        const { serviceType, numRooms, addOutdoor } = formValues;
        
        if (serviceType && numRooms) {
            const basePrice = servicePricing[serviceType] || 0;
            const parsedRooms = parseInt(numRooms);
            if (isNaN(parsedRooms) || parsedRooms < 1) {
                setEstimatedCost(0);
                return;
            }
            const roomCost = basePrice * parsedRooms;
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

            Object.keys(values).forEach(key => {
                if (key !== 'photos') {
                    let value = values[key];
                    if (key === 'serviceDate' && value) {
                        value = value.format('YYYY-MM-DD HH:mm:ss');
                    }
                    formData.append(key, value || '');
                }
            });
            
            // Add system calculated estimated cost
            formData.append('systemEstimate', estimatedCost);

            photos.forEach((file) => {
                formData.append('photos', file.originFileObj || file);
            });

            const result = await RequestsAPI.createWithFiles(formData);
            
            if (result.success) {
                setMessage('Request submitted successfully!');
                setMessageType('success');
                form.resetFields();
                setPhotos([]);
                setEstimatedCost(0);
            } else {
                setMessage(result.message || result.error || 'Failed to submit request');
                setMessageType('error');
                console.error('Submit error:', result);
            }
        } catch (error) {
            setMessage(`Network error: ${error.message}`);
            setMessageType('error');
            console.error('Submit exception:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {message && (
                <Alert 
                    title={message} 
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

                    <Col xs={24}>
                        {savedAddress && (
                            <Form.Item label="Address Option" style={{ marginBottom: '8px' }}>
                                <Radio.Group onChange={handleAddressTypeChange} value={useNewAddress ? 'new' : 'saved'} size="small">
                                    <Radio value="saved">
                                        <EnvironmentOutlined /> Use saved address
                                    </Radio>
                                    <Radio value="new">Enter new address</Radio>
                                </Radio.Group>
                            </Form.Item>
                        )}
                        
                        <Form.Item
                            name="serviceAddress"
                            label={!savedAddress || useNewAddress ? "Address" : ""}
                            rules={[{ required: true, message: 'Please enter service address' }]}
                            style={{ marginBottom: '12px' }}
                        >
                            {!useNewAddress && savedAddress ? (
                                <Card size="small" style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
                                    <Text><EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />{savedAddress}</Text>
                                </Card>
                            ) : (
                                <TextArea rows={2} placeholder="Enter service address" size="small" />
                            )}
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

                <Form.Item 
                    name="note" 
                    label="Additional Notes / Special Requirements" 
                    style={{ marginBottom: '12px' }}
                >
                    <TextArea 
                        rows={3} 
                        placeholder="Any special instructions or requirements for the cleaning service..." 
                        size="small"
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <Form.Item name="clientBudget" label="Budget (Optional)" style={{ marginBottom: '12px' }}>
                    <Input placeholder="Enter your budget if you have one" size="small" />
                </Form.Item>

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

