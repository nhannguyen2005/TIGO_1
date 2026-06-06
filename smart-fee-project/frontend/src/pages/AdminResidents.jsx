import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, LayoutDashboard, Users, BarChart3, MessageSquare, Calculator,
  Search, Plus, Home, Phone, Mail, X, Edit, Trash2, LogOut
} from 'lucide-react';

export default function AdminResidents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [residents, setResidents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [residentForm, setResidentForm] = useState({
    name: '', room: '', phone: '', email: '', status: 'Unpaid', members: 1
  });

  const API_BASE_URL = "http://localhost:5000/api/admin/residents";
  const token = localStorage.getItem("token");

  const fetchResidents = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setResidents(data || []);
      } else {
        setResidents([]);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách cư dân:", err);
      setResidents([]);
    }
  };

  useEffect(() => { 
    fetchResidents(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `${API_BASE_URL}/${currentId}` : API_BASE_URL;

      const payload = {
        ...residentForm,
        members: Number(residentForm.members)
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchResidents();
        setIsFormOpen(false);
        setResidentForm({ name: '', room: '', phone: '', email: '', status: 'Unpaid', members: 1 });
      } else {
        alert("Lỗi thao tác dữ liệu. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi đồng bộ cư dân về DB:", err);
    }
  };

  const handleEdit = (resident) => {
    setIsEditMode(true);
    setCurrentId(resident.id);
    setResidentForm({
      name: resident.name || '',
      room: resident.room || '',
      phone: resident.phone || '',
      email: resident.email || '',
      status: resident.status || 'Unpaid',
      members: resident.members || 1
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cư dân này ra khỏi hệ thống tòa nhà?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        fetchResidents();
      } else {
        alert("Không thể xóa bản ghi cư dân.");
      }
    } catch (err) {
      console.error("Lỗi xóa bản ghi:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filteredResidents = residents.filter(res =>
    (res.name && res.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (res.room && res.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (res.phone && res.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex antialiased font-sans">
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md"><Building2 className="w-5 h-5" /></div>
          <span className="font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SmartBuilding</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => navigate('/admin/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-slate-400 hover:bg-slate-800/50 hover:text-white"><LayoutDashboard className="w-4 h-4" /> Tổng quan chung</button>
          <button onClick={() => navigate('/admin/residents')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all bg-blue-600 text-white shadow-lg shadow-blue-600/10"><Users className="w-4 h-4" /> Quản lý cư dân</button>
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
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Tìm tên cư dân, số phòng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" />
            </div>
          </div>
          
          <button onClick={() => { setIsEditMode(false); setResidentForm({ name:'', room:'', phone:'', email:'', status:'Unpaid', members:1 }); setIsFormOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider">
            <Plus className="w-3.5 h-3.5" /> Thêm cư dân
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/70">
                    <th className="py-3 px-4">Thông tin cư dân</th>
                    <th className="py-3 px-4">Số phòng</th>
                    <th className="py-3 px-4">Thông tin liên hệ</th>
                    <th className="py-3 px-4">Nhân khẩu</th>
                    <th className="py-3 px-4">Tình trạng phí</th>
                    <th className="py-3 px-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">Chưa có bản ghi cư dân nào khớp trường tìm kiếm.</td>
                    </tr>
                  ) : (
                    filteredResidents.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[11px] border border-blue-100">{(res.name || 'C').charAt(0)}</div>
                            <div>
                              <p className="font-bold text-slate-900">{res.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {res.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800"><span className="flex items-center gap-1"><Home className="w-3.5 h-3.5 text-slate-400" />{res.room}</span></td>
                        <td className="py-3 px-4 space-y-0.5 text-slate-600">
                          <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{res.phone}</p>
                          <p className="flex items-center gap-1 text-[11px] text-slate-400"><Mail className="w-3 h-3 text-slate-400" />{res.email}</p>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{res.members} Thành viên</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-0.5 ${res.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : res.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                            {res.status === 'Paid' ? 'Đã đóng sạch' : res.status === 'Pending' ? 'Chờ duyệt phí' : 'Còn nợ phí'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(res)} className="p-1.5 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(res.id)} className="p-1.5 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4 relative">
            <button onClick={() => setIsFormOpen(false)} className="absolute right-4 top-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"><X className="w-4 h-4" /></button>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">{isEditMode ? "Cập nhật hồ sơ cư dân" : "Thêm cư dân mới vào hệ thống"}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Họ tên cư dân *</label>
                  <input type="text" required value={residentForm.name} onChange={(e) => setResidentForm({...residentForm, name: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:bg-white" placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Số phòng căn hộ *</label>
                  <input type="text" required value={residentForm.room} onChange={(e) => setResidentForm({...residentForm, room: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:bg-white" placeholder="P102" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Số lượng nhân khẩu</label>
                  <input type="number" min="1" value={residentForm.members} onChange={(e) => setResidentForm({...residentForm, members: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Số điện thoại *</label>
                  <input type="text" required value={residentForm.phone} onChange={(e) => setResidentForm({...residentForm, phone: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:bg-white" placeholder="090xxxxxxx" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Địa chỉ Email</label>
                <input type="email" value={residentForm.email} onChange={(e) => setResidentForm({...residentForm, email: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:bg-white" placeholder="cu_dan@gmail.com" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Trạng thái đóng phí căn hộ</label>
                <select value={residentForm.status} onChange={(e) => setResidentForm({...residentForm, status: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:bg-white font-bold">
                  <option value="Unpaid">Còn nợ phí</option>
                  <option value="Paid">Đã thanh toán sạch</option>
                  <option value="Pending">Chờ duyệt giao dịch</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all">Lưu cơ sở dữ liệu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}