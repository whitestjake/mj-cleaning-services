
import { useState, useEffect } from "react";
import "../managerWindow.css";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const requests = await response.json();
        
        // Group requests by client and calculate statistics
        const clientMap = new Map();
        
        requests.forEach(req => {
          const clientId = req.client_id;
          if (!clientMap.has(clientId)) {
            clientMap.set(clientId, {
              client_id: clientId,
              name: `${req.first_name} ${req.last_name}`,
              email: req.email,
              phone: req.phone_number,
              requests: []
            });
          }
          clientMap.get(clientId).requests.push(req);
        });

        // Convert to array and calculate stats
        const clientStats = Array.from(clientMap.values()).map(client => ({
          ...client,
          totalRequests: client.requests.length,
          pendingRequests: client.requests.filter(r => r.state === 'pending').length,
          quotedRequests: client.requests.filter(r => r.state === 'quoted').length,
          completedRequests: client.requests.filter(r => r.state === 'accepted').length,
          rejectedRequests: client.requests.filter(r => r.state === 'rejected').length
        }));

        setClients(clientStats);
      } else {
        setError('Failed to load client data');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="manager-window-container"><h2>Loading clients...</h2></div>;
  if (error) return <div className="manager-window-container"><h2>Error: {error}</h2></div>;

  return (
    <div className="manager-window-container">
      <h2>Client List</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Total Requests</th>
            <th>Pending</th>
            <th>Quoted</th>
            <th>Completed</th>
            <th>Rejected</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.client_id}>
              <td>{client.name}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.totalRequests}</td>
              <td>{client.pendingRequests}</td>
              <td>{client.quotedRequests}</td>
              <td>{client.completedRequests}</td>
              <td>{client.rejectedRequests}</td>
            </tr>
          ))}
          
          {clients.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                No clients found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClientList;