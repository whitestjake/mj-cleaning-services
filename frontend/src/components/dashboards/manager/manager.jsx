

import { useState } from "react";

import NewRequests from "./new-requests/newRequests.jsx";
import PendingResponses from "./pending-response/pendingResponse.jsx";
import CompletedRequests from "./completed-requests/completedRequests.jsx";
import ClientList from "./client-list/clientList.jsx";

import "./manager.css";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);

  const moveToPending = (data) => {
    setPendingRequests([...pendingRequests, data]);
  };

  return (
    <div className="manager-container">
      <h1>Manager Dashboard</h1>

      <div className="manager-tab-selection">
        <div
          className="tab-highlight"
          style={{ transform: `translateX(${["new", "pending", "completed", "clients"].indexOf(activeTab) * 100}%)` }}
        />
        <button className={activeTab === "new" ? "active" : ""} onClick={() => setActiveTab("new")}>New Requests</button>
        <button className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}>Pending Responses</button>
        <button className={activeTab === "completed" ? "active" : ""} onClick={() => setActiveTab("completed")}>Completed Requests</button>
        <button className={activeTab === "clients" ? "active" : ""} onClick={() => setActiveTab("clients")}>Client History</button>
      </div>

      <div>
        {activeTab === "new" && <NewRequests onMoveToPending={moveToPending} />}
        {activeTab === "pending" && <PendingResponses pendingRequests={pendingRequests} />}
        {activeTab === "completed" && <CompletedRequests completedRequests={completedRequests} />}
        {activeTab === "clients" && <ClientList />}
      </div>
    </div>
  );
};

export default ManagerDashboard;


