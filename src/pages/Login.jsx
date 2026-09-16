import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('hv0563163@gmail.com');
  const [password, setPassword] = useState('Happy@2003');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-logo">
            <ShieldCheck size={24} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>SecureERP</span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', marginBottom: '8px', color: '#1e293b' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>
          Enter your corporate credentials to access the ERP suite.
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: 500
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* One-Click Quick Demo Login Toggles */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
            Quick Demo Role Login:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            <button type="button" onClick={() => handleQuickLogin('hv0563163@gmail.com', 'Happy@2003')} className="btn btn-secondary btn-sm">
              Admin
            </button>
            <button type="button" onClick={() => handleQuickLogin('manager@secureerp.com', 'Manager@12345')} className="btn btn-secondary btn-sm">
              Manager
            </button>
            <button type="button" onClick={() => handleQuickLogin('hr@secureerp.com', 'Hr@123456789')} className="btn btn-secondary btn-sm">
              HR
            </button>
            <button type="button" onClick={() => handleQuickLogin('accountant@secureerp.com', 'Accountant@123')} className="btn btn-secondary btn-sm">
              Accountant
            </button>
            <button type="button" onClick={() => handleQuickLogin('employee@secureerp.com', 'Employee@123')} className="btn btn-secondary btn-sm">
              Employee
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
