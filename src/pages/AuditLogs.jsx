import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import api from '../services/api';
import { ShieldAlert, Search, Filter } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = `/audit-logs?page=${page}&limit=12`;
      if (search) query += `&search=${search}`;
      if (moduleFilter) query += `&module=${moduleFilter}`;

      const res = await api.get(query);
      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, search, moduleFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Security Audit Trail Logs</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Immutable activity logging of user CRUD operations, login events, and administrative actions.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="navbar-search" style={{ width: '280px' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search action, description, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '180px' }}
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="">All Modules</option>
          <option value="AUTH">Auth / User</option>
          <option value="EMPLOYEE">Employee</option>
          <option value="DEPARTMENT">Department</option>
          <option value="PRODUCT">Product</option>
          <option value="INVENTORY">Inventory</option>
          <option value="SUPPLIER">Supplier</option>
          <option value="CUSTOMER">Customer</option>
          <option value="PURCHASE">Purchase</option>
          <option value="SALE">Sale</option>
          <option value="LEAVE">Leave</option>
          <option value="EXPENSE">Expense</option>
          <option value="PAYROLL">Payroll</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['User Email', 'Role', 'Action', 'Module', 'Description Log', 'Timestamp']}>
            {logs.map((log) => (
              <tr key={log._id}>
                <td style={{ fontWeight: 600 }}>{log.userEmail}</td>
                <td style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: '#4f46e5' }}>{log.userRole}</td>
                <td style={{ fontWeight: 700, fontSize: '12px' }}>{log.action}</td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', fontSize: '11px', fontWeight: 700 }}>
                    {log.module}
                  </span>
                </td>
                <td style={{ fontSize: '13px' }}>{log.description}</td>
                <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </Table>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
