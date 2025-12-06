

// fake backend

const users = [
  { email: "client@client.com", password: "password", role: "client" },
  { email: "anna.johnson@ajcleaning.com", password: "password", role: "manager" },
];

// Simulate login request
export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        resolve({ success: true, role: user.role, token: "mock-token-123" });
      } else {
        resolve({ success: false, message: "Invalid email or password" });
      }
    }, 500); // simulate network delay
  });
};
