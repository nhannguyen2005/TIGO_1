import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CreditCard, Wallet, QrCode, ArrowLeft, Download, 
  Droplet, Zap, Car, ShieldAlert, CheckCircle2, Info, Building, Check
} from 'lucide-react';

export default function ResidentPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId') || "INV-202605";

  const [invoiceStatus, setInvoiceStatus] = useState('unpaid'); 
  const [selectedMethod, setSelectedMethod] = useState('qr'); 
  const [isLoading, setIsLoading] = useState(false);
  const [feeDetails, setFeeDetails] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const API_BASE_URL = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const iconConfig = {
    'MANAGEMENT': { icon: Building, color: "text-blue-600 bg-blue-50" },
    'VEHICLE': { icon: Car, color: "text-indigo-600 bg-indigo-50" },
    'ELECTRIC': { icon: Zap, color: "text-amber-600 bg-amber-50" },
    'WATER': { icon: Droplet, color: "text-cyan-600 bg-cyan-50" }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchInvoiceDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/resident/invoices/${invoiceId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setInvoiceStatus(data.status || 'unpaid');
          setTotalAmount(Number(data.total_amount || 0));
          setFeeDetails(data.details || []);
        }
      } catch (err) {
        console.error("Lỗi fetch chi tiết hóa đơn:", err);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId, token, navigate]);

  const handleDownloadInvoice = () => {
    alert(`Hệ thống đang khởi tạo file PDF... Tải xuống thành công hóa đơn chi tiết mã #${invoiceId}.`);
  };

  const handlePaymentSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/resident/payment/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ invoiceId, paymentMethod: selectedMethod, amount: totalAmount })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setInvoiceStatus('processing');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate('/resident/dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại trang tổng quan
          </button>
          <span className="text-xs text-slate-400 font-medium">Mã giao dịch: #{invoiceId}</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Chi tiết cổng đóng phí</h1>
          <p className="text-xs text-slate-500 font-medium">Đối chiếu các khoản dịch vụ định kỳ và tiến hành hoàn tất hóa đơn tháng này.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Hóa Đơn Tổng Hợp</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Kỳ thanh toán: Tháng 05/2026</p>
              </div>
              
              <button 
                type="button"
                onClick={handleDownloadInvoice}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-all shadow-sm"
                title="Tải hóa đơn PDF về máy"
              >
                <Download className="w-3.5 h-3.5" /> Tải về
              </button>
            </div>

            <div className="divide-y divide-slate-100 p-5 pt-2">
              {feeDetails.map((fee) => {
                const config = iconConfig[fee.fee_type] || { icon: Building, color: "text-blue-600 bg-blue-50" };
                const IconComponent = config.icon;
                return (
                  <div key={fee.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${config.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{fee.fee_name || fee.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{fee.fee_desc || fee.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 tracking-tight shrink-0">
                      {Number(fee.amount || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng cộng cần thanh toán</span>
              <span className="text-lg font-black tracking-tight">{totalAmount.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Phương thức nộp tiền</h3>
              
              {invoiceStatus === 'paid' || invoiceStatus === 'success' ? (
                <div className="py-6 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase">Đã hoàn tất thanh toán</h4>
                    <p className="text-[10px] text-slate-400 font-medium px-4">Hệ thống đã nhận đủ số tiền và gạch nợ trên hệ thống quản lý tòa nhà.</p>
                  </div>
                </div>
              ) : invoiceStatus === 'processing' ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase">Đã gửi yêu cầu thanh toán</h4>
                    <p className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 py-1.5 px-2 rounded-xl mx-2">
                      Giao dịch của bạn đang chờ kiểm duyệt!
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium px-2 pt-1 leading-relaxed">
                      Vui lòng giữ lại biên lai chuyển khoản. Ban quản lý sẽ xác thực lệnh chuyển tiền trực tuyến trong ít phút.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={async () => {
                      await fetch(`${API_BASE_URL}/resident/payment/simulate-success/${invoiceId}`, { method: 'POST' });
                      setInvoiceStatus('paid');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <Check className="w-3.5 h-3.5" /> Giả lập BQL duyệt thành công
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedMethod === 'qr' ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <QrCode className="w-5 h-5 text-slate-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Quét mã QR Code</p>
                        <p className="text-[10px] text-slate-400 font-medium">Cổng VietQR (Napas247)</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={selectedMethod === 'qr'} 
                      onChange={() => setSelectedMethod('qr')}
                      className="text-blue-600 focus:ring-0" 
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedMethod === 'vnpay' ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-slate-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Cổng Thẻ VNPAY</p>
                        <p className="text-[10px] text-slate-400 font-medium">Thẻ ATM nội địa / Quốc tế</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={selectedMethod === 'vnpay'} 
                      onChange={() => setSelectedMethod('vnpay')}
                      className="text-blue-600 focus:ring-0" 
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedMethod === 'momo' ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-slate-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Ví Điện Tử MoMo</p>
                        <p className="text-[10px] text-slate-400 font-medium">Thanh toán một chạm ứng dụng</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={selectedMethod === 'momo'} 
                      onChange={() => setSelectedMethod('momo')}
                      className="text-blue-600 focus:ring-0" 
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handlePaymentSubmit}
                    disabled={isLoading}
                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      `Xác nhận đóng phí ${totalAmount.toLocaleString('vi-VN')} đ`
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 text-[10px] flex items-start gap-2.5 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>Mọi giao dịch đóng phí trực tuyến trên hệ thống SmartFee đều được mã hóa SSL/TLS bảo mật nghiêm ngặt và đối soát tự động trực tiếp về tài khoản ngân hàng của Ban quản lý tòa nhà.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}