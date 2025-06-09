import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Products from './components/Products';
// import AdminAllOrders from './components/AdminAllOrders';
import Admins from './components/Admins';
import Adduser from './components/Adduser';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/products" element={<Products />} />
      {/* <Route path="/categories" element={<AdminAllOrders/>} /> */}
      <Route path="/admins" element={<Admins />} />
      <Route path="/Adduser" element={   <Adduser />} />
    </Routes>
  );
}
