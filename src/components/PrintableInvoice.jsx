import React from 'react';
import { Printer, ShieldCheck } from 'lucide-react';

const PrintableInvoice = ({ invoice }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const customer = invoice.customer || {};
  const items = invoice.items || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} /> Print Official Invoice / Save PDF
        </button>
      </div>

      <div
        className="printable-invoice card"
        style={{
          padding: '36px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Company Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5' }}>
              <ShieldCheck size={28} />
              <span style={{ fontSize: '24px', fontWeight: 800 }}>SecureERP Inc.</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              100 Enterprise Tech Boulevard, Financial District<br />
              GSTIN: 29AAACU1234K1Z0 | Phone: +91 80 4000 9000
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>TAX INVOICE</h2>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#4f46e5' }}>{invoice.invoiceNumber}</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Date: {new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Billing Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '24px 0' }}>
          <div>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Billed To:</h4>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>{customer.customerName || 'Valued Customer'}</div>
            <div style={{ fontSize: '13px', color: '#334155' }}>{customer.address}</div>
            <div style={{ fontSize: '13px', color: '#334155' }}>
              {customer.city} {customer.state} {customer.country}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Email: {customer.email} | Phone: {customer.phone}</div>
            {customer.gstNumber && <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 4 }}>GSTIN: {customer.gstNumber}</div>}
          </div>

          <div style={{ textAlign: 'right' }}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Payment Status:</h4>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: invoice.paymentStatus === 'paid' ? '#d1fae5' : '#fee2e2',
                color: invoice.paymentStatus === 'paid' ? '#065f46' : '#991b1b',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'uppercase'
              }}
            >
              {invoice.paymentStatus}
            </span>
          </div>
        </div>

        {/* Invoice Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '13px' }}>
              <th style={{ padding: '10px' }}>#</th>
              <th style={{ padding: '10px' }}>Item Description</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Price (₹)</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <td style={{ padding: '10px' }}>{idx + 1}</td>
                <td style={{ padding: '10px', fontWeight: 600 }}>{item.productName}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>₹{Number(item.price).toLocaleString()}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>₹{Number(item.total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoice Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#64748b' }}>
              <span>Subtotal:</span>
              <span>₹{Number(invoice.subTotal || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#64748b' }}>
              <span>Tax (GST):</span>
              <span>+ ₹{Number(invoice.tax || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#64748b' }}>
              <span>Discount:</span>
              <span>- ₹{Number(invoice.discount || 0).toLocaleString()}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                padding: '10px 0',
                borderTop: '2px solid #e2e8f0',
                fontSize: '16px',
                fontWeight: 800,
                color: '#0f172a',
                marginTop: '6px'
              }}
            >
              <span>Grand Total:</span>
              <span style={{ color: '#4f46e5' }}>₹{Number(invoice.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          Thank you for doing business with SecureERP! Computer generated invoice, no signature required.
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoice;
