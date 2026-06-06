import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, History, CheckCircle2, User, Home, LogOut, MessageSquare, Users, Plus, Trash2, Send } from 'lucide-react';

export default function ResidentDashboard() {
  const navigate = useNavigate();
  
  const [residentInfo, setResidentInfo] = useState({ name: "Đang tải...", room: "...", phone: "...", email: "..." });
  const [members, setMembers] = useState([]);
  const [historyInvoices, setHistoryInvoices] = useState([]);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [disputes, setDisputes] = useState([]);
  
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('');
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [newDisputeTitle, setNewDisputeTitle] = useState('');
  const [newDisputeDesc, setNewDisputeDesc] = useState('');

  const API_BASE_URL = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resident/dashboard`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setResidentInfo(data.profile || { name: "N/A", room: "N/A", phone: "N/A", email: "N/A" });
        setMembers(data.members || []);
        setHistoryInvoices(data.historyInvoices || []);
        setCurrentInvoice(data.currentInvoice || null);
        setDisputes(data.disputes || []);
      } else {
        setMembers([]);
        setHistoryInvoices([]);
        setDisputes([]);
      }
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu cư dân:", err);
      setMembers([]);
      setHistoryInvoices([]);
      setDisputes([]);
    }
  };

  useEffect(() => { 
    fetchDashboardData(); 
  }, []);

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/resident/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ phone: residentInfo.phone, email: residentInfo.email })
      });
      if (response.ok) {
        setIsUpdatingInfo(false);
        alert("Cập nhật thông tin liên hệ thành công!");
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Lỗi gửi thông tin liên hệ:", err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberRelation) return;
    try {
      const response = await fetch(`${API_BASE_URL}/resident/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newMemberName, relation: newMemberRelation })
      });
      if (response.ok) {
        setNewMemberName('');
        setNewMemberRelation('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Lỗi thêm nhân khẩu mới:", err);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Xóa thành viên này khỏi danh sách nhân khẩu căn hộ?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/resident/members/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Lỗi xóa nhân khẩu:", err);
    }
  };

  const handleSendDispute = async (e) => {
    e.preventDefault();
    if (!newDisputeTitle || !newDisputeDesc) return;
    try {
      const response = await fetch(`${API_BASE_URL}/resident/disputes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: newDisputeTitle, desc: newDisputeDesc })
      });
      if (response.ok) {
        setNewDisputeTitle('');
        setNewDisputeDesc('');
        alert("Gửi phản ánh thành công! Ban quản lý sẽ tiếp nhận sớm.");
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Lỗi gửi đơn ý kiến:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased font-sans">
      <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-xl"><Home className="w-5 h-5" /></div>
          <span className="font-black text-sm uppercase tracking-wider">Cổng Cư Dân SmartFee</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{residentInfo.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Căn hộ: {residentInfo.room}</p>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded-xl transition-all"><LogOut className="w-4.5 h-4.5" /></button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-2 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Sổ tay thông tin căn hộ</h3>
            {!isUpdatingInfo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div><span className="text-slate-400 block text-[10px] uppercase">Chủ hộ sở hữu</span> <p className="text-slate-900 font-bold text-sm">{residentInfo.name}</p></div>
                <div><span className="text-slate-400 block text-[10px] uppercase">Mã số căn hộ</span> <p className="text-slate-900 font-bold text-sm">{residentInfo.room}</p></div>
                <div><span className="text-slate-400 block text-[10px] uppercase">Số điện thoại</span> <p className="text-slate-900">{residentInfo.phone}</p></div>
                <div><span className="text-slate-400 block text-[10px] uppercase">Địa chỉ hòm thư</span> <p className="text-slate-900">{residentInfo.email || "Chưa thiết lập"}</p></div>
                <button onClick={() => setIsUpdatingInfo(true)} className="sm:col-span-2 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all text-center">Thay đổi thông tin liên hệ</button>
              </div>
            ) : (
              <form onSubmit={handleUpdateContact} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Số điện thoại mới</label><input type="text" required value={residentInfo.phone} onChange={(e) => setResidentInfo({...residentInfo, phone: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Hòm thư email mới</label><input type="email" required value={residentInfo.email} onChange={(e) => setResidentInfo({...residentInfo, email: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs" /></div>
                </div>
                <div className="flex gap-2 justify-end text-xs font-bold"><button type="button" onClick={() => setIsUpdatingInfo(false)} className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50">Hủy</button><button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Lưu thay đổi</button></div>
              </form>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-400" /> Hóa đơn chi phí dịch vụ hiện hành</h3>
            {currentInvoice ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Kỳ hóa đơn phát hành: {currentInvoice.billingDate}</p>
                  <p className="text-2xl font-black text-blue-400">{Number(currentInvoice.grandTotal || 0).toLocaleString()} đ</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${currentInvoice.status === 'Unpaid' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{currentInvoice.status === 'Unpaid' ? 'Chưa đóng tiền' : 'Giao dịch đang chờ duyệt'}</span>
                </div>
                {currentInvoice.status === 'Unpaid' && (
                  <button onClick={() => navigate(`/resident/payment?invoiceId=${currentInvoice.id}`)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20">Tiến hành thanh toán trực tuyến</button>
                )}
              </div>
            ) : (
              <div className="py-4 text-slate-400 text-xs font-bold text-center flex flex-col items-center gap-1"><CheckCircle2 className="w-8 h-8 text-emerald-500" /><p>Tuyệt vời! Căn hộ của bạn đã thanh toán sạch sẽ toàn bộ các khoản phí tòa nhà.</p></div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-2 flex items-center gap-2"><History className="w-5 h-5 text-blue-600" /> Lịch sử đối soát đóng tiền căn hộ</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="py-2.5 px-3">Mã hóa đơn</th>
                    <th className="py-2.5 px-3">Kỳ thanh toán</th>
                    <th className="py-2.5 px-3">Số tiền</th>
                    <th className="py-2.5 px-3">Trạng thái đối soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {historyInvoices.length === 0 ? (
                    <tr><td colSpan="4" className="py-4 text-center text-slate-400 font-semibold">Chưa có dữ liệu lịch sử thanh toán.</td></tr>
                  ) : (
                    historyInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono text-[11px]">{inv.id}</td>
                        <td className="py-2 px-3 font-bold text-slate-600">{inv.billingDate}</td>
                        <td className="py-2 px-3 font-black text-slate-900">{Number(inv.grandTotal || 0).toLocaleString()} đ</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Thành công</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-2 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Khai báo nhân khẩu cư trú</h3>
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {members.length === 0 ? (
                <p className="text-xs text-slate-400 text-center font-bold py-2">Căn hộ chưa khai báo nhân khẩu phụ.</p>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                    <div><p className="text-xs font-bold text-slate-900">{m.name}</p><p className="text-[10px] text-slate-400 font-semibold">Quan hệ chủ hộ: {m.relation}</p></div>
                    <button type="button" onClick={() => handleDeleteMember(m.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddMember} className="pt-2 border-t border-slate-100 space-y-2 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="Họ tên phụ" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs" />
                <input type="text" required placeholder="Ví dụ: Vợ, Con trai" value={newMemberRelation} onChange={(e) => setNewMemberRelation(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs" />
              </div>
              <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1 transition-all"><Plus className="w-3.5 h-3.5" /> Khai báo nhân khẩu</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase border-b pb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600" /> Phản ánh ý kiến gửi BQL</h3>
            
            <form onSubmit={handleSendDispute} className="space-y-2.5 text-xs font-semibold">
              <div className="space-y-0.5"><label className="text-[10px] text-slate-500 font-bold uppercase">Tiêu đề thắc mắc *</label><input type="text" required placeholder="Ví dụ: Đèn hành lang tầng 1 bị cháy" value={newDisputeTitle} onChange={(e) => setNewDisputeTitle(e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl" /></div>
              <div className="space-y-0.5"><label className="text-[10px] text-slate-500 font-bold uppercase">Nội dung trình bày chi tiết *</label><textarea rows="3" required placeholder="Trình bày rõ sự việc kèm lưu ý nếu có..." value={newDisputeDesc} onChange={(e) => setNewDisputeDesc(e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl resize-none"></textarea></div>
              <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1 transition-all shadow-md"><Send className="w-3 h-3" /> Gửi phản nghị chính thức</button>
            </form>

            <div className="space-y-2 pt-3 border-t border-slate-100 max-h-[180px] overflow-y-auto pr-1">
              {disputes.map((d) => (
                <div key={d.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="flex justify-between items-start text-[11px]"><h4 className="font-bold text-slate-900 line-clamp-1">{d.title}</h4><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${d.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{d.status === 'Resolved' ? 'Đã giải quyết' : 'Chưa xử lý'}</span></div>
                  {d.feedback && <p className="text-[10px] text-blue-600 bg-blue-50/50 p-1.5 rounded-lg border border-blue-100/50 mt-1 font-medium"><span className="font-bold">BQL trả lời:</span> {d.feedback}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}