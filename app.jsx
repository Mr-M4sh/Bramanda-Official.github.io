import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Download } from 'lucide-react';

function App() {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    phone: '',
    productName: '',
    quantity: '',
    price: '',
    totalPrice: '',
    advancePayment: '',
    paymentMode: 'cash',
    date: new Date().toISOString().split('T')[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('vapeOrders');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('vapeOrders', JSON.stringify(orders));
  }, [orders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate total
      if ((name === 'quantity' || name === 'price') && newData.quantity && newData.price) {
        const total = (parseFloat(newData.quantity) * parseFloat(newData.price)).toFixed(2);
        newData.totalPrice = total;
      }
      
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phone || !formData.productName) {
      alert('Please fill required fields');
      return;
    }

    const totalPrice = parseFloat(formData.totalPrice) || 0;
    const advancePayment = parseFloat(formData.advancePayment) || 0;

    const orderData = {
      ...formData,
      totalPrice: totalPrice.toFixed(2),
      advancePayment: advancePayment.toFixed(2),
      remainingPayment: (totalPrice - advancePayment).toFixed(2),
      id: editingId || Date.now().toString()
    };

    if (editingId) {
      setOrders(prev => prev.map(order => order.id === editingId ? orderData : order));
      setEditingId(null);
    } else {
      setOrders(prev => [...prev, orderData]);
    }

    setFormData({
      customerName: '',
      address: '',
      phone: '',
      productName: '',
      quantity: '',
      price: '',
      totalPrice: '',
      advancePayment: '',
      paymentMode: 'cash',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (order) => {
    setFormData(order);
    setEditingId(order.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this order?')) {
      setOrders(prev => prev.filter(order => order.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      customerName: '',
      address: '',
      phone: '',
      productName: '',
      quantity: '',
      price: '',
      totalPrice: '',
      advancePayment: '',
      paymentMode: 'cash',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Filter and sort
  let filteredOrders = orders.filter(order => 
    !filterDate || order.date === filterDate
  );

  filteredOrders.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return new Date(b.date) - new Date(a.date);
      case 'date-asc': return new Date(a.date) - new Date(b.date);
      case 'amount-desc': return parseFloat(b.totalPrice) - parseFloat(a.totalPrice);
      case 'amount-asc': return parseFloat(a.totalPrice) - parseFloat(b.totalPrice);
      case 'name': return a.customerName.localeCompare(b.customerName);
      default: return 0;
    }
  });

  // Stats
  const totalAmount = filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
  const totalAdvance = filteredOrders.reduce((sum, order) => sum + parseFloat(order.advancePayment || 0), 0);
  const totalRemaining = filteredOrders.reduce((sum, order) => sum + parseFloat(order.remainingPayment || 0), 0);

  const downloadCSV = () => {
    const headers = ['Date', 'Customer', 'Phone', 'Product', 'Qty', 'Price', 'Total', 'Advance', 'Remaining', 'Payment'];
    const rows = orders.map(order => [
      order.date, order.customerName, order.phone, order.productName,
      order.quantity, order.price, order.totalPrice, 
      order.advancePayment, order.remainingPayment, order.paymentMode
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vape-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bramanda Vape Store</h1>
          <p className="text-purple-200">Order Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{editingId ? 'Edit Order' : 'New Order'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} 
              placeholder="Customer Name" className="border p-2 rounded" required />
            
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} 
              placeholder="Phone" className="border p-2 rounded" required />
            
            <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} 
              placeholder="Product" className="border p-2 rounded" required />
            
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} 
              placeholder="Quantity" className="border p-2 rounded" min="1" />
            
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} 
              placeholder="Price" className="border p-2 rounded" step="0.01" />
            
            <input type="number" name="totalPrice" value={formData.totalPrice} onChange={handleInputChange} 
              placeholder="Total" className="border p-2 rounded" step="0.01" readOnly />
            
            <input type="number" name="advancePayment" value={formData.advancePayment} onChange={handleInputChange} 
              placeholder="Advance" className="border p-2 rounded" step="0.01" />
            
            <select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className="border p-2 rounded">
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
            
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="border p-2 rounded" />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
              {editingId ? 'Update' : 'Add Order'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-purple-600">{filteredOrders.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-gray-600">Total Amount</p>
            <p className="text-xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-gray-600">Advance Paid</p>
            <p className="text-xl font-bold text-blue-600">₹{totalAdvance.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-gray-600">Remaining</p>
            <p className="text-xl font-bold text-orange-600">₹{totalRemaining.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} 
              className="border p-2 rounded" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border p-2 rounded">
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="name">By Name</option>
            </select>
            <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
              <Download size={18} /> Export CSV
            </button>
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-right">Advance</th>
                    <th className="p-3 text-center">Payment</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{order.date}</td>
                      <td className="p-3 font-semibold">{order.customerName}</td>
                      <td className="p-3">{order.productName}</td>
                      <td className="p-3 text-center">{order.quantity}</td>
                      <td className="p-3 text-right font-bold text-purple-600">₹{order.totalPrice}</td>
                      <td className="p-3 text-right text-green-600">₹{order.advancePayment}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-white text-sm ${
                          order.paymentMode === 'cash' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {order.paymentMode}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleEdit(order)} className="text-blue-600 hover:text-blue-800 mx-1">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800 mx-1">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No orders found. Add your first order above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
