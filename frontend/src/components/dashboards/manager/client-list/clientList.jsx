

import { useState, useEffect } from "react";
import { RequestsAPI } from "../../../../api.js";

import FilterTable from "../filter-bar/filterBar.jsx";
import SubWindowModal from "../sub-window-modal/subWindowModal.jsx";

import "../managerWindow.css";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      const allClients = await RequestsAPI.getAllClients();
      setClients(allClients);
    };
    fetchClients();
  }, []);

  const columns = [
    { key: "clientID", label: "Client ID", filterType: "text" },
    { key: "clientName", label: "Client Name", filterType: "text" },
    { key: "phone", label: "Phone", filterType: "text" },
    { key: "completedRequests", label: "Completed", filterType: "number" },
    { key: "rejectedRequests", label: "Rejected", filterType: "number" },
  ];

  // Fields for the modal display
  const modalFields = [
    { key: "clientID", label: "Client ID" },
    { key: "clientName", label: "Client Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "totalRequests", label: "Total Requests" },
    { key: "completedRequests", label: "Completed Requests" },
    { key: "rejectedRequests", label: "Rejected Requests" },
  ];

  return (
    <div className="manager-window-container">
      <h2>Client History</h2>

      <div className="filter-table-container" >
        <FilterTable
          columns={columns}
          data={clients}
          onRowClick={(client) => setSelectedClient(client)} // open modal
        />
      </div>

      {selectedClient && (
        <SubWindowModal
          title={selectedClient.clientName || selectedClient.name || 'Client Details'}
          data={selectedClient}
          fields={modalFields}
          type="client"
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default ClientList;


