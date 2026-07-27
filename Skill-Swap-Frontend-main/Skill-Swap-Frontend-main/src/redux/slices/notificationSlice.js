// src/redux/slices/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Full list (usually on refresh or fetch)
    setNotifications: (state, action) => {
      const list = action.payload;

      // Sort newest first
      state.notifications = list.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
    },

    // For real-time socket pushes
    addNotification: (state, action) => {
      const notif = action.payload;

      // Avoid duplicates
      const exists = state.notifications.some((n) => n._id === notif._id);
      if (!exists) {
        state.notifications.unshift(notif); // Push to top
        if (!notif.isRead) state.unreadCount += 1;
      }
    },

    markAsRead: (state, action) => {
      const id = action.payload;
      const target = state.notifications.find((n) => n._id === id);
      if (target && !target.isRead) {
        target.isRead = true;
        state.unreadCount -= 1;
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
