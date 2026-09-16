import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtext }) => {
  return (
    <div className="card">
      <div className="stat-card">
        <div className={`stat-icon ${color}`}>
          {Icon && <Icon size={24} />}
        </div>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{title}</div>
          {subtext && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{subtext}</div>}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
