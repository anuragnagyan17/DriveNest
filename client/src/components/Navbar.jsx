import React, { useState } from "react";
import { assets, menuLinks } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { setShowLogin, user, logout, isOwner, axios, setIsOwner, notifications, fetchNotifications } =
    useAppContext();

  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const navigate = useNavigate();

  const markNotificationsAsRead = async () => {
    try {
      const { data } = await axios.post("/api/notifications/mark-read");
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const changeRole = async () => {
    try {
      const { data } = await axios.post("/api/owner/change-role");
      if (data.success) {
        setIsOwner(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-slate-300 border-b border-borderColor relative transition-all ${
        location.pathname === "/" ? "bg-slate-900" : "bg-slate-800"
      } `}
    >
      <Link to="/">
        <img src={assets.logo} alt="logo" className="h-28 md:h-32" />
      </Link>

      <div
        className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${
          location.pathname === "/" ? "bg-slate-900" : "bg-slate-800"
        } ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}
      >
        {menuLinks.map((link, index) => (
          <Link key={index} to={link.path}>
            {link.name}
          </Link>
        ))}

        <div className="hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56">
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="Search products"
          />
          <img src={assets.search_icon} alt="" />
        </div>
        <div className="flex max-sm:flex-col items-start sm:items-center gap-6 relative">
          {user && (
            <div className="relative">
              <button
                onClick={() => setOpenNotifications(!openNotifications)}
                className="relative p-2 rounded-full hover:bg-slate-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-[10px] flex items-center justify-center rounded-full text-white">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {openNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-borderColor rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-borderColor flex justify-between items-center bg-slate-900">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <button onClick={markNotificationsAsRead} className="text-xs text-blue-400 hover:text-blue-300">Mark all as read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif._id} onClick={() => { if(notif.link) navigate(notif.link); setOpenNotifications(false); }} className={`p-4 border-b border-borderColor cursor-pointer hover:bg-slate-700 transition-colors ${!notif.isRead ? 'bg-slate-700/50' : ''}`}>
                          <p className="text-sm text-white">{notif.message}</p>
                          <span className="text-xs text-slate-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => (isOwner ? navigate("/owner") : changeRole())}
            className="cursor-pointer"
          >
            {isOwner ? "Dashboard" : "List cars"}
          </button>
          <button
            onClick={() => {
              user ? logout() : setShowLogin(true);
            }}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </div>
      <button
        className="sm:hidden cursor-pointer"
        aria-label="Menu"
        onClick={() => setOpen(!open)}
      >
        <img src={open ? assets.close_icon : assets.menu_icon} alt="" />
      </button>
    </div>
  );
};

export default Navbar;
