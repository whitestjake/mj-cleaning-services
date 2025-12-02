



const PriorSubmits = () => {

    const submittedRequests = [
        {
            id: 1,
            date: "2025-01-12",
            services: "Deep Cleaning (4 rooms)",
            quote: "$280"
        },
        {
            id: 2,
            date: "2025-01-20",
            services: "Basic Cleaning (3 rooms)",
            quote: "$150"
        },
        {
            id: 3,
            date: "2025-02-01",
            services: "Yard Service (2 hrs)",
            quote: "$80"
        }
    ];


    return (
        <div>
            <h3>Your Submitted Requests</h3>
            <table>
                <thead>
                    <tr>
                        <th>Request Date</th>
                        <th>Requested Services</th>
                        <th>Service Quote</th>
                    </tr>
                </thead>
                <tbody>
                    {submittedRequests.map(request => (
                        <tr key={request.id}>
                            <td>{request.date}</td>
                            <td>{request.services}</td>
                            <td>{request.quote}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}

export default PriorSubmits