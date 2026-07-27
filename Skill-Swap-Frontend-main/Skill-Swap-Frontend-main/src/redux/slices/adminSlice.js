// src/redux/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

// ── 1) Correct Axios instance using global backend URL ─────────────
const API = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
});

// ── 2) Attach JWT & Log every request/response ─────────────────────
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    console.log(
      'ADMIN API Request:',
      config.method?.toUpperCase(),
      config.url,
      'Token:',
      token
    );

    if (token) config.headers['x-auth-token'] = token;
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  res => res,
  error => {
    console.error('ADMIN Response Error:', error);
    return Promise.reject(error);
  }
);

// ============================
// Thunks (Async Actions)
// ============================

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, thunkAPI) => {
    try {
      const response = await API.get('/users');
      return response.data;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        'Failed to fetch users';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// Add new user
export const addUser = createAsyncThunk(
  'admin/addUser',
  async (userData, thunkAPI) => {
    try {
      const response = await API.post('/users', userData);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to add user'
      );
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, thunkAPI) => {
    try {
      await API.delete(`/users/${userId}`);
      return userId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

// Fetch reports
export const fetchReports = createAsyncThunk(
  'admin/fetchReports',
  async (_, thunkAPI) => {
    try {
      const response = await API.get('/reports');
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch reports'
      );
    }
  }
);

// Resolve a specific report
export const resolveReport = createAsyncThunk(
  'admin/resolveReport',
  async (reportId, thunkAPI) => {
    try {
      const response = await API.patch(`/reports/${reportId}/resolve`);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to resolve report'
      );
    }
  }
);

// Fetch all chat messages for one session
export const fetchSessionChats = createAsyncThunk(
  'admin/fetchSessionChats',
  async (sessionId, thunkAPI) => {
    try {
      const response = await API.get(`/session-chats/${sessionId}`);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch session chats'
      );
    }
  }
);

// Fetch analytics
export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, thunkAPI) => {
    try {
      const response = await API.get('/analytics');
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch analytics'
      );
    }
  }
);

// Engagement stats
export const fetchEngagementStats = createAsyncThunk(
  'admin/fetchEngagementStats',
  async (_, thunkAPI) => {
    try {
      const response = await API.get('/engagement-stats');
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message ||
          'Failed to fetch engagement statistics'
      );
    }
  }
);

// Block user
export const blockUser = createAsyncThunk(
  'admin/blockUser',
  async (userId, thunkAPI) => {
    try {
      await API.patch(`/users/${userId}/block`);
      return userId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to block user'
      );
    }
  }
);

// Unblock user
export const unblockUser = createAsyncThunk(
  'admin/unblockUser',
  async (userId, thunkAPI) => {
    try {
      await API.patch(`/users/${userId}/unblock`);
      return userId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to unblock user'
      );
    }
  }
);

// ============================
// Initial State
// ============================

const initialState = {
  users: [],
  reports: [],
  analytics: {},
  engagementStats: {},
  sessionChats: [],
  loading: false,
  error: null,
};

// ============================
// Slice
// ============================

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Users
    builder
      .addCase(fetchUsers.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.loading = false;
        s.users = a.payload;
      })
      .addCase(fetchUsers.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    builder
      .addCase(addUser.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(addUser.fulfilled, (s, a) => {
        s.loading = false;
        s.users.push(a.payload);
      })
      .addCase(addUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    builder
      .addCase(deleteUser.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.loading = false;
        s.users = s.users.filter(u => u._id !== a.payload);
      })
      .addCase(deleteUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // Reports
    builder
      .addCase(fetchReports.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchReports.fulfilled, (s, a) => {
        s.loading = false;
        s.reports = a.payload;
      })
      .addCase(fetchReports.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    builder
      .addCase(resolveReport.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(resolveReport.fulfilled, (s, a) => {
        s.loading = false;

        const idx = s.reports.findIndex(r => r._id === a.payload._id);
        if (idx !== -1) s.reports[idx] = a.payload;
      })
      .addCase(resolveReport.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // Analytics
    builder
      .addCase(fetchAnalytics.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (s, a) => {
        s.loading = false;
        s.analytics = a.payload;
      })
      .addCase(fetchAnalytics.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // Engagement
    builder
      .addCase(fetchEngagementStats.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchEngagementStats.fulfilled, (s, a) => {
        s.loading = false;
        s.engagementStats = a.payload;
      })
      .addCase(fetchEngagementStats.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // Session Chats
    builder
      .addCase(fetchSessionChats.pending, s => {
        s.loading = true;
        s.error = null;
        s.sessionChats = [];
      })
      .addCase(fetchSessionChats.fulfilled, (s, a) => {
        s.loading = false;
        s.sessionChats = a.payload;
      })
      .addCase(fetchSessionChats.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // Block user
    builder
      .addCase(blockUser.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(blockUser.fulfilled, (s, a) => {
        s.loading = false;
        const id = a.payload;
        const idx = s.users.findIndex(u => u._id === id);
        if (idx !== -1) s.users[idx].status = 'blocked';
      })
      .addCase(blockUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });

    // Unblock user
    builder
      .addCase(unblockUser.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(unblockUser.fulfilled, (s, a) => {
        s.loading = false;
        const id = a.payload;
        const idx = s.users.findIndex(u => u._id === id);
        if (idx !== -1) s.users[idx].status = '';
      })
      .addCase(unblockUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  }
});

export default adminSlice.reducer;
