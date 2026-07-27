// src/redux/slices/skillsSlice.js
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

// =====================
// Thunk: Fetch skills
// =====================
export const fetchSkills = createAsyncThunk(
  "skills/fetchSkills",
  async (_, thunkAPI) => {
    try {
      const res = await API.get("/skills");
      return res.data; // { skillsToTeach, skillsToLearn }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// =====================
// Thunk: Update skills
// =====================
export const updateSkills = createAsyncThunk(
  "skills/updateSkills",
  async (payload, thunkAPI) => {
    try {
      const res = await API.put("/skills", payload); 
      return res.data; // updated skills object
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const skillsSlice = createSlice({
  name: "skills",
  initialState: {
    skillsToTeach: [],
    skillsToLearn: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSkills(state) {
      state.skillsToTeach = [];
      state.skillsToLearn = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch skills
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skillsToTeach = action.payload.skillsToTeach || [];
        state.skillsToLearn = action.payload.skillsToLearn || [];
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update skills
      .addCase(updateSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skillsToTeach = action.payload.skillsToTeach;
        state.skillsToLearn = action.payload.skillsToLearn;
      })
      .addCase(updateSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSkills } = skillsSlice.actions;
export default skillsSlice.reducer;
