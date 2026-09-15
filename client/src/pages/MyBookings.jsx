import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { useAppContext } from "../Context/AppContext";
import { useSocket } from "../Context/SocketContext";
import toast from "react-hot-toast";
import ChatWindow from "../components/ChatWindow";

const MyBookings = () => {
  const { axios } = useAppContext();
  const { socket } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [chatBookingId, setChatBookingId] = useState(null);
  const [chatOwnerName, setChatOwnerName] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user');
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      console.error(error);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.post("/api/bookings/change-status", {
        bookingId,
        status: "cancelled",
      });
      if (data.success) {
        toast.success("Booking cancelled");
        fetchMyBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleStatusChanged = (data) => {
        toast.success(data.message);
        fetchMyBookings();
      };

      socket.on("booking:statusChanged", handleStatusChanged);
      return () => {
        socket.off("booking:statusChanged", handleStatusChanged);
      };
    }
  }, [socket]);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl">
      <Title
        title={"My Bookings"}
        subTitle={"View and manage your all car bookings"}
        align="left"
      />

      <div>
        {bookings.map((booking, index) => (
          <div
            key={booking.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12"
          >
            {/* Car Image + Info */}
            <div className="md:col-span-1">
              <div className="rounded-md overflow-hidden mb-3">
                <img
                  src={booking.car.image}
                  alt=""
                  className="w-full h-auto aspect-video object-cover"
                />
              </div>
              <p className="text-lg font-medium mt-2">
                {booking.car.brand} {booking.car.model}
              </p>
              <p className="text-slate-400">
                {booking.car.year} • {booking.car.category} •{" "}
                {booking.car.location}
              </p>
            </div>
            {/* Booking Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <p className="px-3 py-1.5 bg-slate-900 rounded">
                  Booking #{index + 1}
                </p>
                <p
                  className={`px-3 py-1 text-xs rounded-full ${
                    booking.status === "confirmed"
                      ? "bg-green-400/15 text-green-600"
                      : "bg-red-400/15 text-red-600"
                  }`}
                >
                  {booking.status}
                </p>
              </div>
              <div className="flex items-start gap-2 mt-3">
                <img
                  src={assets.calendar_icon_colored}
                  alt=""
                  className="w-4 h-4 mt-1"
                />
                <div>
                  <p className="text-slate-400">Rental Period</p>
                  <p>
                    {booking.pickupDate.split("T")[0]} To{" "}
                    {booking.returnDate.split("T")[0]}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 mt-3">
                <img
                  src={assets.location_icon_colored}
                  alt=""
                  className="w-4 h-4 mt-1"
                />
                <div>
                  <p className="text-slate-400">Pick-up Location</p>
                  <p>{booking.car.location}</p>
                </div>
              </div>
            </div>
            {/* Price */}
            <div className="md:col-span-1 flex flex-col justify-between gap-6">
              <div className="text-sm text-slate-400 text-right">
                <p>Total Price</p>
                <h1 className="text-2xl font-semibold text-primary">
                  {import.meta.env.VITE_CURRENCY}
                  {booking.price}
                </h1>
                <p>Booked on {booking.createdAt.split("T")[0]}</p>
              </div>
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <button
                  onClick={() => cancelBooking(booking._id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors self-end w-full sm:w-auto"
                >
                  Cancel Booking
                </button>
              )}
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <button
                  onClick={() => {
                    setChatBookingId(booking._id);
                    setChatOwnerName(
                      booking.car?.owner?.name || 
                      booking.car?.owner?.email?.split("@")[0] || 
                      "Owner"
                    );
                    setChatOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600/15 text-blue-400 rounded-lg hover:bg-blue-600/25 transition-colors self-end w-full sm:w-auto mt-2"
                >
                  💬 Chat with Owner
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <ChatWindow
        bookingId={chatBookingId}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        otherPartyName={chatOwnerName}
      />
    </div>
  );
};

export default MyBookings;
