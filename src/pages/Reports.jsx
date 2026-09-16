import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import Table from '../components/Table';
import Loader from '../components/Loader';
import api from '../services/api';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, ShoppingBag, Filter } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = '/reports/detailed';
      if (startDate && endDate) {
        query += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(query);
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  if (loading) return <Loader />;

  const { summary = {}, salesList = [], purchasesList = [], expensesList = [] } = reports || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Financial & Operational Reports</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Comprehensive P&L analysis, sales metrics, and expenditure ledgers.</p>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <form className="card" onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label>End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          <Filter size={16} /> Filter Date Range
        </button>
      </form>

      {/* Financial P&L KPI Cards */}
      <div className="grid-cols-4">
        <StatsCard title="Total Revenue (Sales)" value={`₹${Number(summary.totalSalesRev || 0).toLocaleString()}`} icon={ShoppingBag} color="green" />
        <StatsCard title="Purchases Cost" value={`₹${Number(summary.totalPurchasesCost || 0).toLocaleString()}`} icon={ShoppingCart} color="cyan" />
        <StatsCard title="General Expenses" value={`₹${Number(summary.totalExpensesCost || 0).toLocaleString()}`} icon={TrendingUp} color="yellow" />
        <StatsCard title="Net Profit / Loss" value={`₹${Number(summary.netProfit || 0).toLocaleString()}`} icon={DollarSign} color={summary.netProfit >= 0 ? 'green' : 'red'} />
      </div>

      {/* Detailed Sales Ledger */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
          Sales Revenue Ledger
        </div>
        <Table headers={['Invoice #', 'Customer', 'Date', 'Revenue Amount (₹)']}>
          {salesList.map((s) => (
            <tr key={s._id}>
              <td style={{ fontWeight: 700, color: '#4f46e5' }}>{s.invoiceNumber}</td>
              <td>{s.customer ? s.customer.customerName : 'Customer'}</td>
              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
              <td style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(s.totalAmount).toLocaleString()}</td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Detailed Expenses & Purchases Ledger */}
      <div className="grid-cols-2">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
            Procurement Expenses (Purchases)
          </div>
          <Table headers={['PO #', 'Supplier', 'Cost (₹)']}>
            {purchasesList.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 700 }}>{p.purchaseNumber}</td>
                <td>{p.supplier ? p.supplier.companyName : 'Supplier'}</td>
                <td style={{ fontWeight: 700, color: '#ef4444' }}>₹{Number(p.totalAmount).toLocaleString()}</td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
            Operational Expenses Ledger
          </div>
          <Table headers={['Expense', 'Category', 'Amount (₹)']}>
            {expensesList.map((e) => (
              <tr key={e._id}>
                <td style={{ fontWeight: 600 }}>{e.title}</td>
                <td>{e.category}</td>
                <td style={{ fontWeight: 700, color: '#ef4444' }}>₹{Number(e.amount).toLocaleString()}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
