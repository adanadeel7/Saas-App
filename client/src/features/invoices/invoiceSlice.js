import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API, { getAPIError } from '../../services/api';

const initialState = {
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all user invoices
export const getInvoices = createAsyncThunk(
  'invoices/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await API.get('/invoices');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Get single invoice
export const getInvoice = createAsyncThunk(
  'invoices/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await API.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Create new invoice
export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (invoiceData, thunkAPI) => {
    try {
      const response = await API.post('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Update invoice
export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, invoiceData }, thunkAPI) => {
    try {
      const response = await API.put(`/invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

// Delete invoice
export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (id, thunkAPI) => {
    try {
      await API.delete(`/invoices/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getAPIError(error));
    }
  }
);

export const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Invoices
      .addCase(getInvoices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invoices = action.payload;
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Invoice
      .addCase(getInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentInvoice = action.payload;
      })
      .addCase(getInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invoices.unshift(action.payload);
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Invoice
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentInvoice = action.payload;
        state.invoices = state.invoices.map((inv) =>
          inv._id === action.payload._id ? action.payload : inv
        );
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.invoices = state.invoices.filter((inv) => inv._id !== action.payload);
        if (state.currentInvoice && state.currentInvoice._id === action.payload) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
