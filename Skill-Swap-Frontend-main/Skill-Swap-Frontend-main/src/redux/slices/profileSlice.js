// src/redux/slices/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";

// Axios instance
const API = axios.create({
  baseURL: `${API_BASE_URL}/api/users`,
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["x-auth-token"] = token;
  return config;
});

// ---------------------
// Thunk: Update Profile
// ---------------------
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (formData, thunkAPI) => {
    try {
      const res = await API.put("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data; // Updated user object
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// ---------------------
// Slice
// ---------------------
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
