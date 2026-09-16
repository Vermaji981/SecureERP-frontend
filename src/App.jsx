import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Invoices from './pages/Invoices';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Expenses from './pages/Expenses';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Authenticated Protected Shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'employee']} />}>
                <Route path="/" element={<Dashboard />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'hr']} />}>
                <Route path="/employees" element={<Employees />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'hr']} />}>
                <Route path="/departments" element={<Departments />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/products" element={<Products />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/customers" element={<Customers />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'accountant']} />}>
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/invoices" element={<Invoices />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'hr', 'employee', 'manager']} />}>
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leaves" element={<Leaves />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'accountant']} />}>
                <Route path="/expenses" element={<Expenses />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'hr']} />}>
                <Route path="/payroll" element={<Payroll />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'accountant']} />}>
                <Route path="/reports" element={<Reports />} />
              </Route>

              <Route path="/notifications" element={<Notifications />} />

              <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
