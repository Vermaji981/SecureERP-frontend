import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import Loader from '../components/Loader';
import Table from '../components/Table';
import Badge from '../components/Badge';
import api from '../services/api';
import {
  Users,
  Package,
  UserCheck,
  Truck,
  ShoppingBag,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CalendarDays,
  ArrowUpRight,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
        Failed to load dashboard data: {error}
      </div>
    );
  }

  const { cards = {}, lowStockProducts = [], recentLeaveRequests = [], recentSales = [], recentPurchases = [], chartData = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Executive ERP Dashboard</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Real-time enterprise metrics, inventory status, and financial overview.
        </p>
      </div>

      {/* Primary Summary Metrics Grid */}
      <div className="grid-cols-4">
        <StatsCard title="Total Employees" value={cards.totalEmployees || 0} icon={Users} color="blue" />
        <StatsCard title="Total Products" value={cards.totalProducts || 0} icon={Package} color="cyan" />
        <StatsCard title="Total Customers" value={cards.totalCustomers || 0} icon={UserCheck} color="green" />
        <StatsCard title="Total Suppliers" value={cards.totalSuppliers || 0} icon={Truck} color="yellow" />
      </div>

      <div className="grid-cols-4">
        <StatsCard title="Gross Revenue" value={`₹${Number(cards.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="green" />
        <StatsCard title="Total Expenses" value={`₹${Number(cards.totalExpenses || 0).toLocaleString()}`} icon={TrendingUp} color="red" />
        <StatsCard title="Low Stock Items" value={cards.lowStockCount || 0} icon={AlertTriangle} color="yellow" subtext="Action required" />
        <StatsCard title="Pending Leaves" value={cards.pendingLeavesCount || 0} icon={CalendarDays} color="blue" subtext="Awaiting review" />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="#4f46e5" /> Revenue & Financial Growth
            </span>
          </div>
          <div style={{ width: '100%', height: 300, marginTop: '16px' }}>
            <ResponsiveContainer>
              <AreaChart data={chartData.length > 0 ? chartData : [{ month: 'Current', revenue: cards.totalRevenue || 0 }]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} color="#10b981" /> Monthly Orders Volume
            </span>
          </div>
          <div style={{ width: '100%', height: 300, marginTop: '16px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData.length > 0 ? chartData : [{ month: 'Current', sales: cards.totalSalesCount || 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts & Pending Leaves */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-title" style={{ color: '#b45309' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#f59e0b" /> Low Stock Inventory Alerts
            </span>
          </div>
          <Table headers={['Product Name', 'SKU', 'Current Qty', 'Min Qty']}>
            {lowStockProducts.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 600 }}>{p.productName}</td>
                <td>{p.SKU}</td>
                <td style={{ fontWeight: 800, color: '#ef4444' }}>{p.quantity}</td>
                <td>{p.minimumStock}</td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} color="#4f46e5" /> Pending Leave Requests
            </span>
          </div>
          <Table headers={['Employee', 'Department', 'Reason', 'Status']}>
            {recentLeaveRequests.map((l) => (
              <tr key={l._id}>
                <td style={{ fontWeight: 600 }}>{l.employee ? l.employee.name : 'Employee'}</td>
                <td>{l.employee && l.employee.department ? l.employee.department.name : 'General'}</td>
                <td style={{ fontSize: '12px' }}>{l.reason}</td>
                <td>
                  <Badge status={l.status}>{l.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-title">Recent Sales Orders</div>
          <Table headers={['Invoice #', 'Customer', 'Amount', 'Payment']}>
            {recentSales.map((s) => (
              <tr key={s._id}>
                <td style={{ fontWeight: 700, color: '#4f46e5' }}>{s.invoiceNumber}</td>
                <td>{s.customer ? s.customer.customerName : 'Walk-in'}</td>
                <td style={{ fontWeight: 700 }}>₹{Number(s.totalAmount).toLocaleString()}</td>
                <td>
                  <Badge status={s.paymentStatus}>{s.paymentStatus}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="card">
          <div className="card-title">Recent Purchase Orders</div>
          <Table headers={['PO #', 'Supplier', 'Amount', 'Status']}>
            {recentPurchases.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 700, color: '#06b6d4' }}>{p.purchaseNumber}</td>
                <td>{p.supplier ? p.supplier.companyName : 'Supplier'}</td>
                <td style={{ fontWeight: 700 }}>₹{Number(p.totalAmount).toLocaleString()}</td>
                <td>
                  <Badge status={p.status}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
