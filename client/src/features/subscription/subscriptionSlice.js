import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API, { getAPIError } from '../../services/api';

const initialState = {
  subscription: null,
  isLoading: false,
  isError: false,
  message: '',
};

// Get current subscription details
export const getSubscription = createAsyncThunk(
  'subscription/get',
  async (_, thunkAPI) => {
    try {
      const response = await API.get('/payments/subscription');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Create checkout session (directs user to Stripe checkout URL)
export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckout',
  async (planId, thunkAPI) => {
    try {
      const response = await API.post('/payments/create-checkout-session', { planId });
      // Redirect to Checkout page
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Cancel active subscription
export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, thunkAPI) => {
    try {
      const response = await API.post('/payments/cancel');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    resetSubState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get subscription
      .addCase(getSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload;
      })
      .addCase(getSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create checkout
      .addCase(createCheckoutSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload.subscription;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetSubState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
