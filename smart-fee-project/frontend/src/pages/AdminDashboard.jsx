import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Building2, LayoutDashboard, Users, BarChart3, 
  Bell, Search, DollarSign, CheckCircle, AlertTriangle, MessageSquare,
  ArrowUpRight, TrendingUp, Filter, ChevronRight, Calculator, X, LogOut
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [stats, setStats] = useState({ totalCollected: 0, totalPending: 0, totalRooms: 0, pendingDisputes: 0 });

  const API_BASE_URL = "http://localhost:5000/api/admin/dashboard";
  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || { totalCollected: 0, totalPending: 0, totalRooms: 0, pendingDisputes: 0 });
        setRecentInvoices(data.recentInvoices || []);
        setAnnouncements(data.announcements || []);
      } else {
        setRecentInvoices([]);
        setAnnouncements([]);
      }
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu tổng quan Dashboard:", err);
      setRecentInvoices([]);
      setAnnouncements([]);
    }
  };

  useEffect(() => { 
    fetchDashboardData(); 
  }, []);

  const handleAnnounceSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newNotice)
      });

      if (response.ok) {
        const createdNotice = await response.json();
        setAnnouncements(prev => [createdNotice, ...prev]);
        setIsNoticeModalOpen(false);
        setNewNotice({ title: '', content: '' });
        fetchDashboardData();
      } else {
        alert("Không thể đăng thông báo. Hãy kiểm tra lại Backend!");
      }
    } catch (err) {
      console.error("Lỗi gửi thông báo lên DB:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filteredInvoices = recentInvoices.filter(inv =>
    (inv.room && inv.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.id && inv.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex antialiased font-sans">
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md"><Building2 className="w-5 h-5" /></div>
          <span className="font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SmartBuilding</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => navigate('/admin/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all bg-blue-600 text-white shadow-lg shadow-blue-600/10"><LayoutDashboard className="w-4 h-4" /> Tổng quan chung</button>
          <button onClick={() => navigate('/admin/residents')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><Users className="w-4 h-4" /> Quản lý cư dân</button>
          <button onClick={() => navigate('/admin/fee-calculation')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><Calculator className="w-4 h-4" /> Tính phí căn hộ</button>
          <button onClick={() => navigate('/admin/disputes')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><MessageSquare className="w-4 h-4" /> Khiếu nại - Phản ánh</button>
          <button onClick={() => navigate('/admin/analytics')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><BarChart3 className="w-4 h-4" /> Thống kê tài chính</button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all"><LogOut className="w-4 h-4" /> Đăng xuất hệ thống</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-64 hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Tìm nhanh hóa đơn, phòng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsNoticeModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"><Bell className="w-3.5 h-3.5" /> Tạo thông báo</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Đã thu tháng này</span>
                <p className="text-xl font-black text-slate-900">{Number(stats.totalCollected || 0).toLocaleString()} đ</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Còn nợ đọng</span>
                <p className="text-xl font-black text-slate-900">{Number(stats.totalPending || 0).toLocaleString()} đ</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tổng số căn hộ</span>
                <p className="text-xl font-black text-slate-900">{stats.totalRooms || 0} Phòng</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Building2 className="w-5 h-5" /></div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Phản ánh chưa xử lý</span>
                <p className="text-xl font-black text-rose-600">{stats.pendingDisputes || 0} Đơn ý kiến</p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><MessageSquare className="w-5 h-5" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 xl:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Hóa đơn giao dịch gần đây</h3>
                <button onClick={() => navigate('/admin/analytics')} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5">Chi tiết tài chính <ChevronRight className="w-3 h-3" /></button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                      <th className="py-2 px-3">Mã hóa đơn</th>
                      <th className="py-2 px-3">Căn hộ</th>
                      <th className="py-2 px-3">Số tiền</th>
                      <th className="py-2 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-slate-400">Không có hóa đơn trùng khớp.</td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition-all">
                          <td className="py-2.5 px-3 font-mono text-slate-900 text-[11px]">{inv.id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{inv.room}</td>
                          <td className="py-2.5 px-3 font-black text-slate-900">{Number(inv.amount || 0).toLocaleString()} đ</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {inv.status === 'Paid' ? 'Đã đóng' : 'Còn nợ'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Bảng tin thông báo tòa nhà</h3>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {announcements.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Chưa có thông báo nào được phát hành.</p>
                ) : (
                  announcements.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 hover:border-slate-200 transition-all">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">{item.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4 relative">
            <button onClick={() => setIsNoticeModalOpen(false)} className="absolute right-4 top-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"><X className="w-4 h-4" /></button>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Tạo thông báo tòa nhà mới</h3>
            <form onSubmit={handleAnnounceSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Tiêu đề thông báo *</label>
                <input type="text" required placeholder="Ví dụ: Lịch phun thuốc muỗi định kỳ" value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nội dung chi tiết *</label>
                <textarea rows="4" required placeholder="Nhập lịch trình chi tiết hoặc lưu ý cho cư dân..." value={newNotice.content} onChange={(e) => setNewNotice({...newNotice, content: e.target.value})} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all">Phát hành &amp; Đẩy lên bảng tin</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}