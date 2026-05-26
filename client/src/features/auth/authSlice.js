import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API, { getAPIError } from '../../services/api';

// Get user and token from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user ? user : null,
  token: token ? token : null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await API.post('/auth/register', userData);
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          company: response.data.company,
          plan: response.data.plan,
          themePreference: response.data.themePreference,
          defaultCurrency: response.data.defaultCurrency,
        }));
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await API.post('/auth/login', userData);
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          company: response.data.company,
          plan: response.data.plan,
          themePreference: response.data.themePreference,
          defaultCurrency: response.data.defaultCurrency,
        }));
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Sign in/Register with Google
export const signInWithGoogle = createAsyncThunk(
  'auth/google',
  async (googleData, thunkAPI) => {
    try {
      const response = await API.post('/auth/google', googleData);
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          company: response.data.company,
          plan: response.data.plan,
          role: response.data.role,
          isVerified: response.data.isVerified,
          themePreference: response.data.themePreference,
          defaultCurrency: response.data.defaultCurrency,
        }));
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Get current user profile
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, thunkAPI) => {
    try {
      const response = await API.get('/auth/me');
      if (response.data) {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Update user settings
export const updateSettings = createAsyncThunk(
  'auth/updateSettings',
  async (settingsData, thunkAPI) => {
    try {
      const response = await API.put('/auth/settings', settingsData);
      if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          company: response.data.company,
          plan: response.data.plan,
          themePreference: response.data.themePreference,
          defaultCurrency: response.data.defaultCurrency,
        }));
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Google Login
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Get Me
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
