import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AdminAllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/orders/admin/orders`);
        setOrders(res.data.orders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading orders...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No orders found.</p>;
  }

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">All Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-6 text-left">Product</th>
              <th className="py-3 px-6 text-left">Quantity</th>
              <th className="py-3 px-6 text-left">Total</th>
              <th className="py-3 px-6 text-left">Customer</th>
              <th className="py-3 px-6 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        order.product.photos?.[0]?.startsWith('http')
                          ? order.product.photos[0]
                          : `${API_BASE_URL}/${order.product.photos?.[0]?.replace(/^\/+/, '')}`
                      }
                      alt={order.product.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/images/fallback-image.jpg';
                      }}
                    />
                    <div>
                      <p className="font-semibold">{order.product.name}</p>
                      <p className="text-sm text-gray-500">{order.product.category}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-6">{order.quantity}</td>
                <td className="py-3 px-6">${order.total.toFixed(2)}</td>
                <td className="py-3 px-6">
                  <p className="font-medium">{order.deliveryDetails.name}</p>
                  <p className="text-sm text-gray-500">{order.deliveryDetails.email}</p>
                </td>
                <td className="py-3 px-6">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAllOrders;
