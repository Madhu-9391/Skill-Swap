// src/components/NotificationDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markAsRead } from "../redux/slices/notificationSlice";
import axios from "axios";
import { API_BASE_URL } from "../config";

const NotificationDropdown = () => {
  const { notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();

  const [filter, setFilter] = useState("all");

  const dropdownRef = useRef(null);

  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["x-auth-token"] = token;
    return config;
  });

  const handleMarkAsRead = async (id) => {
    dispatch(markAsRead(id));

    try {
      await api.patch(`/api/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to update read state:", err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n._id);

    if (unreadIds.length === 0) return;

    unreadIds.forEach((id) => dispatch(markAsRead(id)));

    try {
      await api.patch(`/api/notifications/mark-all-read`);
    } catch (err) {
      console.error("Failed to mark all as read:", err.message);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "read") return notif.isRead;
    return true;
  });

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        dropdownRef.current.style.display = "none";
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-md z-50"
    >
      {/* Filters */}
      <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setFilter("unread")}
          className={`text-sm ${
            filter === "unread" ? "text-blue-700 font-bold" : "text-blue-500"
          }`}
        >
          Unread
        </button>

        <button
          onClick={() => setFilter("read")}
          className={`text-sm ${
            filter === "read" ? "text-blue-700 font-bold" : "text-blue-500"
          }`}
        >
          Read
        </button>

        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Mark All
        </button>
      </div>

      {/* Notifications */}
      <ul className="max-h-64 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <li
              key={notif._id}
              className={`p-3 border-b cursor-pointer ${
                !notif.isRead ? "bg-gray-100 font-medium" : "bg-white"
              } hover:bg-gray-200`}
              onClick={() => handleMarkAsRead(notif._id)}
            >
              {notif.message}
            </li>
          ))
        ) : (
          <li className="p-4 text-center text-gray-400 text-sm">
            No notifications
          </li>
        )}
      </ul>
    </div>
  );
};

export default NotificationDropdown;
