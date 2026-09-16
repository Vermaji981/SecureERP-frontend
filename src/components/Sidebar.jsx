import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Boxes,
  Truck,
  UserCheck,
  ShoppingBag,
  ShoppingCart,
  FileText,
  CalendarCheck,
  CalendarDays,
  Receipt,
  DollarSign,
  BarChart3,
  ShieldAlert,
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  // Role permissions routing map
  const canSeeDashboard = hasRole(['admin', 'manager', 'employee']);
  const canSeeEmployees = hasRole(['admin', 'manager', 'hr']);
  const canSeeDepartments = hasRole(['admin', 'hr']);
  const canSeeProducts = hasRole(['admin', 'manager']);
  const canSeeInventory = hasRole(['admin', 'manager']);
  const canSeeSuppliers = hasRole(['admin', 'manager']);
  const canSeeCustomers = hasRole(['admin', 'manager']);
  const canSeePurchases = hasRole(['admin', 'manager', 'accountant']);
  const canSeeSales = hasRole(['admin', 'manager', 'accountant']);
  const canSeeInvoices = hasRole(['admin', 'manager', 'accountant']);
  const canSeeAttendance = hasRole(['admin', 'hr', 'employee']);
  const canSeeLeaves = hasRole(['admin', 'manager', 'hr', 'employee']);
  const canSeeExpenses = hasRole(['admin', 'accountant']);
  const canSeePayroll = hasRole(['admin', 'accountant', 'hr']);
  const canSeeReports = hasRole(['admin', 'manager', 'accountant']);
  const canSeeAuditLogs = hasRole(['admin']);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <ShieldCheck size={24} />
        </div>
        <div>
          <div className="brand-title">SecureERP</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.5px' }}>ENTERPRISE SUITE</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">CORE NAVIGATION</div>

        {canSeeDashboard && (
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        )}

        {(canSeeEmployees || canSeeDepartments) && (
          <>
            <div className="nav-section-title">HUMAN RESOURCES</div>
            {canSeeEmployees && (
              <NavLink to="/employees" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <Users size={18} />
                <span>Employees</span>
              </NavLink>
            )}
            {canSeeDepartments && (
              <NavLink to="/departments" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <Building2 size={18} />
                <span>Departments</span>
              </NavLink>
            )}
            {canSeeAttendance && (
              <NavLink to="/attendance" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <CalendarCheck size={18} />
                <span>Attendance</span>
              </NavLink>
            )}
            {canSeeLeaves && (
              <NavLink to="/leaves" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <CalendarDays size={18} />
                <span>Leave Requests</span>
              </NavLink>
            )}
          </>
        )}

        {(canSeeProducts || canSeeInventory || canSeeSuppliers || canSeeCustomers) && (
          <>
            <div className="nav-section-title">INVENTORY & CRM</div>
            {canSeeProducts && (
              <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <Package size={18} />
                <span>Products</span>
              </NavLink>
            )}
            {canSeeInventory && (
              <NavLink to="/inventory" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <Boxes size={18} />
                <span>Inventory Tracking</span>
              </NavLink>
            )}
            {canSeeSuppliers && (
              <NavLink to="/suppliers" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <Truck size={18} />
                <span>Suppliers</span>
              </NavLink>
            )}
            {canSeeCustomers && (
              <NavLink to="/customers" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <UserCheck size={18} />
                <span>Customers</span>
              </NavLink>
            )}
          </>
        )}

        {(canSeePurchases || canSeeSales || canSeeInvoices || canSeeExpenses || canSeePayroll) && (
          <>
            <div className="nav-section-title">FINANCE & SALES</div>
            {canSeePurchases && (
              <NavLink to="/purchases" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <ShoppingCart size={18} />
                <span>Purchase Orders</span>
              </NavLink>
            )}
            {canSeeSales && (
              <NavLink to="/sales" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <ShoppingBag size={18} />
                <span>Sales Orders</span>
              </NavLink>
            )}
            {canSeeInvoices && (
              <NavLink to="/invoices" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <FileText size={18} />
                <span>Invoices</span>
              </NavLink>
            )}
            {canSeeExpenses && (
              <NavLink to="/expenses" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <Receipt size={18} />
                <span>Expenses</span>
              </NavLink>
            )}
            {canSeePayroll && (
              <NavLink to="/payroll" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <DollarSign size={18} />
                <span>Payroll</span>
              </NavLink>
            )}
          </>
        )}

        {(canSeeReports || canSeeAuditLogs) && (
          <>
            <div className="nav-section-title">ANALYTICS & SECURITY</div>
            {canSeeReports && (
              <NavLink to="/reports" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <BarChart3 size={18} />
                <span>Reports</span>
              </NavLink>
            )}
            {canSeeAuditLogs && (
              <NavLink to="/audit-logs" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                <ShieldAlert size={18} />
                <span>Audit Logs</span>
              </NavLink>
            )}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="btn-logout">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
