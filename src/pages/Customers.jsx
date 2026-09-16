import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { Plus, Edit, Trash2, Eye, UserCheck } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomerData, setViewingCustomerData] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    gstNumber: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ customerName: '', email: '', phone: '', address: '', city: '', state: '', country: 'India', gstNumber: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      customerName: cust.customerName,
      email: cust.email,
      phone: cust.phone,
      address: cust.address || '',
      city: cust.city || '',
      state: cust.state || '',
      country: cust.country || 'India',
      gstNumber: cust.gstNumber || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleViewHistory = async (id) => {
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.success) {
        setViewingCustomerData(res.data);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer._id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Customer CRM</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Client accounts, billing addresses, and order history.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <UserCheck size={18} /> Add Customer
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Customer Name', 'Email & Phone', 'Location', 'GSTIN', 'Status', 'Actions']}>
            {customers.map((cust) => (
              <tr key={cust._id}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{cust.customerName}</td>
                <td>
                  <div>{cust.email}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{cust.phone}</div>
                </td>
                <td>
                  {cust.city ? `${cust.city}, ${cust.state}` : cust.country || 'N/A'}
                </td>
                <td>{cust.gstNumber || 'N/A'}</td>
                <td>
                  <Badge status={cust.status}>{cust.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleViewHistory(cust._id)} className="btn btn-secondary btn-sm" title="Order History">
                      <Eye size={14} /> Orders
                    </button>
                    <button onClick={() => handleOpenEdit(cust)} className="btn btn-secondary btn-sm">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(cust._id)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label>Customer / Company Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-cols-3">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                className="form-control"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                className="form-control"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                className="form-control"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Order History Modal */}
      <Modal isOpen={!!viewingCustomerData} onClose={() => setViewingCustomerData(null)} title="Customer Sales & Order History">
        {viewingCustomerData && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
              {viewingCustomerData.customer.customerName}
            </h3>
            <Table headers={['Invoice #', 'Date', 'Total Amount', 'Payment Status']}>
              {(viewingCustomerData.sales || []).map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 700 }}>{s.invoiceNumber}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(s.totalAmount).toLocaleString()}</td>
                  <td>
                    <Badge status={s.paymentStatus}>{s.paymentStatus}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
