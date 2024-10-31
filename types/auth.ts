export type User = {
  id: string;
  username: string;
  email: string;
  password: string; // In real apps, never store plain text passwords
  createdAt: string;
};
