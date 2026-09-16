import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { Plus, Edit, Trash2, Eye, Truck } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplierData, setViewingSupplierData] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    supplierName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: ''
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({ supplierName: '', companyName: '', email: '', phone: '', address: '', gstNumber: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      supplierName: sup.supplierName,
      companyName: sup.companyName,
      email: sup.email,
      phone: sup.phone,
      address: sup.address || '',
      gstNumber: sup.gstNumber || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleViewHistory = async (id) => {
    try {
      const res = await api.get(`/suppliers/${id}`);
      if (res.success) {
        setViewingSupplierData(res.data);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Supplier Management</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage vendor contacts, GSTIN tax details, and order history.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Truck size={18} /> Add Supplier
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Company Name', 'Contact Person', 'Email & Phone', 'GSTIN', 'Status', 'Actions']}>
            {suppliers.map((sup) => (
              <tr key={sup._id}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{sup.companyName}</td>
                <td style={{ fontWeight: 600 }}>{sup.supplierName}</td>
                <td>
                  <div>{sup.email}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{sup.phone}</div>
                </td>
                <td>{sup.gstNumber || 'N/A'}</td>
                <td>
                  <Badge status={sup.status}>{sup.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleViewHistory(sup._id)} className="btn btn-secondary btn-sm" title="Purchase History">
                      <Eye size={14} /> History
                    </button>
                    <button onClick={() => handleOpenEdit(sup)} className="btn btn-secondary btn-sm">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(sup._id)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Person Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

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
          </div>

          <div className="form-group">
            <label>GST Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 29ABCDE1234F1Z5"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
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
              {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier History Modal */}
      <Modal isOpen={!!viewingSupplierData} onClose={() => setViewingSupplierData(null)} title="Supplier Purchase History">
        {viewingSupplierData && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
              {viewingSupplierData.supplier.companyName}
            </h3>
            <Table headers={['PO Number', 'Date', 'Total Amount', 'Status']}>
              {(viewingSupplierData.purchases || []).map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 700 }}>{p.purchaseNumber}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(p.totalAmount).toLocaleString()}</td>
                  <td>
                    <Badge status={p.status}>{p.status}</Badge>
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

export default Suppliers;
