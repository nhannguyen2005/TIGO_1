import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Lock, User, Home, Phone, Eye, EyeOff, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

// Cấu hình URL Backend - Thay đổi port 5000 nếu backend của bạn Tâm chạy port khác
const API_BASE_URL = 'http://localhost:5000/api/auth';

export default function LoginRegister() {
  const navigate = useNavigate(); 

  // Quản lý trạng thái tab: 'login' (Đăng nhập) hoặc 'register' (Đăng ký)
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  // Khởi tạo State cho Form dữ liệu thật
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    phone: '',
    username: '',
    apartmentNumber: '',
    password: '',
    confirmPassword: ''
  });

  // State quản lý lỗi hiển thị UI và trạng thái loading khi gọi API
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiAlert, setApiAlert] = useState(null); // { type: 'success' | 'error', message: '' }

  // Xử lý thay đổi dữ liệu form Đăng nhập
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Xử lý thay đổi dữ liệu form Đăng ký
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validate phía Client cho Đăng nhập
  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.username.trim()) newErrors.username = 'Tên tài khoản không được để trống';
    if (!loginData.password) newErrors.password = 'Mật khẩu không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate phía Client cho Đăng ký
  const validateRegister = () => {
    const newErrors = {};
    const phoneRegex = /^(0[3|5|7|8|9])+([0-8]{8})\b$/;

    if (!registerData.fullName.trim()) newErrors.fullName = 'Họ và tên không được để trống';
    if (!registerData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!phoneRegex.test(registerData.phone)) {
      newErrors.phone = 'Số điện thoại không đúng định dạng';
    }
    if (!registerData.username.trim()) newErrors.username = 'Tên tài khoản không được để trống';
    if (!registerData.apartmentNumber.trim()) newErrors.apartmentNumber = 'Vui lòng nhập số căn hộ';
    if (!registerData.password) {
      newErrors.password = 'Mật khẩu bắt buộc phải nhập';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa tối thiểu 6 ký tự';
    }
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // XỬ LÝ GỌI API ĐĂNG NHẬP THẬT (KẾT NỐI DATABASE QUA BACKEND)
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    setApiAlert(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }

      // Lưu trữ Token xác thực và quyền truy cập vào bộ nhớ trình duyệt
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      setApiAlert({ type: 'success', message: 'Xác thực thành công! Đang chuyển hướng...' });

      // Chuyển hướng phân quyền màn hình theo thiết kế hệ thống dựa vào dữ liệu DB trả về
      setTimeout(() => {
        if (data.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/resident/dashboard');
        }
      }, 800);

    } catch (err) {
      setApiAlert({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // XỬ LÝ GỌI API ĐĂNG KÝ THẬT (GHI DỮ LIỆU XUỐNG DATABASE)
  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    setApiAlert(null);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: registerData.fullName,
          phone: registerData.phone,
          username: registerData.username,
          apartmentNumber: registerData.apartmentNumber,
          password: registerData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký tài khoản thất bại.');
      }

      setApiAlert({
        type: 'success',
        message: `Đăng ký thành công căn hộ ${registerData.apartmentNumber}! Vui lòng chuyển sang Đăng nhập.`
      });

      // Reset toàn bộ input đăng ký sau khi ghi dữ liệu thành công
      setRegisterData({ fullName: '', phone: '', username: '', apartmentNumber: '', password: '', confirmPassword: '' });
      setActiveTab('login');

    } catch (err) {
      setApiAlert({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased font-sans">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden grid md:grid-cols-2">
        
        {/* Banner đồ họa bên trái giữ nguyên cấu trúc thiết kế UI mới */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 text-white flex flex-col justify-between hidden md:flex relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">SmartFee</span>
          </div>
          <div className="space-y-4 my-auto relative z-10">
            <h1 className="text-3xl font-black tracking-tight leading-tight">Hệ Thống Quản Lý <br />Chi Phí Cư Dân Thông Minh</h1>
            <p className="text-blue-100 text-sm leading-relaxed max-w-sm font-medium">Số hóa quy trình tính toán hóa đơn, thanh toán trực tuyến tiện lợi và xử lý phản ánh minh bạch cho tòa nhà của bạn.</p>
          </div>
          <div className="text-xs text-blue-200/80 font-semibold relative z-10">© 2026 SmartFee Platform. All rights reserved.</div>
        </div>

        {/* Khung Xử lý Biểu mẫu Form bên phải */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex border-b border-slate-200 mb-8 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => { setActiveTab('login'); setApiAlert(null); setErrors({}); }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => { setActiveTab('register'); setApiAlert(null); setErrors({}); }}
            >
              Đăng ký cư dân
            </button>
          </div>

          {/* Banner Thông báo API trạng thái */}
          {apiAlert && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-fadeIn ${apiAlert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {apiAlert.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              <p className="text-sm font-medium">{apiAlert.message}</p>
            </div>
          )}

          {/* HIỂN THỊ TABS ĐĂNG NHẬP */}
          {activeTab === 'login' ? (
            <form onSubmit={handleSubmitLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Tên tài khoản</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-800 text-sm transition-all ${errors.username ? 'border-rose-300 focus:border-rose-500 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} outline-none`}
                    placeholder="Nhập tài khoản đăng nhập"
                  />
                </div>
                {errors.username && <p className="text-xs text-rose-600 font-medium">{errors.username}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Mật khẩu hệ thống</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-slate-800 text-sm transition-all ${errors.password ? 'border-rose-300 focus:border-rose-500 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} outline-none`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-600 font-medium">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Xác thực tài khoản'}
              </button>
            </form>
          ) : (
            /* HIỂN THỊ TABS ĐĂNG KÝ CƯ DÂN */
            <form onSubmit={handleSubmitRegister} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-800 text-sm transition-all ${errors.fullName ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'} outline-none`}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-800 text-sm transition-all ${errors.phone ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'} outline-none`}
                      placeholder="0912345678"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Tên tài khoản mới</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-800 text-sm transition-all ${errors.username ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'} outline-none`}
                      placeholder="User_cudan"
                    />
                  </div>
                  {errors.username && <p className="text-xs text-rose-600">{errors.username}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Mã số căn hộ</label>
                  <div className="relative">
                    <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="apartmentNumber"
                      value={registerData.apartmentNumber}
                      onChange={handleRegisterChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-800 text-sm transition-all ${errors.apartmentNumber ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'} outline-none`}
                      placeholder="Ví dụ: P102"
                    />
                  </div>
                  {errors.apartmentNumber && <p className="text-xs text-rose-600">{errors.apartmentNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-800 text-sm transition-all ${errors.password ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'} outline-none`}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-800 text-sm transition-all ${errors.confirmPassword ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'} outline-none`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  {errors.confirmPassword && <p className="text-xs text-rose-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Gửi yêu cầu xác thực'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}