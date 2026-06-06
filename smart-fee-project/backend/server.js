import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'smartfee_secret_key_2026';

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',      
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'smartfee_db', 
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const dbPool = mysql.createPool(dbConfig);

// Middleware xác thực Token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Không tìm thấy token xác thực." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
        req.user = user;
        next();
    });
};

// Middleware kiểm tra quyền Admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: "Quyền truy cập bị từ chối. Chỉ dành cho Admin." });
    }
};

// ==========================================
// AUTHENTICATION API
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role, fullName, apartmentNumber, phone } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ tài khoản và mật khẩu.' });
    }
    try {
        const [existing] = await dbPool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ message: "Tên tài khoản đã tồn tại." });

        const hashedPassword = await bcrypt.hash(password, 10);
        await dbPool.query(
            'INSERT INTO users (username, password, role, full_name, room_number, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, role || 'resident', fullName, apartmentNumber || null, phone]
        );
        res.status(201).json({ message: "Đăng ký tài khoản thành công." });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống khi đăng ký." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await dbPool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, roomNumber: user.room_number },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token: token,
            role: user.role,
            user_id: user.id,
            room_number: user.room_number || '',
            message: 'Đăng nhập thành công'
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
});

// ==========================================
// RESIDENT API
// ==========================================
app.get('/api/resident/dashboard', authenticateToken, async (req, res) => {
    try {
        const residentId = req.user.id;
        const [userRows] = await dbPool.query('SELECT full_name as name, room_number as room, phone, username as email FROM users WHERE id = ?', [residentId]);
        const profile = userRows[0] || { name: "N/A", room: "N/A", phone: "N/A", email: "N/A" };

        const [unpaidInvoices] = await dbPool.query('SELECT id, title, total_amount, status, created_at FROM invoices WHERE resident_id = ? AND status = "unpaid" LIMIT 1', [residentId]);
        const [historyInvoices] = await dbPool.query('SELECT id, title, total_amount, status, created_at FROM invoices WHERE resident_id = ? ORDER BY created_at DESC', [residentId]);
        
        // Map hoa chữ cái đầu trạng thái đơn khiếu nại cho Resident Dashboard React
        const [disputeRows] = await dbPool.query('SELECT id, invoice_id, title, description as `desc`, CASE WHEN status="resolved" THEN "Resolved" ELSE "Pending" END as status, created_at FROM disputes WHERE resident_id = ?', [residentId]);

        res.json({
            profile,
            members: [],
            currentInvoice: unpaidInvoices[0] || null,
            historyInvoices,
            disputes: disputeRows
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi đồng bộ dữ liệu cư dân." });
    }
});

// ==========================================
// ADMIN API (Quản trị viên)
// ==========================================
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [collectedRows] = await dbPool.query('SELECT SUM(total_amount) as total FROM invoices WHERE status = "paid"');
        const [pendingRows] = await dbPool.query('SELECT SUM(total_amount) as total FROM invoices WHERE status = "unpaid"');
        const [roomRows] = await dbPool.query('SELECT COUNT(DISTINCT room_number) as total FROM users WHERE role = "resident"');
        const [disputeRows] = await dbPool.query('SELECT COUNT(*) as total FROM disputes WHERE status = "pending"');
        const [recentInvoices] = await dbPool.query('SELECT i.id, i.title, i.total_amount as amount, i.status, u.room_number as room FROM invoices i LEFT JOIN users u ON i.resident_id = u.id ORDER BY i.created_at DESC LIMIT 5');

        res.json({
            stats: { totalCollected: Number(collectedRows[0].total || 0), totalPending: Number(pendingRows[0].total || 0), totalRooms: roomRows[0].total || 0, pendingDisputes: disputeRows[0].total || 0 },
            recentInvoices,
            announcements: []
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi dữ liệu Admin Dashboard." });
    }
});

// FIX CHÍNH CHU: Tìm ID cư dân thông qua số phòng (Hỗ trợ AdminFeeCalculation)
app.post('/api/admin/invoices/generate', authenticateToken, requireAdmin, async (req, res) => {
    const { residentId, monthYear, fees } = req.body; 
    let targetId = null;

    try {
        // Tìm kiếm ID thật của cư dân dựa theo cột số phòng room_number
        const [userCheck] = await dbPool.query('SELECT id FROM users WHERE room_number = ? OR id = ? LIMIT 1', [residentId, residentId]);
        
        if (userCheck.length > 0) {
            targetId = userCheck[0].id;
        } else {
            return res.status(404).json({ message: `Không tìm thấy cư dân thuộc số phòng: ${residentId}` });
        }

        const invoiceId = `INV-${Date.now()}`;
        const title = `Hóa đơn tổng hợp tháng ${monthYear}`;
        const totalAmount = fees.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        await dbPool.query('INSERT INTO invoices (id, resident_id, title, total_amount, status) VALUES (?, ?, ?, ?, "unpaid")', [invoiceId, targetId, title, totalAmount]);
        
        for (const fee of fees) {
            await dbPool.query('INSERT INTO invoice_details (invoice_id, fee_type, fee_name, fee_desc, amount) VALUES (?, ?, ?, ?, ?)', [invoiceId, fee.type, fee.name, fee.desc, fee.amount]);
        }

        res.status(201).json({ success: true, message: "Tạo hóa đơn thành công.", invoiceId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi hệ thống khi tạo hóa đơn." });
    }
});

// FIX CHÍNH CHU: Đồng bộ hoa văn chữ cái đầu cho AdminDisputes.jsx (.map không bị crash)
app.get('/api/admin/disputes', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await dbPool.query(`
            SELECT d.id, u.room_number as room, u.full_name as resident, d.title, d.description as \`desc\`,
            CASE 
                WHEN d.status = 'resolved' THEN 'Resolved'
                WHEN d.status = 'rejected' THEN 'Rejected'
                ELSE 'Pending'
            END as status
            FROM disputes d JOIN users u ON d.resident_id = u.id ORDER BY d.created_at DESC
        `);
        res.json(rows); // Trả về dạng mảng phẳng chuẩn xác Front-end đang đợi
    } catch (err) {
        res.status(500).json({ message: "Lỗi đồng bộ danh sách phản nghị." });
    }
});

app.put('/api/admin/disputes/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const dbStatus = status === 'Resolved' ? 'resolved' : 'rejected';
    try {
        await dbPool.query('UPDATE disputes SET status = ? WHERE id = ?', [dbStatus, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Lỗi cập nhật." });
    }
});

app.get('/api/admin/residents', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT id, full_name as name, room_number as room, phone, username as email, "Paid" as status, 1 as members FROM users WHERE role = "resident" ORDER BY room_number ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi." });
    }
});

app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [collected] = await dbPool.query('SELECT SUM(total_amount) as total FROM invoices WHERE status = "paid"');
        const [unpaid] = await dbPool.query('SELECT SUM(total_amount) as total FROM invoices WHERE status = "unpaid"');
        res.json({
            summary: { totalCollected: Number(collected[0].total || 0), totalUnpaid: Number(unpaid[0].total || 0) },
            chartItems: [
                { title: "Phí quản lý vận hành", amount: 4500000, ratio: 45, color: "bg-blue-600" },
                { title: "Hệ thống điện tòa nhà", amount: 3200000, ratio: 32, color: "bg-amber-500" }
            ]
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi." });
    }
});

app.listen(PORT, () => {
    console.log(`[OK] Server vận hành mượt mà tại cổng: http://localhost:${PORT}`);
});