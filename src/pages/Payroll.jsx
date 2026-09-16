import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { DollarSign, Plus, CheckCircle, FileSpreadsheet } from 'lucide-react';

const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSlip, setViewingSlip] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    employee: '',
    basicSalary: '',
    allowances: '0',
    bonus: '0',
    deductions: '0',
    month: 'September',
    year: '2026',
    paymentStatus: 'Pending'
  });

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll');
      if (res.success) setPayroll(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    fetchPayroll();
    fetchEmployees();
  }, []);

  const handleOpenAdd = () => {
    const firstEmp = employees.length > 0 ? employees[0] : null;
    setFormData({
      employee: firstEmp ? firstEmp._id : '',
      basicSalary: firstEmp ? firstEmp.salary : '',
      allowances: '5000',
      bonus: '2000',
      deductions: '1500',
      month: 'September',
      year: '2026',
      paymentStatus: 'Pending'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleEmployeeChange = (empId) => {
    const emp = employees.find((e) => e._id === empId);
    setFormData({
      ...formData,
      employee: empId,
      basicSalary: emp ? emp.salary : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/payroll', formData);
      setIsModalOpen(false);
      fetchPayroll();
    } catch (err) {
      setError(err.message || 'Payroll generation failed');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/payroll/${id}`, { paymentStatus: 'Paid' });
      fetchPayroll();
    } catch (err) {
      alert(err.message);
    }
  };

  const base = Number(formData.basicSalary) || 0;
  const allow = Number(formData.allowances) || 0;
  const bon = Number(formData.bonus) || 0;
  const ded = Number(formData.deductions) || 0;

  // Formulas
  const calculatedGross = base + allow + bon;
  const calculatedNet = Math.max(0, calculatedGross - ded);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Payroll & Compensation</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Formulas: <code>Gross = Basic + Allowances + Bonus</code> | <code>Net = Gross - Deductions</code>
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <DollarSign size={18} /> Generate Monthly Payslip
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Employee Name', 'Emp ID', 'Period', 'Basic Salary (₹)', 'Gross Salary (₹)', 'Net Salary (₹)', 'Status', 'Actions']}>
            {payroll.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 600 }}>{p.employee ? p.employee.name : 'Employee'}</td>
                <td style={{ fontWeight: 700, color: '#4f46e5' }}>{p.employee ? p.employee.employeeId : 'N/A'}</td>
                <td>
                  {p.month} {p.year}
                </td>
                <td>₹{Number(p.basicSalary).toLocaleString()}</td>
                <td>₹{Number(p.grossSalary).toLocaleString()}</td>
                <td style={{ fontWeight: 800, color: '#10b981' }}>₹{Number(p.netSalary).toLocaleString()}</td>
                <td>
                  <Badge status={p.paymentStatus}>{p.paymentStatus}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setViewingSlip(p)} className="btn btn-secondary btn-sm" title="View Payslip">
                      <FileSpreadsheet size={14} /> Slip
                    </button>
                    {p.paymentStatus !== 'Paid' && (
                      <button onClick={() => handleMarkPaid(p._id)} className="btn btn-primary btn-sm" title="Mark Paid">
                        <CheckCircle size={14} /> Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Generate Payroll Slip Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Monthly Employee Payslip">
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Employee</label>
            <select
              className="form-control"
              value={formData.employee}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              required
            >
              <option value="">Select Employee...</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.employeeId}) - Base: ₹{e.salary}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Pay Month</label>
              <select
                className="form-control"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                className="form-control"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Basic Salary (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Allowances (HRA/TA) (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Performance Bonus (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Deductions (Tax/PF) (₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', margin: '12px 0', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gross Salary (Basic + Allow + Bonus):</span>
              <strong>₹{calculatedGross.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontWeight: 800, color: '#10b981', fontSize: '15px' }}>
              <span>Net Take-Home Salary:</span>
              <span>₹{calculatedNet.toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Payslip Record
            </button>
          </div>
        </form>
      </Modal>

      {/* View Salary Slip Modal */}
      <Modal isOpen={!!viewingSlip} onClose={() => setViewingSlip(null)} title="Official Salary Slip View">
        {viewingSlip && (
          <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#4f46e5' }}>SecureERP SALARY SLIP</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Period: {viewingSlip.month} {viewingSlip.year}
              </p>
            </div>

            <div className="grid-cols-2" style={{ fontSize: '13px', marginBottom: '16px' }}>
              <div><strong>Employee:</strong> {viewingSlip.employee ? viewingSlip.employee.name : 'Employee'}</div>
              <div><strong>Employee ID:</strong> {viewingSlip.employee ? viewingSlip.employee.employeeId : 'N/A'}</div>
              <div><strong>Basic Salary:</strong> ₹{Number(viewingSlip.basicSalary).toLocaleString()}</div>
              <div><strong>Allowances:</strong> + ₹{Number(viewingSlip.allowances).toLocaleString()}</div>
              <div><strong>Bonus:</strong> + ₹{Number(viewingSlip.bonus).toLocaleString()}</div>
              <div><strong>Deductions:</strong> - ₹{Number(viewingSlip.deductions).toLocaleString()}</div>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px' }}>
              <span>NET SALARY PAID:</span>
              <span style={{ color: '#10b981' }}>₹{Number(viewingSlip.netSalary).toLocaleString()}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payroll;
