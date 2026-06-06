import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminFeeCalculation() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    apartmentNumber: '', managementFeeRate: '10000', area: '75',
    electricityOld: '', electricityNew: '', waterOld: '', waterNew: ''
  });

  const [calculatedFees, setCalculatedFees] = useState({
    managementTotal: 0, electricityTotal: 0, waterTotal: 0, grandTotal: 0
  });

  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem("token");

  useEffect(() => {
    const management = (Number(formData.managementFeeRate) * Number(formData.area)) || 0;
    const elecDiff = (Number(formData.electricityNew) - Number(formData.electricityOld)) || 0;
    const electricity = elecDiff > 0 ? elecDiff * 2500 : 0;
    const waterDiff = (Number(formData.waterNew) - Number(formData.waterOld)) || 0;
    const water = waterDiff > 0 ? waterDiff * 11000 : 0;

    setCalculatedFees({
      managementTotal: management,
      electricityTotal: electricity,
      waterTotal: water,
      grandTotal: management + electricity + water
    });
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.apartmentNumber) {
      setError('Vui lòng nhập số căn hộ để tính phí');
      return;
    }
    if (Number(formData.electricityNew) < Number(formData.electricityOld) || Number(formData.waterNew) < Number(formData.waterOld)) {
      setError('Chỉ số mới không được nhỏ hơn chỉ số cũ');
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/invoices/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSaved(true);
        setError('');
        setTimeout(() => {
          setIsSaved(false);
          setFormData({ apartmentNumber: '', managementFeeRate: '10000', area: '75', electricityOld: '', electricityNew: '', waterOld: '', waterNew: '' });
        }, 2000);
      } else {
        setError('Lỗi khi lưu dữ liệu hóa đơn lên hệ thống.');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ quản lý dữ liệu.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center antialiased font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-3">
        
        <div className="p-6 md:p-8 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"><ArrowLeft className="w-4 h-4" /></button>
            <div>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5"><Calculator className="w-5 h-5 text-blue-600" /> Tính phí định kỳ căn hộ</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khởi tạo hóa đơn điện, nước &amp; quản lý tòa nhà</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-fadeIn"><AlertCircle className="w-4 h-4 shrink-0" /><p>{error}</p></div>
          )}

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Số căn hộ *</label>
                <input type="text" name="apartmentNumber" required value={formData.apartmentNumber} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" placeholder="Ví dụ: P102" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Đơn giá quản lý/m²</label>
                <input type="number" name="managementFeeRate" value={formData.managementFeeRate} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Diện tích (m²)</label>
                <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">⚡ Chỉ số công tơ điện tiêu thụ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Chỉ số cũ (kWh)</label>
                  <input type="number" name="electricityOld" required placeholder="Nhập số cũ" value={formData.electricityOld} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all text-slate-800" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Chỉ số mới (kWh)</label>
                  <input type="number" name="electricityNew" required placeholder="Nhập số mới" value={formData.electricityNew} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all text-slate-800" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">💧 Chỉ số khối lượng nước sinh hoạt</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Chỉ số cũ (m³)</label>
                  <input type="number" name="waterOld" required placeholder="Nhập số cũ" value={formData.waterOld} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all text-slate-800" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Chỉ số mới (m³)</label>
                  <input type="number" name="waterNew" required placeholder="Nhập số mới" value={formData.waterNew} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all text-slate-800" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"><FileText className="w-4 h-4" /> Xuất dữ liệu &amp; Phát hành hóa đơn</button>
          </form>
        </div>

        <div className="bg-slate-900 text-white p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800">
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Căn hộ hạch toán</h3>
              <p className="text-xl font-black text-blue-400 uppercase">{formData.apartmentNumber || 'CHƯA CHỌN'}</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2">Bản xem trước chi phí</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Phí quản lý:</span><span className="font-bold text-white">{calculatedFees.managementTotal.toLocaleString()} đ</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Tiền điện:</span><span className="font-bold text-white">{calculatedFees.electricityTotal.toLocaleString()} đ</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Tiền nước:</span><span className="font-bold text-white">{calculatedFees.waterTotal.toLocaleString()} đ</span></div>
                <div className="h-px bg-slate-700 my-2"></div>
                <div className="flex justify-between text-sm font-black"><span>Tổng cộng:</span><span className="text-blue-400">{calculatedFees.grandTotal.toLocaleString()} đ</span></div>
              </div>
            </div>
            {isSaved && (
              <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl text-center space-y-2 animate-fadeIn">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-200">Khởi tạo hóa đơn thành công!</p>
              </div>
            )}
          </div>
          <div className="text-[9px] text-slate-500 font-semibold leading-relaxed pt-6">Đơn giá định mức mặc định áp dụng chung cư: Điện kinh doanh/sinh hoạt (lũy tiến: 2,500đ/kWh), Nước sinh hoạt (11,000đ/m³).</div>
        </div>

      </div>
    </div>
  );
}