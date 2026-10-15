import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // on page refresh, ask the server who is logged in (cookie is sent automatically)
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(data) {
    const res = await api.post("/auth/register", data);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  // keep bookmark list in sync without calling /me again
  function setBookmark(questionId, bookmarked) {
    setUser((u) => {
      if (!u) return u;
      const rest = u.bookmarks.filter((id) => id !== questionId);
      return { ...u, bookmarks: bookmarked ? [...rest, questionId] : rest };
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setBookmark }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
