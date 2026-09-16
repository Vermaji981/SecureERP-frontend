import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import PrintableInvoice from '../components/PrintableInvoice';
import api from '../services/api';
import { FileText, Printer, Eye } from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/invoices?page=${page}&limit=8`);
      if (res.success) {
        setInvoices(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Invoice Directory</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>View, download, and print official corporate tax invoices.</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Invoice #', 'Customer Name', 'Issue Date', 'Amount (₹)', 'Payment Status', 'Actions']}>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td style={{ fontWeight: 700, color: '#4f46e5' }}>{inv.invoiceNumber}</td>
                <td style={{ fontWeight: 600 }}>{inv.customer ? inv.customer.customerName : 'Walk-in'}</td>
                <td>{new Date(inv.issueDate || inv.createdAt).toLocaleDateString()}</td>
                <td style={{ fontWeight: 700 }}>₹{Number(inv.totalAmount).toLocaleString()}</td>
                <td>
                  <Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge>
                </td>
                <td>
                  <button onClick={() => setSelectedInvoice(inv)} className="btn btn-secondary btn-sm">
                    <Printer size={14} /> View & Print
                  </button>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Printable Invoice Modal */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Official Tax Invoice View">
        <PrintableInvoice invoice={selectedInvoice} />
      </Modal>
    </div>
  );
};

export default Invoices;
