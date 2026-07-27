// src/components/NotificationBell.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../redux/slices/notificationSlice";
import { FaBell } from "react-icons/fa";
import io from "socket.io-client";
import NotificationDropdown from "./NotificationDropdown";
import { API_BASE_URL } from "../config";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io(`${API_BASE_URL}/notifications`, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("🔔 Notification socket connected:", socket.id);
    });

    socket.on("new_notification", (notification) => {
      dispatch(
        setNotifications([notification, ...notifications]) // Prepend new one
      );
    });

    return () => socket.disconnect();
  }, [dispatch, notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsDropdownOpen((open) => !open)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md transition"
        title="Notifications"
      >
        <FaBell size={28} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2">
          <NotificationDropdown />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
