import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { Bell, CheckCircle2, AlertTriangle, Info, CheckCheck } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>System Notifications Center</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Low stock alerts, leave workflow requests, and purchase/sales activities.</p>
        </div>
        <button onClick={handleMarkAllRead} className="btn btn-secondary">
          <CheckCheck size={18} /> Mark All as Read
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Type', 'Title', 'Message Alert', 'Timestamp', 'Status']}>
            {notifications.map((n) => (
              <tr key={n._id} style={{ backgroundColor: n.isRead ? '#ffffff' : '#f0fdf4' }}>
                <td>
                  <Badge status={n.type}>{n.type}</Badge>
                </td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{n.title}</td>
                <td>{n.message}</td>
                <td style={{ fontSize: '12px', color: '#64748b' }}>{new Date(n.createdAt).toLocaleString()}</td>
                <td>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: n.isRead ? '#94a3b8' : '#10b981' }}>
                    {n.isRead ? 'Read' : 'Unread'}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
};

export default Notifications;
