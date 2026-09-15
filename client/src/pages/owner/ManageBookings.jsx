import React, { useEffect, useState } from "react";
import { dummyMyBookingsData } from "../../assets/assets";
import Title from "../../components/Title";
import { useAppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";
import ChatWindow from "../../components/ChatWindow";

const ManageBookings = () => {
  const { axios } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [chatBookingId, setChatBookingId] = useState(null);
  const [chatUserName, setChatUserName] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/owner");
      data.success ? setBookings(data.bookings) : toast.error(data.message);
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
        fetchOwnerBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);
  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title={"Manage Bookings"}
        subTitle={
          "Track all customer bookings, approve or cancel requests, and manage booking status."
        }
      />

      <div className="max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6">
        <table className="w-full border-collapse text-left text-sm text-slate-300">
          <thead className="text-slate-400">
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Date Range</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium max-md:hidden">Payment</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr
                key={index}
                className="border-t border-borderColor text-slate-400"
              >
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={booking.car.image}
                    alt=""
                    className="h-12 w-12 aspect-square rounded-md object-cover"
                  />
                  <p className="font-medium max-md:hidden">
                    {booking.car.brand} {booking.car.model}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {booking.user?.name || "Client"}
                  </p>
                </td>
                <td className="p-3 max-md:hidden">
                  {booking.pickupDate.split("T")[0]} to{" "}
                  {booking.returnDate.split("T")[0]}
                </td>
                <td className="p-3">
                  {import.meta.env.VITE_CURRENCY}
                  {booking.price}
                </td>
                <td className="p-3 max-md:hidden">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                    offline
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-col items-stretch gap-2">
                    {booking.status === "pending" || booking.status === "confirmed" ? (
                      <select
                        onChange={(e) =>
                          changeBookingStatus(booking._id, e.target.value)
                        }
                        value={booking.status}
                        className="px-2 py-1.5 mt-1 text-slate-400 border border-borderColor rounded-md outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="returned">Returned</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "returned"
                            ? "bg-blue-100 text-blue-500"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setChatBookingId(booking._id);
                        setChatUserName(booking.user?.name || "Client");
                        setChatOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-600/15 text-blue-400 rounded-lg hover:bg-blue-600/25 transition-colors ml-2"
                    >
                      💬 Chat with Client
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ChatWindow
        bookingId={chatBookingId}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        otherPartyName={chatUserName}
      />
    </div>
  );
};

export default ManageBookings;
