import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, Check, X, Ban } from 'lucide-react';

const Leaves = () => {
  const { user, hasRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const canApprove = hasRole(['admin', 'hr', 'manager']);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      let query = '/leaves';
      if (statusFilter) query += `?status=${statusFilter}`;
      const res = await api.get(query);
      if (res.success) setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (canApprove) {
      try {
        const res = await api.get('/employees?limit=100');
        if (res.success) setEmployees(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleOpenApply = () => {
    setFormData({
      employeeId: employees.length > 0 ? employees[0]._id : '',
      leaveType: 'Casual Leave',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      reason: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/leaves', formData);
      setIsModalOpen(false);
      fetchLeaves();
    } catch (err) {
      setError(err.message || 'Leave application failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/leaves/${id}/approve`);
      fetchLeaves();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/leaves/${id}/reject`);
      fetchLeaves();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this pending leave request?')) {
      try {
        await api.put(`/leaves/${id}/cancel`);
        fetchLeaves();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Leave Management</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Submit leave applications, view history, and process approvals.</p>
        </div>
        <button onClick={handleOpenApply} className="btn btn-primary">
          <CalendarDays size={18} /> Apply for Leave
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <select
          className="form-control"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Leaves Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Employee', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Approved By', 'Status', 'Actions']}>
            {leaves.map((l) => (
              <tr key={l._id}>
                <td style={{ fontWeight: 600 }}>{l.employee ? l.employee.name : 'Employee'}</td>
                <td>{l.leaveType}</td>
                <td>{new Date(l.startDate).toLocaleDateString()}</td>
                <td>{new Date(l.endDate).toLocaleDateString()}</td>
                <td style={{ fontSize: '12px', maxWidth: '200px' }}>{l.reason}</td>
                <td style={{ fontSize: '12px', color: '#64748b' }}>{l.approvedBy ? l.approvedBy.name : '-'}</td>
                <td>
                  <Badge status={l.status}>{l.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {canApprove && l.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(l._id)} className="btn btn-primary btn-sm" title="Approve">
                          <Check size={14} /> Approve
                        </button>
                        <button onClick={() => handleReject(l._id)} className="btn btn-danger btn-sm" title="Reject">
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}
                    {l.status === 'pending' && (
                      <button onClick={() => handleCancel(l._id)} className="btn btn-secondary btn-sm" title="Cancel">
                        <Ban size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Leave">
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {canApprove && (
            <div className="form-group">
              <label>Select Employee (Optional for HR/Manager)</label>
              <select
                className="form-control"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              >
                <option value="">Apply for Myself</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} ({e.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Leave Type</label>
            <select
              className="form-control"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              required
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Paid Leave">Paid Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
              <option value="Maternity/Paternity">Maternity/Paternity</option>
            </select>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Leave</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="State clear reason for leave request..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
