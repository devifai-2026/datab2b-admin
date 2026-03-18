import api from './api';
import html2pdf from 'html2pdf.js';

const API_URL = '/invoices';

const getInvoices = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

const getMyInvoices = async () => {
  const response = await api.get(API_URL + '/my');
  return response.data;
};

const getInvoiceById = async (invoiceId: string) => {
  const response = await api.get(`${API_URL}/${invoiceId}`);
  return response.data;
};

const createInvoice = async (payload: any) => {
  const response = await api.post(API_URL, payload);
  return response.data;
};

const downloadInvoice = async (invoiceId: string) => {
  try {
    console.log('Starting invoice download for:', invoiceId);
    
    // Fetch invoice data
    console.log('Fetching invoice data...');
    const invoice = await getInvoiceById(invoiceId);
    console.log('Invoice data fetched:', invoice);

    // Create HTML content for PDF
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 900px;">
        <h1 style="text-align: center; color: #f97316; margin: 0;">INVOICE</h1>
        <p style="text-align: center; color: #666; margin: 5px 0;">Invoice ID: ${invoice._id}</p>
        <p style="text-align: center; color: #666; margin: 5px 0;">Status: <strong>${invoice.status.toUpperCase()}</strong></p>
        
        <hr style="border: none; border-top: 2px solid #f97316; margin: 30px 0;">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0;">
          <div>
            <h3 style="color: #f97316; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0;">Bill To</h3>
            <p style="margin: 5px 0;"><strong>${invoice.user?.name || 'N/A'}</strong></p>
            <p style="margin: 5px 0;">Email: ${invoice.user?.email || 'N/A'}</p>
          </div>
          
          <div>
            <h3 style="color: #f97316; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0;">Invoice Details</h3>
            <p style="margin: 5px 0;">Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0;">Order ID: ${invoice.razorpayOrderId || 'N/A'}</p>
            <p style="margin: 5px 0;">Payment ID: ${invoice.razorpayPaymentId || 'N/A'}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
          <thead>
            <tr style="background-color: #f97316; color: white;">
              <th style="padding: 12px; text-align: left;">Description</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Unit Price</th>
              <th style="padding: 12px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px;">${invoice.productName}</td>
              <td style="padding: 12px; text-align: center;">${invoice.quantity}</td>
              <td style="padding: 12px; text-align: right;">${invoice.currency} ${(invoice.amount / invoice.quantity).toFixed(2)}</td>
              <td style="padding: 12px; text-align: right;">${invoice.currency} ${invoice.amount}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: right; margin: 30px 0;">
          <div style="display: grid; grid-template-columns: 150px 100px; gap: 20px; margin: 10px 0;">
            <div>Subtotal:</div>
            <div>${invoice.currency} ${invoice.amount}</div>
          </div>
          <div style="display: grid; grid-template-columns: 150px 100px; gap: 20px; margin: 10px 0;">
            <div>Tax (0%):</div>
            <div>0.00</div>
          </div>
          <div style="display: grid; grid-template-columns: 150px 100px; gap: 20px; margin: 20px 0; border-top: 2px solid #f97316; padding-top: 10px;">
            <div style="font-weight: bold; font-size: 16px;">TOTAL:</div>
            <div style="font-weight: bold; font-size: 16px; color: #f97316;">${invoice.currency} ${invoice.amount}</div>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice.</p>
          <p>For support, contact support@datab2b.in</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    console.log('HTML content created, generating PDF...');

    // PDF options
    const options = {
      margin: 10,
      filename: `invoice_${invoiceId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };

    // Generate PDF and wait for it
    console.log('Starting PDF generation...');
    return new Promise((resolve, reject) => {
      try {
        html2pdf()
          .set(options)
          .from(htmlContent)
          .save()
          .then(() => {
            console.log('PDF generated and downloaded successfully');
            resolve(true);
          })
          .catch((err: any) => {
            console.error('html2pdf error:', err);
            reject(new Error('Failed to generate PDF: ' + err.message));
          });
      } catch (err: any) {
        console.error('PDF generation error:', err);
        reject(new Error('PDF generation failed: ' + err.message));
      }
    });
  } catch (error: any) {
    console.error('Failed to download invoice:', error);
    throw new Error(error.message || 'Failed to download invoice');
  }
};

const invoiceService = {
  getInvoices,
  getMyInvoices,
  getInvoiceById,
  createInvoice,
  downloadInvoice,
};

export default invoiceService;