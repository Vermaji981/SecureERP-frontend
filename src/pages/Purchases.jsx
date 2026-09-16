import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { ShoppingCart, Plus, Trash2, Eye, XCircle } from 'lucide-react';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [error, setError] = useState('');

  // New Purchase Form
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, purchasePrice: 0 }]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/purchases?page=${page}&limit=8`);
      if (res.success) {
        setPurchases(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([api.get('/suppliers'), api.get('/products?limit=100')]);
      if (supRes.success) setSuppliers(supRes.data);
      if (prodRes.success) setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [page]);

  const handleAddItem = () => {
    setItems([...items, { product: '', quantity: 1, purchasePrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto update purchase price when product is selected
    if (field === 'product') {
      const selectedProd = products.find((p) => p._id === value);
      if (selectedProd) {
        newItems[index].purchasePrice = selectedProd.purchasePrice;
      }
    }

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0), 0);
  };

  const handleOpenAdd = () => {
    setSelectedSupplier(suppliers.length > 0 ? suppliers[0]._id : '');
    setItems([{ product: products.length > 0 ? products[0]._id : '', quantity: 1, purchasePrice: products.length > 0 ? products[0].purchasePrice : 0 }]);
    setTax(0);
    setDiscount(0);
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/purchases', {
        supplier: selectedSupplier,
        items,
        tax,
        discount,
        notes
      });
      setIsModalOpen(false);
      fetchPurchases();
    } catch (err) {
      setError(err.message || 'Creation failed');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this purchase order? This will revert inventory quantities.')) {
      try {
        await api.put(`/purchases/${id}/cancel`);
        fetchPurchases();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const subtotal = calculateSubtotal();
  const grandTotal = subtotal + Number(tax) - Number(discount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Purchase Orders</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Create procurement orders and automatically increase stock levels.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <ShoppingCart size={18} /> Create Purchase Order
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['PO Number', 'Supplier', 'Items Count', 'Total Amount (₹)', 'Status', 'Actions']}>
            {purchases.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 700, color: '#4f46e5' }}>{p.purchaseNumber}</td>
                <td style={{ fontWeight: 600 }}>{p.supplier ? p.supplier.companyName : 'N/A'}</td>
                <td>{p.items ? p.items.length : 0} items</td>
                <td style={{ fontWeight: 700 }}>₹{Number(p.totalAmount).toLocaleString()}</td>
                <td>
                  <Badge status={p.status}>{p.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setViewingPurchase(p)} className="btn btn-secondary btn-sm" title="View Details">
                      <Eye size={14} />
                    </button>
                    {p.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(p._id)} className="btn btn-danger btn-sm" title="Cancel PO">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Create Purchase Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Purchase Order (Stock Inflow)">
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Supplier</label>
            <select
              className="form-control"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              required
            >
              <option value="">Select Supplier...</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.companyName} ({s.supplierName})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Purchased Line Items</label>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
                <select
                  className="form-control"
                  style={{ flex: 2 }}
                  value={item.product}
                  onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.productName} ({p.SKU})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  className="form-control"
                  style={{ flex: 1 }}
                  placeholder="Qty"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  required
                />

                <input
                  type="number"
                  className="form-control"
                  style={{ flex: 1 }}
                  placeholder="Price ₹"
                  value={item.purchasePrice}
                  onChange={(e) => handleItemChange(idx, 'purchasePrice', e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="btn btn-danger btn-sm"
                  disabled={items.length <= 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Tax Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Discount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', margin: '12px 0', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span> <strong>₹{subtotal.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontWeight: 800, color: '#4f46e5' }}>
              <span>Grand Total:</span> <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Complete Purchase Order
            </button>
          </div>
        </form>
      </Modal>

      {/* View Purchase Order Details Modal */}
      <Modal isOpen={!!viewingPurchase} onClose={() => setViewingPurchase(null)} title="Purchase Order Details">
        {viewingPurchase && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#4f46e5' }}>{viewingPurchase.purchaseNumber}</h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Supplier: {viewingPurchase.supplier ? viewingPurchase.supplier.companyName : 'N/A'}</p>
              </div>
              <Badge status={viewingPurchase.status}>{viewingPurchase.status}</Badge>
            </div>

            <Table headers={['Product', 'Qty', 'Unit Price (₹)', 'Total (₹)']}>
              {(viewingPurchase.items || []).map((it, idx) => (
                <tr key={idx}>
                  <td>{it.product ? it.product.productName : 'Product'}</td>
                  <td>{it.quantity}</td>
                  <td>₹{Number(it.purchasePrice).toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(it.total).toLocaleString()}</td>
                </tr>
              ))}
            </Table>

            <div style={{ textAlign: 'right', marginTop: '16px', fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
              Grand Total: ₹{Number(viewingPurchase.totalAmount).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Purchases;
