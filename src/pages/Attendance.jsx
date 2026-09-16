import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, UserCheck, UserX, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [empFilter, setEmpFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    notes: ''
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let query = `/attendance?date=${dateFilter}`;
      if (empFilter) query += `&employee=${empFilter}`;

      const res = await api.get(query);
      if (res.success) setAttendance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get('/attendance/summary');
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=100');
      if (res.success) setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, empFilter]);

  const handleOpenAdd = () => {
    setFormData({
      employeeId: employees.length > 0 ? employees[0]._id : '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      notes: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/attendance', formData);
      setIsModalOpen(false);
      fetchAttendance();
      fetchSummary();
    } catch (err) {
      setError(err.message || 'Marking attendance failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Workforce Attendance</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Daily check-in, check-out tracking, and presence summaries.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <CheckCircle2 size={18} /> Mark Attendance
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-cols-4">
        <StatsCard title="Present Today" value={summary.present || 0} icon={UserCheck} color="green" />
        <StatsCard title="Absent Today" value={summary.absent || 0} icon={UserX} color="red" />
        <StatsCard title="Half Day / Leave" value={(summary.halfDay || 0) + (summary.leave || 0)} icon={Clock} color="yellow" />
        <StatsCard title="Unmarked / Pending" value={summary.unMarked || 0} icon={CalendarDays} color="blue" />
      </div>

      {/* Date & Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Filter Date:</label>
          <input
            type="date"
            className="form-control"
            style={{ width: '180px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '220px' }}
          value={empFilter}
          onChange={(e) => setEmpFilter(e.target.value)}
        >
          <option value="">All Employees</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name} ({e.employeeId})
            </option>
          ))}
        </select>
      </div>

      {/* Attendance History Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Employee Name', 'Emp ID', 'Designation', 'Check In', 'Check Out', 'Status', 'Notes']}>
            {attendance.map((att) => (
              <tr key={att._id}>
                <td style={{ fontWeight: 600 }}>{att.employee ? att.employee.name : 'Employee'}</td>
                <td style={{ fontWeight: 700, color: '#4f46e5' }}>{att.employee ? att.employee.employeeId : 'N/A'}</td>
                <td>{att.employee ? att.employee.designation : 'N/A'}</td>
                <td>{att.checkIn || '-'}</td>
                <td>{att.checkOut || '-'}</td>
                <td>
                  <Badge status={att.status}>{att.status}</Badge>
                </td>
                <td style={{ fontSize: '12px', color: '#64748b' }}>{att.notes || '-'}</td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Mark Attendance Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mark Attendance Record">
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {user && user.role !== 'employee' && (
            <div className="form-group">
              <label>Select Employee</label>
              <select
                className="form-control"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                required
              >
                <option value="">Select Employee...</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} ({e.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Attendance Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Presence Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Check In Time</label>
              <input
                type="text"
                className="form-control"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Check Out Time</label>
              <input
                type="text"
                className="form-control"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes / Comments</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
