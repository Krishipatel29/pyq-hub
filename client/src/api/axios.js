import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api`,
  withCredentials: true, // send the httpOnly cookie with every request
});

// pull the message our backend sends, so pages can show it directly
export function errorMessage(err, fallback = "Something went wrong. Try again.") {
  if (!err.response) return "Can't reach the server. Is the backend running?";
  return err.response.data?.message || fallback;
}

export default api;
