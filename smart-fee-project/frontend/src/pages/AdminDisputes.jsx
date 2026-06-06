import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, LayoutDashboard, Users, BarChart3, MessageSquare, Calculator,
  Clock, ShieldAlert, LogOut
} from 'lucide-react';

export default function AdminDisputes() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  
  const API_BASE_URL = "http://localhost:5000/api/admin/disputes";
  const token = localStorage.getItem("token");

  const fetchDisputes = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDisputes(data || []);
      } else {
        setDisputes([]);
      }
    } catch (err) {
      console.error("Lỗi lấy đơn phản ánh:", err);
      setDisputes([]);
    }
  };

  useEffect(() => { 
    fetchDisputes(); 
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const feedback = status === 'Resolved' ? prompt("Nhập nội dung phản hồi giải quyết gửi tới cư dân:") : "Đơn không hợp lệ hoặc bị bác bỏ.";
    if (feedback === null) return; 

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, feedback })
      });

      if (response.ok) {
        fetchDisputes();
      } else {
        alert("Thao tác thất bại. Không thể cập nhật trạng thái đơn!");
      }
    } catch (err) {
      console.error("Lỗi cập nhật đơn phản ánh:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex antialiased font-sans">
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md"><Building2 className="w-5 h-5" /></div>
          <span className="font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SmartBuilding</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => navigate('/admin/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><LayoutDashboard className="w-4 h-4" /> Tổng quan chung</button>
          <button onClick={() => navigate('/admin/residents')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><Users className="w-4 h-4" /> Quản lý cư dân</button>
          <button onClick={() => navigate('/admin/fee-calculation')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><Calculator className="w-4 h-4" /> Tính phí căn hộ</button>
          <button onClick={() => navigate('/admin/disputes')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all bg-blue-600 text-white shadow-lg shadow-blue-600/10"><MessageSquare className="w-4 h-4" /> Khiếu nại - Phản ánh</button>
          <button onClick={() => navigate('/admin/analytics')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><BarChart3 className="w-4 h-4" /> Thống kê tài chính</button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all"><LogOut className="w-4 h-4" /> Đăng xuất hệ thống</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 shrink-0">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-blue-600" /> Trung tâm xử lý kiến nghị &amp; Phản ánh cư dân</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 max-w-4xl">
            {disputes.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-400 font-bold">Hiện tại không có đơn thư phản ánh nào từ cư dân.</div>
            ) : (
              disputes.map((ticket) => (
                <div key={ticket.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">ID: {ticket.id}</span>
                      <h3 className="text-xs font-bold text-slate-900">{ticket.title}</h3>
                      <p className="text-[11px] text-slate-400 font-semibold">Gửi từ: Căn hộ {ticket.room} • Ngày gửi: {ticket.date}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider inline-flex items-center gap-1 border ${ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ticket.status === 'Processing' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500'}`}><Clock className="w-3 h-3" />{ticket.status === 'Resolved' ? 'Đã giải quyết' : ticket.status === 'Processing' ? 'Đang kiểm tra' : 'Chưa xử lý'}</span>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium whitespace-pre-line">{ticket.desc}</p>
                  {ticket.status !== 'Resolved' && ticket.status !== 'Rejected' && (
                    <div className="flex justify-end gap-2 pt-1 animate-fadeIn">
                      <button type="button" onClick={() => handleUpdateStatus(ticket.id, 'Rejected')} className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all">Bác bỏ</button>
                      <button type="button" onClick={() => handleUpdateStatus(ticket.id, 'Resolved')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all">Phản hồi cư dân &amp; Hoàn thành đơn</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}