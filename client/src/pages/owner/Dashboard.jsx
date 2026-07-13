import React, { useEffect, useState } from "react";
import { assets, dummyDashboardData } from "../../assets/assets";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../Context/AppContext";
import { useSocket } from "../../Context/SocketContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { axios, isOwner, currency } = useAppContext();
  const { socket } = useSocket();

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  });

  const dashboardCards = [
    { title: "Total Cars", value: data.totalCars, icon: assets.carIconColored },
    {
      title: "Total Bookings",
      value: data.totalBookings,
      icon: assets.listIconColored,
    },
    {
      title: "Pending",
      value: data.pendingBookings,
      icon: assets.cautionIconColored,
    },
    {
      title: "Confirmed",
      value: data.completedBookings,
      icon: assets.listIconColored,
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/owner/dashboard");
      if (data.success) {
        setData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post("/api/bookings/change-status", {
        bookingId,
        status,
      });
      if (data.success) {
        toast.success(data.message);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData();
    }
  }, [isOwner]);

  useEffect(() => {
    if (socket) {
      const handleNewBooking = (data) => {
        toast.success(data.message);
        fetchDashboardData();
      };
      
      socket.on("booking:new", handleNewBooking);
      return () => {
        socket.off("booking:new", handleNewBooking);
      };
    }
  }, [socket]);

  return (
    <div className="px-4 pt-10 md:px-10 flex-1">
      <Title
        title={"Admin Dashboard"}
        subTitle={
          "Monitor overall plateform performance including total cars, bookings, revenue, and recent activities."
        }
      />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-8 max-w-3xl">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor"
          >
            <div>
              <h1 className="text-xs text-slate-400">{card.title}</h1>
              <p className="text-lg font-semibold">{card.value}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {card.icon ? <img src={card.icon} alt="" className="h-4 w-4" /> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6 mb-8 w-full">
        {/* recent bookings */}
        <div className="p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full">
          <h1 className="text-lg font-medium">Recent Bookings</h1>
          <p className="text-slate-400">Latest customer bookings</p>
          {data.recentBookings.map((booking, index) => (
            <div key={index} className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {assets.listIconColored ? (
                    <img
                      src={assets.listIconColored}
                      alt=""
                      className="h-5 w-5"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="">
                    {booking.car.brand} {booking.car.model}
                  </p>
                  <p className="text-sm text-slate-400">
                    {booking.createdAt.split("T")[0]}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 font-medium border w-45 justify-center py-4 px-2 rounded-lg border-borderColor ${
                  booking.status === "confirmed"
                    ? "hover:border-green-600 hover:bg-green-200/10"
                    : "hover:border-red-600 hover:bg-red-200/10"
                }`}
              >
                <p
                  className={`text-sm  font-semibold ${
                    booking.status === "pending"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {import.meta.env.VITE_CURRENCY}
                  {booking.price}
                </p>
                {booking.status === "pending" || booking.status === "confirmed" ? (
                  <select
                    onChange={(e) => changeBookingStatus(booking._id, e.target.value)}
                    value={booking.status}
                    className="px-2 py-0.5 border border-borderColor rounded-full text-sm outline-none bg-transparent cursor-pointer text-slate-400"
                  >
                    <option value="pending">pending</option>
                    <option value="cancelled">reject</option>
                    <option value="confirmed">confirm</option>
                    <option value="returned">returned</option>
                  </select>
                ) : (
                  <p
                    className={`px-3 py-0.5 border border-borderColor rounded-full text-sm ${
                      booking.status === "returned"
                        ? "bg-blue-400/10 text-blue-600"
                        : "bg-red-400/10 text-red-600"
                    }`}
                  >
                    {booking.status}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* monthly revenue */}
        <div className="p-4 md:p-6 border border-borderColor rounded-md w-full md:max-w-xs">
          <h1 className="text-lg font-medium">Monthly Revenue</h1>
          <p className="text-slate-400">Revenue for current month</p>
          <p className="text-3xl mt-6 font-semibold text-primary">
            {import.meta.env.VITE_CURRENCY}
            {data.monthlyRevenue}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
