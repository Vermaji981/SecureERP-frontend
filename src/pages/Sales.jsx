import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { ShoppingBag, Plus, Trash2, Eye, XCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // New Sale Form
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, sellingPrice: 0 }]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sales?page=${page}&limit=8`);
      if (res.success) {
        setSales(res.data);
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
      const [custRes, prodRes] = await Promise.all([api.get('/customers'), api.get('/products?limit=100')]);
      if (custRes.success) setCustomers(custRes.data);
      if (prodRes.success) setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [page]);

  const handleAddItem = () => {
    setItems([...items, { product: '', quantity: 1, sellingPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'product') {
      const selectedProd = products.find((p) => p._id === value);
      if (selectedProd) {
        newItems[index].sellingPrice = selectedProd.sellingPrice;
      }
    }

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.sellingPrice) || 0), 0);
  };

  const handleOpenAdd = () => {
    setSelectedCustomer(customers.length > 0 ? customers[0]._id : '');
    setItems([{ product: products.length > 0 ? products[0]._id : '', quantity: 1, sellingPrice: products.length > 0 ? products[0].sellingPrice : 0 }]);
    setTax(0);
    setDiscount(0);
    setPaymentMethod('cash');
    setPaymentStatus('paid');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-validation check for stock quantities
    for (const item of items) {
      const prod = products.find((p) => p._id === item.product);
      if (prod && Number(item.quantity) > prod.quantity) {
        setError(`Cannot process sale: Requested quantity (${item.quantity}) for '${prod.productName}' exceeds current stock (${prod.quantity}).`);
        return;
      }
    }

    try {
      await api.post('/sales', {
        customer: selectedCustomer,
        items,
        tax,
        discount,
        paymentMethod,
        paymentStatus
      });
      setIsModalOpen(false);
      fetchSales();
      fetchDependencies(); // refresh product stock
    } catch (err) {
      setError(err.message || 'Sales processing failed');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this sale? Inventory stock will be restored.')) {
      try {
        await api.put(`/sales/${id}/cancel`);
        fetchSales();
        fetchDependencies();
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Sales & Invoicing POS</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Process customer orders, verify available stock, and issue invoices.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <ShoppingBag size={18} /> Create New Sale
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['Invoice #', 'Customer', 'Items Count', 'Total (₹)', 'Payment Status', 'Actions']}>
            {sales.map((s) => (
              <tr key={s._id}>
                <td style={{ fontWeight: 700, color: '#4f46e5' }}>{s.invoiceNumber}</td>
                <td style={{ fontWeight: 600 }}>{s.customer ? s.customer.customerName : 'N/A'}</td>
                <td>{s.items ? s.items.length : 0} items</td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(s.totalAmount).toLocaleString()}</td>
                <td>
                  <Badge status={s.paymentStatus}>{s.paymentStatus}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setViewingSale(s)} className="btn btn-secondary btn-sm" title="View Sale">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => navigate('/invoices')} className="btn btn-secondary btn-sm" title="View Invoices">
                      <FileText size={14} /> Invoice
                    </button>
                    {s.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(s._id)} className="btn btn-danger btn-sm" title="Cancel Sale">
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

      {/* Create Sale Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Sales Order & Auto Generate Invoice">
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Customer</label>
            <select
              className="form-control"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="">Choose Customer...</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.customerName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Sales Line Items</label>
            {items.map((item, idx) => {
              const selectedProd = products.find((p) => p._id === item.product);
              const maxStock = selectedProd ? selectedProd.quantity : 0;

              return (
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
                      <option key={p._id} value={p._id} disabled={p.quantity <= 0}>
                        {p.productName} (Stock: {p.quantity}) - ₹{p.sellingPrice}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    className="form-control"
                    style={{ flex: 1 }}
                    placeholder="Qty"
                    min={1}
                    max={maxStock}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    required
                  />

                  <input
                    type="number"
                    className="form-control"
                    style={{ flex: 1 }}
                    placeholder="Price ₹"
                    value={item.sellingPrice}
                    onChange={(e) => handleItemChange(idx, 'sellingPrice', e.target.value)}
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
              );
            })}

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

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Payment Method</label>
              <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI / QR Code</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Status</label>
              <select className="form-control" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', margin: '12px 0', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span> <strong>₹{subtotal.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontWeight: 800, color: '#10b981' }}>
              <span>Grand Total:</span> <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm & Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* View Sale Details Modal */}
      <Modal isOpen={!!viewingSale} onClose={() => setViewingSale(null)} title="Sale Details & Items Breakdown">
        {viewingSale && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{viewingSale.invoiceNumber}</h3>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Customer: {viewingSale.customer ? viewingSale.customer.customerName : 'Walk-in'}</p>
              </div>
              <Badge status={viewingSale.paymentStatus}>{viewingSale.paymentStatus}</Badge>
            </div>

            <Table headers={['Product Item', 'Qty', 'Selling Price (₹)', 'Total (₹)']}>
              {(viewingSale.items || []).map((it, idx) => (
                <tr key={idx}>
                  <td>{it.product ? it.product.productName : 'Product'}</td>
                  <td>{it.quantity}</td>
                  <td>₹{Number(it.sellingPrice).toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(it.total).toLocaleString()}</td>
                </tr>
              ))}
            </Table>

            <div style={{ textAlign: 'right', marginTop: '16px', fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
              Grand Total: ₹{Number(viewingSale.totalAmount).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
