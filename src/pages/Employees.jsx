import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { Plus, Search, Filter, Edit, Trash2, Eye, UserPlus } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [viewingEmp, setViewingEmp] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    address: ''
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let query = `/employees?page=${page}&limit=8`;
      if (search) query += `&search=${search}`;
      if (deptFilter) query += `&department=${deptFilter}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const res = await api.get(query);
      if (res.success) {
        setEmployees(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.success) setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, deptFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      email: '',
      phone: '',
      department: departments.length > 0 ? departments[0]._id : '',
      designation: '',
      salary: '',
      address: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department ? emp.department._id || emp.department : '',
      designation: emp.designation,
      salary: emp.salary,
      address: emp.address || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingEmp) {
        await api.put(`/employees/${editingEmp._id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee record?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Employee Directory</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage workforce profiles, salaries, and department roles.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <UserPlus size={18} /> Add New Employee
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="navbar-search" style={{ width: '280px' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '180px' }}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: '150px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {/* Employee List Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Emp ID', 'Employee Name', 'Department', 'Designation', 'Salary', 'Status', 'Actions']}>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td style={{ fontWeight: 700, color: '#4f46e5' }}>{emp.employeeId}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{emp.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{emp.email}</div>
                </td>
                <td>{emp.department ? emp.department.name : 'N/A'}</td>
                <td>{emp.designation}</td>
                <td style={{ fontWeight: 700 }}>₹{Number(emp.salary).toLocaleString()}</td>
                <td>
                  <Badge status={emp.status}>{emp.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setViewingEmp(emp)}
                      className="btn btn-secondary btn-sm"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Employee"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeactivate(emp._id)}
                      className="btn btn-danger btn-sm"
                      title="Deactivate"
                    >
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

      {/* Add / Edit Employee Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmp ? 'Edit Employee Record' : 'Create Employee Record'}>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                className="form-control"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
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

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Department</label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Senior Developer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Monthly Basic Salary (₹)</label>
            <input
              type="number"
              className="form-control"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
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
              {editingEmp ? 'Update Employee' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Single Employee Details Modal */}
      <Modal isOpen={!!viewingEmp} onClose={() => setViewingEmp(null)} title="Employee Detail Profile">
        {viewingEmp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div className="user-avatar" style={{ width: 54, height: 54, fontSize: 22 }}>
                {viewingEmp.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{viewingEmp.name}</h3>
                <p style={{ color: '#4f46e5', fontWeight: 600, fontSize: '13px' }}>{viewingEmp.designation}</p>
                <Badge status={viewingEmp.status}>{viewingEmp.status}</Badge>
              </div>
            </div>

            <div className="grid-cols-2" style={{ fontSize: '14px' }}>
              <div><strong>Employee ID:</strong> {viewingEmp.employeeId}</div>
              <div><strong>Email:</strong> {viewingEmp.email}</div>
              <div><strong>Phone:</strong> {viewingEmp.phone}</div>
              <div><strong>Department:</strong> {viewingEmp.department ? viewingEmp.department.name : 'N/A'}</div>
              <div><strong>Basic Salary:</strong> ₹{Number(viewingEmp.salary).toLocaleString()}</div>
              <div><strong>Joining Date:</strong> {new Date(viewingEmp.joiningDate).toLocaleDateString()}</div>
            </div>

            {viewingEmp.address && (
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '8px' }}>
                <strong>Address:</strong> {viewingEmp.address}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Employees;
