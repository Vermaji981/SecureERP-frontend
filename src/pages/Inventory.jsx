import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { Boxes, AlertTriangle, XCircle, DollarSign, SlidersHorizontal } from 'lucide-react';

const Inventory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Manual Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdjust = (prodId = '', currentQty = 0) => {
    setSelectedProduct(prodId);
    setNewQuantity(currentQty);
    setReason('');
    setError('');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/inventory/adjust', {
        productId: selectedProduct,
        newQuantity,
        reason
      });
      setIsAdjustModalOpen(false);
      fetchInventory();
    } catch (err) {
      setError(err.message || 'Adjustment failed');
    }
  };

  if (loading) return <Loader />;

  const { summary = {}, lowStockItems = [], outOfStockItems = [], allProducts = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Inventory Tracking & Audit</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Formula: <code>Current Stock = Opening Stock + Purchases - Sales</code>
          </p>
        </div>
        <button onClick={() => handleOpenAdjust()} className="btn btn-primary">
          <SlidersHorizontal size={18} /> Manual Stock Adjustment
        </button>
      </div>

      {/* Inventory KPI Summary */}
      <div className="grid-cols-4">
        <StatsCard title="Total Stock Units" value={summary.totalStockItems || 0} icon={Boxes} color="blue" />
        <StatsCard title="Total Inventory Value" value={`₹${Number(summary.totalStockValue || 0).toLocaleString()}`} icon={DollarSign} color="green" />
        <StatsCard title="Low Stock Items" value={summary.lowStockCount || 0} icon={AlertTriangle} color="yellow" />
        <StatsCard title="Out of Stock Items" value={summary.outOfStockCount || 0} icon={XCircle} color="red" />
      </div>

      {/* Inventory Full Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
          Live Stock Status Sheet
        </div>
        <Table headers={['SKU', 'Product Name', 'Supplier', 'Cost Price', 'Current Stock', 'Status', 'Actions']}>
          {allProducts.map((p) => {
            const isOutOfStock = p.quantity === 0;
            const isLowStock = p.quantity <= p.minimumStock && !isOutOfStock;

            return (
              <tr key={p._id}>
                <td style={{ fontWeight: 700, color: '#4f46e5' }}>{p.SKU}</td>
                <td style={{ fontWeight: 600 }}>{p.productName}</td>
                <td>{p.supplier ? p.supplier.companyName : 'N/A'}</td>
                <td>₹{Number(p.purchasePrice).toLocaleString()}</td>
                <td style={{ fontWeight: 800, color: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#0f172a' }}>
                  {p.quantity} {isOutOfStock ? '(Out of Stock)' : isLowStock ? '(Low Stock)' : ''}
                </td>
                <td>
                  <Badge status={isOutOfStock ? 'out_of_stock' : isLowStock ? 'warning' : 'active'}>
                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                  </Badge>
                </td>
                <td>
                  <button onClick={() => handleOpenAdjust(p._id, p.quantity)} className="btn btn-secondary btn-sm">
                    Adjust Stock
                  </button>
                </td>
              </tr>
            );
          })}
        </Table>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Manual Inventory Stock Adjustment">
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleAdjustSubmit}>
          <div className="form-group">
            <label>Select Product</label>
            <select
              className="form-control"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
            >
              <option value="">Choose item...</option>
              {allProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} ({p.SKU}) - Current: {p.quantity}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>New Verified Stock Quantity</label>
            <input
              type="number"
              className="form-control"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Reason for Adjustment</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Physical count reconciliation, damaged goods write-off..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
