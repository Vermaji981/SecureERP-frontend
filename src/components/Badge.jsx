import React from 'react';

const Badge = ({ children, status }) => {
  let badgeClass = 'badge-secondary';

  const s = String(status || children || '').toLowerCase();

  if (['active', 'completed', 'paid', 'approved', 'present'].includes(s)) {
    badgeClass = 'badge-success';
  } else if (['pending', 'half day', 'partial', 'on_leave', 'warning'].includes(s)) {
    badgeClass = 'badge-warning';
  } else if (['inactive', 'cancelled', 'rejected', 'absent', 'unpaid', 'out_of_stock', 'terminated'].includes(s)) {
    badgeClass = 'badge-danger';
  } else if (['processing', 'info'].includes(s)) {
    badgeClass = 'badge-info';
  }

  return <span className={`badge ${badgeClass}`}>{children || status}</span>;
};

export default Badge;
