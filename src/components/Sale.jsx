import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Sale = () => {
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/sale-products`);
      const data = await res.json();
      setSaleProducts(data);
    } catch (err) {
      console.error('Error fetching sale products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleremoveToSale = async (productId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/remove-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: productId }),
      });
      const data = await res.json();
      console.log('Product removed from sale:', data);
      // Update local state by filtering out the removed product
      setSaleProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="px-5 py-9 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-red-600 mt-12">🔥 Sale Collection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {saleProducts.map((product) => (
          <div
            key={product._id}
            className="w-full bg-white shadow-lg rounded-lg p-4 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Link
              to={`/product/${product._id}`}
              className="w-full text-center"
              aria-label={`Navigate to ${product.name}`}
            >
              <img
                src={
                  product.photos?.[0]
                    ? product.photos[0].startsWith('http')
                      ? product.photos[0]
                      : `${API_BASE_URL}/${product.photos[0].replace(/^\/+/, '')}`
                    : '/images/fallback-image.jpg'
                }
                alt={product.name}
                className="w-full h-40 object-cover rounded-md mb-4"
                loading="lazy"
              />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-500">{product.category}</p>
              <p className="text-green-600 font-bold mt-1">
                Sale price ₹{(product.price * 0.7).toFixed(2)}
              </p>
              <span className="inline-block mt-2 text-sm px-2 py-1 bg-red-100 text-red-600 rounded-full">
                On Sale
              </span>
            </Link>
            <button
              onClick={() => handleremoveToSale(product._id)}
              className="mt-4 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-all"
            >
              Remove from Sale
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sale;
