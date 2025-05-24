import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="min-h-screen flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Admin Panel</h2>
          <ul className="space-y-3 text-gray-700">
            <li>
              <Link to="/users" className="block hover:bg-blue-100 px-4 py-2 rounded-md">👤 Users</Link>
            </li>
            <li>
              <Link to="/products" className="block hover:bg-blue-100 px-4 py-2 rounded-md">📦 Products</Link>
            </li>
            <li>
              <Link to="/categories" className="block hover:bg-blue-100 px-4 py-2 rounded-md">📂 Categories</Link>
            </li>
            <li>
              <Link to="/admins" className="block hover:bg-blue-100 px-4 py-2 rounded-md">🛡️ Admins</Link>
            </li>
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} My Dashboard
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-blue-500">Total Users</h2>
            <p className="text-3xl font-bold mt-2">1,245</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-green-500">Products</h2>
            <p className="text-3xl font-bold mt-2">480</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-yellow-500">Categories</h2>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
