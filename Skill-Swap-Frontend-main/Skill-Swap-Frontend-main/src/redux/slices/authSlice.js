// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Safe helpers so you don't blow up on bad localStorage
const safeGetToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || null;
};

const safeGetUser = () => {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem('user');

  // Handle "undefined", "null", empty string, etc.
  if (!raw || raw === 'undefined' || raw === 'null') {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn('authSlice: failed to parse user from localStorage:', raw);
    // Clean up the mess so it doesn’t keep breaking
    localStorage.removeItem('user');
    return null;
  }
};

const initialState = {
  user: safeGetUser(),
  token: safeGetToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // EXPECTS: payload = { user, token }
    loginSuccess: (state, action) => {
      state.loading = false;
      state.error = null;

      const { user, token } = action.payload || {};

      state.user = user || null;
      state.token = token || null;

      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
