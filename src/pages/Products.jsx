import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import api from '../services/api';
import { Plus, Search, Filter, Edit, Trash2, PackagePlus, AlertTriangle } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    productName: '',
    SKU: '',
    category: '',
    description: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    minimumStock: '5',
    supplier: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `/products?page=${page}&limit=8`;
      if (search) query += `&search=${search}`;
      if (categoryFilter) query += `&category=${categoryFilter}`;
      if (lowStockFilter) query += `&lowStock=true`;

      const res = await api.get(query);
      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, lowStockFilter]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      productName: '',
      SKU: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Electronics',
      description: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '10',
      minimumStock: '5',
      supplier: suppliers.length > 0 ? suppliers[0]._id : ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      productName: p.productName,
      SKU: p.SKU,
      category: p.category,
      description: p.description || '',
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      minimumStock: p.minimumStock,
      supplier: p.supplier ? p.supplier._id || p.supplier : ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Product Catalog</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage SKU inventory items, purchase/selling pricing, and stock limits.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <PackagePlus size={18} /> Add Product
        </button>
      </div>

      <div className="card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="navbar-search" style={{ width: '280px' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by product name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '180px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="Raw Materials">Raw Materials</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
          />
          <AlertTriangle size={16} color="#f59e0b" /> Show Low Stock Only
        </label>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <Table headers={['SKU', 'Product Name', 'Category', 'Purchase (₹)', 'Selling (₹)', 'Stock Qty', 'Status', 'Actions']}>
            {products.map((p) => {
              const isLow = p.quantity <= p.minimumStock;
              return (
                <tr key={p._id} style={{ backgroundColor: isLow ? '#fffbeb' : 'inherit' }}>
                  <td style={{ fontWeight: 700, color: '#4f46e5' }}>{p.SKU}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.productName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Supplier: {p.supplier ? p.supplier.companyName : 'N/A'}
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>₹{Number(p.purchasePrice).toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(p.sellingPrice).toLocaleString()}</td>
                  <td>
                    <span style={{ fontWeight: 800, color: isLow ? '#ef4444' : '#0f172a' }}>
                      {p.quantity} {isLow && <span style={{ fontSize: '11px', color: '#dc2626' }}>(Low)</span>}
                    </span>
                  </td>
                  <td>
                    <Badge status={p.status}>{p.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary btn-sm">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label>SKU Code</label>
              <input
                type="text"
                className="form-control"
                value={formData.SKU}
                onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                className="form-control"
                placeholder="Electronics, Furniture..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <select
                className="form-control"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.companyName} ({s.supplierName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Purchase Price (Cost Price ₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Selling Price (Selling Price ₹)</label>
              <input
                type="number"
                className="form-control"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Initial Stock Quantity</label>
              <input
                type="number"
                className="form-control"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Minimum Stock Threshold</label>
              <input
                type="number"
                className="form-control"
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Product Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
