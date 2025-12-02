

import "../managerWindow.css";

const ClientList = () => {
  const clients = [
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      submittedRequests: 4,
      completedRequests: 3,
      totalRequests: 7,
    },
    {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "999-6969",
        submittedRequests: 2,
        completedRequests: 1,
        totalRequests: 3
    }
    // ...from backend eventually
  ];

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
            <th>Submitted Requests</th>
            <th>Completed Requests</th>
            <th>Total Requests</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.totalRequests}</td>
              <td>{c.submittedRequests}</td>
              <td>{c.completedRequests}</td>
              <td>{c.totalRequests}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientList;