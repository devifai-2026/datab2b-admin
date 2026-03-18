import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Loader2, Calendar, User as UserIcon, Database, Download } from 'lucide-react';
import invoiceService from '../services/invoiceService';
import { toast } from 'react-toastify';

interface Invoice {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  product: {
    _id: string;
    name: string;
    price: number;
  };
  productName: string;
  quantity: number;
  amount: number;
  currency: string;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch {
      toast.error('Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 15000); // refresh every 15s for realtime
    return () => clearInterval(interval);
  }, []);

  const downloadInvoice = async (invoice: Invoice) => {
    let toastId: string | number | null = null;
    try {
      console.log('Download started for invoice:', invoice._id);
      toastId = toast.info('Generating invoice PDF...', { autoClose: false });
      await invoiceService.downloadInvoice(invoice._id);
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
      toast.success('Invoice downloaded successfully!');
    } catch (error: any) {
      console.error('Download error:', error);
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
      toast.error(error?.message || 'Failed to download invoice. Please try again.');
    }
  };

  return (
    <AdminLayout title="Invoice Management">
      <div className="flex items-center gap-4 bg-orange-50 px-6 py-4 rounded-[20px] border border-orange-100 mb-6">
        <Database size={20} className="text-orange-600" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest leading-none">Recent Invoices</span>
          <span className="text-lg font-black text-stone-900 leading-none mt-1">{invoices.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-stone-200 overflow-x-auto no-scrollbar-x">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">User</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Product</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Amount</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Status</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400">Date</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                    <span className="text-sm font-bold text-stone-400">Loading invoices...</span>
                  </div>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center">
                  <span className="text-sm font-bold text-stone-400">No invoices found.</span>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-stone-50/50 transition-colors">
                  
                  <td className="px-8 py-6 flex gap-2 items-center font-medium text-stone-700">
                    <UserIcon size={16} className="text-stone-400" />
                    <div>
                      <div className="font-bold">{invoice.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-stone-400">{invoice.user?.email || '-'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-stone-900">{invoice.productName || invoice.product?.name}</div>
                    {invoice.product && <div className="text-xs text-stone-400">Product ID: {invoice.product._id}</div>}
                  </td>
                  <td className="px-8 py-6 font-bold text-stone-900">{invoice.currency} {invoice.amount} {invoice.quantity > 1 && `(${invoice.quantity} items)`}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : invoice.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 flex items-center gap-2 text-stone-500 text-sm font-bold">
                    <Calendar size={16} className="text-stone-300" />
                    {new Date(invoice.createdAt).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => downloadInvoice(invoice)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-bold text-sm"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}