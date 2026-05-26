import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createInvoice, reset } from '../features/invoices/invoiceSlice';
import InvoiceForm from '../components/invoices/InvoiceForm';
import toast from 'react-hot-toast';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Reset state on mount
    dispatch(reset());
  }, [dispatch]);

  const onSubmit = (invoiceData) => {
    dispatch(createInvoice(invoiceData))
      .unwrap()
      .then(() => {
        toast.success('Invoice created successfully!');
        navigate('/dashboard');
      })
      .catch((err) => {
        toast.error(err || 'Failed to create invoice');
      });
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <InvoiceForm onSubmit={onSubmit} submitBtnText="Create Invoice" />
    </div>
  );
};

export default CreateInvoice;
