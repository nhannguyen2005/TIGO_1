import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import cấu hình phân hệ xác thực tài khoản dùng chung
import LoginRegister from './pages/LoginRegister'; 

// Import toàn bộ các trang thuộc phân hệ quản trị vận hành (Admin)
import AdminDashboard from './pages/AdminDashboard';
import AdminResidents from './pages/AdminResidents';
import AdminFeeCalculation from './pages/AdminFeeCalculation';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminDisputes from './pages/AdminDisputes';

// Import toàn bộ các trang thuộc phân hệ dành cho Cư dân (Resident)
import ResidentDashboard from './pages/ResidentDashboard';
import ResidentPayment from './pages/ResidentPayment';

// Hợp phần bảo vệ tuyến đường (Protected Route) để chặn truy cập trái phép khi chưa đăng nhập
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Nếu sai quyền hạn, đá người dùng về trang đăng nhập tương ứng hoặc mặc định
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Điều hướng mặc định ban đầu về trang đăng nhập hệ thống */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Tuyến đường xác thực tài khoản hệ thống công khai */}
        <Route path="/login" element={<LoginRegister />} />
        
        {/* PHÂN HỆ ROUTING DÀNH CHO CƯ DÂN (BẢO VỆ BẰNG TOKEN & ROLE) */}
        <Route path="/resident/dashboard" element={
          <ProtectedRoute allowedRole="RESIDENT">
            <ResidentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/resident/payment" element={
          <ProtectedRoute allowedRole="RESIDENT">
            <ResidentPayment />
          </ProtectedRoute>
        } />
        
        {/* PHÂN HỆ ROUTING QUẢN TRỊ BQL (BẢO VỆ BẰNG TOKEN & ROLE ADMIN) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/residents" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminResidents />
          </ProtectedRoute>
        } />
        <Route path="/admin/fee-calculation" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminFeeCalculation />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/disputes" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDisputes />
          </ProtectedRoute>
        } />
        
        {/* Bẫy lỗi bảo vệ (Catch-All Route) khi người dùng cố tình nhập sai URL */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 font-sans gap-2">
            <h1 className="text-xl font-bold text-slate-800">404 - Không tìm thấy trang</h1>
            <p className="text-sm">Đường dẫn bạn truy cập hiện tại không tồn tại trong hệ thống.</p>
            <a href="/login" className="mt-2 text-xs font-semibold text-blue-600 hover:underline">Quay lại trang chủ</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}