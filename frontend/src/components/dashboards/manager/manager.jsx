


import { useState, useEffect } from "react";
import { Layout, Menu, Typography, Button, Space, Badge } from 'antd';
import { 
    DashboardOutlined, 
    FileTextOutlined, 
    ClockCircleOutlined, 
    CheckCircleOutlined,
    UserOutlined,
    LogoutOutlined,
    HomeOutlined
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
  const [clients, setClients] = useState([]);

  const fetchData = async () => {
    try {
      const [newData, pendingData, queuedData, completedData, clientsData] = await Promise.all([
        RequestsAPI.getByStatus("new"),
        RequestsAPI.getByStatus("pending_response"),
        RequestsAPI.getByStatus("awaiting_completion"),
        RequestsAPI.getByStatus("completed"),
        RequestsAPI.getAllClients(),
      ]);

      console.log('Manager Dashboard Data:', {
        newData,
        pendingData,
        queuedData,
        completedData,
        clientsData
      });

      setNewRequests(newData);
      setPendingRequests(pendingData);
      setQueuedRequests(queuedData);
      setCompletedRequests(completedData);
      setClients(clientsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
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
      label: (
        <Badge count={newRequests.length} size="small">
          <span style={{ marginRight: 8 }}>New Requests</span>
        </Badge>
      ),
    },
    {
      key: 'pending',
      icon: <ClockCircleOutlined />,
      label: (
        <Badge count={pendingRequests.length} size="small">
          <span style={{ marginRight: 8 }}>Pending Response</span>
        </Badge>
      ),
    },
    {
      key: 'queued',
      icon: <DashboardOutlined />,
      label: (
        <Badge count={queuedRequests.length} size="small">
          <span style={{ marginRight: 8 }}>In Progress</span>
        </Badge>
      ),
    },
    {
      key: 'accepted',
      icon: <CheckCircleOutlined />,
      label: (
        <Badge count={completedRequests.length} size="small">
          <span style={{ marginRight: 8 }}>Completed</span>
        </Badge>
      ),
    },
    {
      key: 'clients',
      icon: <UserOutlined />,
      label: (
        <Badge count={clients.length} size="small">
          <span style={{ marginRight: 8 }}>Clients</span>
        </Badge>
      ),
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


