


import { useState, useEffect } from "react";
import { Layout, Menu, Typography, Button, Space, message } from 'antd';
import { 
    DashboardOutlined, 
    FileTextOutlined, 
    ClockCircleOutlined, 
    CheckCircleOutlined,
    UserOutlined,
    LogoutOutlined,
    HomeOutlined,
    StopOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../context/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { RequestsAPI } from "../../../api.js";

import NewRequests from "./new-requests/newRequests.jsx";
import PendingResponses from "./pending-response/pendingResponse.jsx";
import AwaitingCompletion from "./awaiting-completion/awaitingCompletion.jsx";
import AcceptedRequests from "./accepted-requests/acceptedRequests.jsx";
import ClientList from "./client-list/clientList.jsx";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [newRequests, setNewRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [queuedRequests, setQueuedRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [clients, setClients] = useState([]);

  const fetchData = async () => {
    try {
      const [newData, pendingData, queuedData, completedData, rejectedData, clientsData] = await Promise.all([
        RequestsAPI.getByStatus("new"),
        RequestsAPI.getByStatus("pending_response"),
        RequestsAPI.getByStatus("awaiting_completion"),
        RequestsAPI.getByStatus("completed"),
        RequestsAPI.getByStatus("rejected"),
        RequestsAPI.getAllClients(),
      ]);

      setNewRequests(newData);
      setPendingRequests(pendingData);
      setQueuedRequests(queuedData);
      setCompletedRequests(completedData);
      setRejectedRequests(rejectedData);
      setClients(clientsData);
    } catch (err) {
      message.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const moveToPending = (req) => {
    setPendingRequests((prev) => [...prev, req]);
    setNewRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const moveToCompleted = (req) => {
    setCompletedRequests((prev) => [...prev, req]);
    setQueuedRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      key: 'new',
      icon: <FileTextOutlined />,
      label: 'New Requests',
    },
    {
      key: 'pending',
      icon: <ClockCircleOutlined />,
      label: 'Pending Response',
    },
    {
      key: 'queued',
      icon: <DashboardOutlined />,
      label: 'In Progress',
    },
    {
      key: 'accepted',
      icon: <CheckCircleOutlined />,
      label: 'Completed',
    },
    {
      key: 'rejected',
      icon: <StopOutlined />,
      label: 'Cancelled/Rejected',
    },
    {
      key: 'clients',
      icon: <UserOutlined />,
      label: 'Clients',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        width={280}
      >
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #dee2e6',
          textAlign: 'center'
        }}>
          <Title level={4} style={{ margin: 0, color: '#495057' }}>
            {collapsed ? 'MJ' : 'MJ Cleaning Services'}
          </Title>
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: 4 }}>
            {collapsed ? 'MGR' : 'Manager Dashboard'}
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          style={{ height: 'calc(100% - 120px)', borderRight: 0 }}
          onClick={({ key }) => setActiveTab(key)}
          items={menuItems}
        />

        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          width: '100%', 
          borderTop: '1px solid #dee2e6' 
        }}>
          <Menu
            mode="inline"
            style={{ borderRight: 0 }}
            items={[
              {
                key: 'home',
                icon: <HomeOutlined />,
                label: 'Home',
                onClick: () => navigate('/')
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: handleLogout
              }
            ]}
          />
        </div>
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Title level={3} style={{ margin: 0 }}>
            {menuItems.find(item => item.key === activeTab)?.label || 'Dashboard'}
          </Title>
          
          <Space>
            <Button 
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            <Button 
              style={{ 
                background: '#495057', 
                borderColor: '#495057', 
                color: '#fff'
              }}
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          border: '1px solid #dee2e6'
        }}>
          {activeTab === "new" && (
            <NewRequests
              data={newRequests}
              refresh={fetchData}
              onMoveToPending={moveToPending}
            />
          )}
          {activeTab === "pending" && (
            <PendingResponses
              data={pendingRequests}
              refresh={fetchData}
            />
          )}
          {activeTab === "queued" && (
            <AwaitingCompletion
              data={queuedRequests}
              onCompleteRequest={moveToCompleted}
              refresh={fetchData}
            />
          )}
          {activeTab === "accepted" && (
            <AcceptedRequests
              data={completedRequests}
              refresh={fetchData}
            />
          )}
          {activeTab === "rejected" && (
            <AcceptedRequests
              data={rejectedRequests}
              refresh={fetchData}
              title="Cancelled/Rejected Requests"
              isRejected={true}
            />
          )}
          {activeTab === "clients" && (
            <ClientList
              data={clients}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerDashboard;


