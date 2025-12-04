


// manager.jsx
import { useState, useEffect } from "react";
import { RequestsAPI } from "../../../api.js";

import NewRequests from "./new-requests/newRequests.jsx";
import PendingResponses from "./pending-response/pendingResponse.jsx";
import AwaitingCompletion from "./awaiting-completion/awaitingCompletion.jsx";
import AcceptedRequests from "./accepted-requests/acceptedRequests.jsx";
import ClientList from "./client-list/clientList.jsx";

import "./manager.css";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("new");

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
        RequestsAPI.getByStatus("accepted"),
        RequestsAPI.getAllClients(),
      ]);

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

  const tabs = [
    { key: "new", label: "New Requests" },
    { key: "pending", label: "Pending Responses" },
    { key: "queued", label: "Awaiting Completion" },
    { key: "accepted", label: "Accepted Requests" },
    { key: "clients", label: "Client History" },
  ];

  return (
    <div className="manager-container">
      <h1>Manager Dashboard</h1>

      <div className="manager-tab-selection">
        <div
          className="tab-highlight"
          style={{ transform: `translateX(${tabs.findIndex(t => t.key === activeTab) * 100}%)` }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
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
      </div>
    </div>
  );
};

export default ManagerDashboard;


