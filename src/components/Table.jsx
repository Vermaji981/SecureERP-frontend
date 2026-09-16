import React from 'react';

const Table = ({ headers = [], children, emptyMessage = 'No records found' }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {React.Children.count(children) === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
