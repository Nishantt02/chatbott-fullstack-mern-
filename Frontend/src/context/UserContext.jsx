import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const Usercontext = createContext();
const server = import.meta.env.VITE_SERVER;

export const UserProvider = ({ children }) => {
  const [btnLoading, setBtnLoading] = useState(false);
  const [user, setUser] = useState([]); // always an array
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login user
  async function loginUser(email, navigate) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/User/login`, { email });

      toast.success(data.message);
      localStorage.setItem("verifyToken", data.verifyToken);
      navigate("/verify");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setBtnLoading(false);
    }
  }

  // Verify user OTP
  async function verifyUser(otp, navigate, fetchChats) {
    const verifyToken = localStorage.getItem("verifyToken");
    if (!verifyToken) return toast.error("Verification token not found");

    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/User/verify`, {
        otp,
        verifyToken,
      });

      toast.success(data.message);
      localStorage.clear();
      localStorage.setItem("token", data.token);
      setIsAuth(true);
      setUser(data.user ? [data.user] : []); // ensure array
      navigate("/");
      if (fetchChats) fetchChats();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Verification failed");
    } finally {
      setBtnLoading(false);
    }
  }

  // Fetch logged-in user
  async function fetchUser() {
  const token = localStorage.getItem("token");
  if (!token) {
    setIsAuth(false);
    setUser([]);
    setLoading(false);
    return;
  }

  try {
    const { data } = await axios.get(`${server}/User/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Ensure user is always an array
    if (!data.user) setUser([]);
    else if (Array.isArray(data.user)) setUser(data.user);
    else setUser([data.user]);

    setIsAuth(true);
  } catch (error) {
    console.error("Error fetching user:", error);
    setIsAuth(false);
    setUser([]);
  } finally {
    setLoading(false);
  }
}

  // Logout
  const logoutHandler = (navigate) => {
    localStorage.clear();
    toast.success("Logged out successfully");
    setIsAuth(false);
    setUser([]);
    navigate("/login");
  };

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Usercontext.Provider
      value={{
        loginUser,
        btnLoading,
        isAuth,
        setIsAuth,
        user,
        verifyUser,
        loading,
        logoutHandler,
      }}
    >
      {children}
      <Toaster />
    </Usercontext.Provider>
  );
};

export const UserData = () => useContext(Usercontext);
