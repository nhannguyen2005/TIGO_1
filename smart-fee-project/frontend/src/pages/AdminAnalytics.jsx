import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, LayoutDashboard, Users, BarChart3, Calculator, MessageSquare,
  TrendingUp, TrendingDown, DollarSign, Download, LogOut
} from 'lucide-react';

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState([]);
  const [summary, setSummary] = useState({ totalCollected: 0, totalUnpaid: 0 });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/analytics", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data.chartItems || []);
          setSummary(data.summary || { totalCollected: 0, totalUnpaid: 0 });
        }
      } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu tài chính:", err);
      }
    };
    fetchAnalytics();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex antialiased font-sans">
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md"><Building2 className="w-5 h-5" /></div>
          <span className="font-black text-xs uppercase tracking-wider">SmartFee Quản Trị</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => navigate('/admin/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"><LayoutDashboard className="w-4 h-4" /> Bảng điều khiển</button>
          <button onClick={() => navigate('/admin/residents')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"><Users className="w-4 h-4" /> Danh sách cư dân</button>
          <button onClick={() => navigate('/admin/fee-calculation')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"><Calculator className="w-4 h-4" /> Tính phí định kỳ</button>
          <button onClick={() => navigate('/admin/disputes')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"><MessageSquare className="w-4 h-4" /> Tiếp nhận phản ánh</button>
          <button onClick={() => navigate('/admin/analytics')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl bg-blue-600 text-white transition-all"><BarChart3 className="w-4 h-4" /> Thống kê tài chính</button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-rose-400 hover:bg-rose-950/30 transition-all"><LogOut className="w-4 h-4" /> Đăng xuất hệ thống</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-black text-sm text-slate-800 uppercase tracking-tight"><BarChart3 className="w-5 h-5 text-blue-600" /> Báo cáo doanh số &amp; Công nợ</div>
          <button className="flex items-center gap-1.5 px-3.5 py-2 border text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-slate-50 transition-all"><Download className="w-4 h-4" /> Xuất tập tin Excel</button>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tổng quỹ cước đã thu</span>
                <p className="text-3xl font-black text-slate-900">{(summary?.totalCollected || 0).toLocaleString()} đ</p>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Tăng trưởng 4.2%</span>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chi phí vận hành tòa nhà</span>
                <p className="text-3xl font-black text-slate-900">{(summary?.totalUnpaid || 0).toLocaleString()} đ</p>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg inline-flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Tiết kiệm 1.5%</span>
              </div>
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown className="w-6 h-6" /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tiến độ thu tiền theo hạng mục dịch vụ</h3>
            <div className="space-y-4">
              {analyticsData.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700"><span>{item.title}</span><span>{Number(item.amount || 0).toLocaleString()}đ ({item.ratio}%)</span></div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color || 'bg-blue-600'} h-full transition-all duration-500`} style={{ width: `${item.ratio}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}