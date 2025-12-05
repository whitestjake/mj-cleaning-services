

let requestIdCounter = 1;

const generateRequest = (overrides = {}) => {
  const quote = overrides.managerQuote !== undefined
    ? overrides.managerQuote
    : Math.floor(Math.random() * 200) + 100; // numeric

  const scheduled = overrides.scheduledTime || new Date(Date.now() + Math.floor(Math.random() * 7) * 86400000);

  return {
    id: requestIdCounter++,
    clientName: overrides.clientName || `Client ${Math.floor(Math.random() * 100)}`,
    phone: overrides.phone || `555-01${Math.floor(Math.random() * 90 + 10)}`,
    serviceType: overrides.serviceType || ["Basic", "Deep Clean", "Move Out"][Math.floor(Math.random() * 3)],
    numRooms: overrides.numRooms || Math.floor(Math.random() * 5 + 1),
    addOutdoor: overrides.addOutdoor || Math.random() > 0.5,
    serviceAddress: overrides.serviceAddress || "123 Main St, City, State",
    notes: overrides.notes || "Client notes here",
    managerQuote: quote,
    scheduledTime: scheduled.toISOString().slice(0,16),
    submittedDate: overrides.submittedDate || new Date(Date.now() - Math.floor(Math.random() * 3) * 86400000).toISOString().slice(0,16),
    managerNote: overrides.managerNote || "Manager notes here",
    completionDate: overrides.completionDate || null,
    status: overrides.status || null,
    photos: overrides.photos || [],
    isPaid: overrides.isPaid || false,
    disputed: overrides.disputed || false,
    disputeNote: overrides.disputeNote || "",
    isRenegotiation: overrides.isRenegotiation || false,
    clientAdjustment: overrides.clientAdjustment || null, // { price, time, note }
  };
};

const requestsDB = {
  new: Array.from({ length: 5 }, () => generateRequest()),
  pending_response: Array.from({ length: 3 }, () => generateRequest()),
  awaiting_completion: Array.from({ length: 3 }, () => generateRequest()),
  completed: Array.from({ length: 2 }, () => {
    const r = generateRequest();
    r.completionDate = new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString().slice(0,10);
    r.status = "Completed";
    return r;
  }),
};

const clientsDB = Array.from({ length: 5 }, (_, idx) => ({
  id: idx + 1,
  name: `Client ${Math.floor(Math.random() * 100)}`,
  email: `client${Math.floor(Math.random() * 100)}@example.com`,
  phone: `555-0${Math.floor(Math.random() * 900 + 100)}`,
  totalRequests: Math.floor(Math.random() * 10),
  completedRequests: Math.floor(Math.random() * 10),
  rejectedRequests: Math.floor(Math.random() * 5),
}));

export const RequestsAPI = {
  getByStatus: async (status) => {
    await new Promise((res) => setTimeout(res, 200));
    return requestsDB[status] || [];
  },

  getAllClients: async () => {
    await new Promise((res) => setTimeout(res, 200));
    return clientsDB;
  },

  // Example: mark a request as renegotiated
  move: async (id, fromStatus, toStatus, updates = {}) => {
    const index = requestsDB[fromStatus].findIndex((r) => r.id === id);
    if (index === -1) return;
    const [req] = requestsDB[fromStatus].splice(index, 1);
    Object.assign(req, updates);

    // If the update includes clientAdjustment, mark as renegotiation
    if (updates.clientAdjustment) {
      req.isRenegotiation = true;
    }

    if (!requestsDB[toStatus]) requestsDB[toStatus] = [];
    requestsDB[toStatus].push(req);
  },


  sendQuote: async (id, updates) => {
    for (const status of ["new", "pending_response"]) {
      const req = requestsDB[status].find(r => r.id === id);
      if (req) {
        Object.assign(req, updates);
        return req;
      }
    }
  },

  acceptQuote: async (id) => {
    await RequestsAPI.move(id, "pending_response", "awaiting_completion");
  },

  rejectQuote: async (id) => {
    await RequestsAPI.move(id, "pending_response", "completed", { status: "Rejected" });
  },

  completeRequest: async (id) => {
    for (const status of ["awaiting_completion"]) {
      const index = requestsDB[status].findIndex(r => r.id === id);
      if (index !== -1) {
        const [req] = requestsDB[status].splice(index, 1);
        req.completionDate = new Date().toISOString().slice(0,10);
        req.status = "Completed";
        if (!requestsDB.completed) requestsDB.completed = [];
        requestsDB.completed.push(req);
        return req;
      }
    }
  },

  markAsPaid: async (id) => {
    for (const status of ["completed"]) {
      const req = requestsDB[status].find(r => r.id === id);
      if (req) {
        req.isPaid = true;
        return req;
      }
    }
  },

  disputeBill: async (id, note) => {
    for (const status of ["awaiting_completion", "completed"]) {
      const req = requestsDB[status].find(r => r.id === id);
      if (req) {
        req.disputed = true;
        req.disputeNote = note;
        return req;
      }
    }
  },

  reviseBill: async (id, updates) => {
    for (const status of ["awaiting_completion", "completed"]) {
      const req = requestsDB[status].find(r => r.id === id);
      if (req) {
        Object.assign(req, updates);
        req.pendingRevision = true;
        return req;
      }
    }
  },

  // -------------------------
  // NEW: Client renegotiates a quote
  // -------------------------
  sendRenegotiation: async (id, adjustments) => {
    // Find the original pending_response request
    const req = requestsDB["pending_response"].find(r => r.id === id);
    if (!req) return null;

    // Mark as renegotiation, store client adjustments
    req.isRenegotiation = true;
    req.clientAdjustment = {
      price: adjustments.price || req.managerQuote,
      time: adjustments.time || req.scheduledTime,
      note: adjustments.note || "",
    };

    // Move back to "new" so manager can review it
    const index = requestsDB["pending_response"].findIndex(r => r.id === id);
    requestsDB["pending_response"].splice(index, 1);
    requestsDB["new"].push(req);

    return req;
  }
};




  

