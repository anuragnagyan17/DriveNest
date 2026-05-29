import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [cars, setCars] = useState([]);
  const [recentCars, setRecentCars] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0, page: 1, limit: 9, totalPages: 1
  });

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchCars = async (page = 1, location = '') => {
    try {
      const query = `/api/user/cars?page=${page}&limit=9${location ? `&location=${location}` : ''}`;
      const { data } = await axios.get(query);
      if (data.success) {
        setCars(data.cars);
        setPagination(data.pagination);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchRecentCars = async () => {
    try {
      const { data } = await axios.get('/api/user/recent-cars');
      if (data.success) setRecentCars(data.cars);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    fetchCars();
    fetchRecentCars();
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `${token}`;
      fetchUser();
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    axios.defaults.headers.common["Authorization"] = "";
    toast.success("You have been logged out ");
  };

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      if (!token) return;
      const { data } = await axios.get('/api/notifications');
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Optional: Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [token]);

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchCars,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    pagination,
    setPagination,
    recentCars,
    fetchRecentCars,
    notifications,
    fetchNotifications,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
