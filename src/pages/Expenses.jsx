import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import api from '../services/api';
import { Receipt, Plus, Edit, Trash2, Search } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Utilities',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let query = `/expenses?page=${page}&limit=8`;
      if (search) query += `&search=${search}`;
      if (categoryFilter) query += `&category=${categoryFilter}`;

      const res = await api.get(query);
      if (res.success) {
        setExpenses(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, search, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Utilities',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: exp.description || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const totalExpenseSum = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Expense Management</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Record operational expenses, category breakdown, and financial logs.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Receipt size={18} /> Add New Expense
        </button>
      </div>

      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="navbar-search" style={{ width: '280px' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '200px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Utilities">Utilities</option>
          <option value="Rent">Rent</option>
          <option value="Salaries">Salaries</option>
          <option value="Marketing">Marketing</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Travel">Travel</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Expense Title', 'Category', 'Date', 'Amount (₹)', 'Logged By', 'Actions']}>
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{exp.title}</td>
                <td>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: 600 }}>
                    {exp.category}
                  </span>
                </td>
                <td>{new Date(exp.date).toLocaleDateString()}</td>
                <td style={{ fontWeight: 700, color: '#ef4444' }}>₹{Number(exp.amount).toLocaleString()}</td>
                <td style={{ fontSize: '12px', color: '#64748b' }}>{exp.createdBy ? exp.createdBy.name : 'System'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenEdit(exp)} className="btn btn-secondary btn-sm">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(exp._id)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'Add New Expense'}>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Expense Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Server Infrastructure Payment"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Salaries">Salaries</option>
                <option value="Marketing">Marketing</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description / Notes</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
