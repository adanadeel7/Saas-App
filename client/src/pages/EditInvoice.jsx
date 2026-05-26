import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getInvoice, updateInvoice, reset } from '../features/invoices/invoiceSlice';
import InvoiceForm from '../components/invoices/InvoiceForm';
import toast from 'react-hot-toast';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentInvoice, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.invoices
  );

  useEffect(() => {
    dispatch(getInvoice(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isError && !isLoading) {
      toast.error(message || 'Failed to fetch invoice details');
      dispatch(reset());
    }
  }, [isError, isLoading, message, dispatch]);

  const onSubmit = (invoiceData) => {
    dispatch(updateInvoice({ id, invoiceData }))
      .unwrap()
      .then(() => {
        toast.success('Invoice updated successfully!');
        dispatch(reset());
        navigate(`/invoices/${id}`);
      })
      .catch((err) => {
        toast.error(err || 'Failed to update invoice');
      });
  };

  if (isLoading && !currentInvoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-surface-variant">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
          <p className="text-sm font-bold">Retrieving Invoice Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen">
      {currentInvoice && (
        <InvoiceForm
          initialData={currentInvoice}
          onSubmit={onSubmit}
          submitBtnText="Save Changes"
        />
      )}
    </div>
  );
};

export default EditInvoice;
