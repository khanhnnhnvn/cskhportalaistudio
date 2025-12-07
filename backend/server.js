const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- Helper Functions ---
// Chuyển đổi snake_case từ DB sang camelCase cho Frontend
// Cập nhật: Format ngày tháng chuẩn YYYY-MM-DD cho input type="date"
const mapTicketToFrontend = (t) => {
    // Helper format date YYYY-MM-DD
    const formatDate = (dateVal) => {
        if (!dateVal) return '';
        // Nếu là object Date của JS
        if (dateVal instanceof Date) {
            return dateVal.toISOString().split('T')[0];
        }
        // Nếu là string, lấy phần ngày
        return String(dateVal).split('T')[0];
    };

    return {
        id: t.id,
        receivedDate: formatDate(t.received_date), 
        assigneeId: t.assignee_id,
        channelId: t.channel_id,
        serviceId: t.service_id,
        complaintTypeId: t.complaint_type_id,
        complaintGroupId: t.complaint_group_id,
        content: t.content,
        processingDepartmentId: t.processing_department_id,
        slaCodeId: t.sla_code_id,
        collaborationStatus: t.collaboration_status,
        responseTime: t.response_time, // Giữ nguyên ISO string cho datetime-local
        closedTime: t.closed_time,     // Giữ nguyên ISO string cho datetime-local
        status: t.status,
        organization: t.organization
    };
};

const mapUserToFrontend = (u) => ({
    id: u.id,
    username: u.username,
    fullName: u.full_name,
    departmentId: u.department_id,
    role: u.role
});

// --- ROUTES ---

// 1. Get System Config (Gộp tất cả bảng danh mục)
app.get('/api/config', async (req, res) => {
    try {
        const [departments] = await db.query('SELECT * FROM departments');
        const [channels] = await db.query('SELECT * FROM channels');
        const [services] = await db.query('SELECT * FROM services');
        const [complaintTypes] = await db.query('SELECT * FROM complaint_types');
        const [complaintGroups] = await db.query('SELECT * FROM complaint_groups');
        const [slaCodes] = await db.query('SELECT id, name, description, duration_hours as durationHours FROM sla_codes');

        res.json({
            departments,
            channels,
            services,
            complaintTypes,
            complaintGroups,
            slaCodes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Tickets CRUD
app.get('/api/tickets', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tickets ORDER BY created_at DESC');
        res.json(rows.map(mapTicketToFrontend));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tickets', async (req, res) => {
    const t = req.body;
    try {
        const sql = `
            INSERT INTO tickets (
                id, received_date, assignee_id, channel_id, service_id, 
                complaint_type_id, complaint_group_id, content, processing_department_id,
                sla_code_id, collaboration_status, response_time, closed_time, status, organization
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            t.id, t.receivedDate, t.assigneeId, t.channelId, t.serviceId,
            t.complaintTypeId, t.complaintGroupId, t.content, t.processingDepartmentId,
            t.slaCodeId, t.collaborationStatus, t.responseTime, t.closedTime, t.status, t.organization
        ];
        
        await db.query(sql, params);
        res.status(201).json({ message: 'Ticket created successfully', id: t.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tickets/:id', async (req, res) => {
    const t = req.body;
    const { id } = req.params;
    try {
        const sql = `
            UPDATE tickets SET 
                received_date = ?, assignee_id = ?, channel_id = ?, service_id = ?, 
                complaint_type_id = ?, complaint_group_id = ?, content = ?, processing_department_id = ?,
                sla_code_id = ?, collaboration_status = ?, response_time = ?, closed_time = ?, 
                status = ?, organization = ?
            WHERE id = ?
        `;
        const params = [
            t.receivedDate, t.assigneeId, t.channelId, t.serviceId,
            t.complaintTypeId, t.complaintGroupId, t.content, t.processingDepartmentId,
            t.slaCodeId, t.collaborationStatus, t.responseTime, t.closedTime, 
            t.status, t.organization, id
        ];
        
        await db.query(sql, params);
        res.json({ message: 'Ticket updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tickets/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
        res.json({ message: 'Ticket deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Users CRUD
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows.map(mapUserToFrontend));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    const u = req.body;
    try {
        await db.query(
            'INSERT INTO users (id, username, full_name, department_id, role) VALUES (?, ?, ?, ?, ?)',
            [u.id, u.username, u.fullName, u.departmentId, u.role]
        );
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Config CRUD
// Helper để xử lý insert động vào các bảng config
const handleConfigInsert = async (table, data) => {
    // Chỉ insert các trường cơ bản
    const sql = `INSERT INTO ${table} (id, name, description) VALUES (?, ?, ?)`;
    await db.query(sql, [data.id, data.name, data.description]);
};

app.post('/api/config/:type', async (req, res) => {
    const { type } = req.params;
    const data = req.body;
    
    // Map endpoint type sang tên bảng
    const tableMap = {
        'departments': 'departments',
        'channels': 'channels',
        'services': 'services',
        'complaintTypes': 'complaint_types',
        'complaintGroups': 'complaint_groups',
        'slaCodes': 'sla_codes'
    };

    const tableName = tableMap[type];
    if (!tableName) return res.status(400).json({ error: 'Invalid config type' });

    try {
        if (type === 'slaCodes') {
            await db.query(
                'INSERT INTO sla_codes (id, name, description, duration_hours) VALUES (?, ?, ?, ?)',
                [data.id, data.name, data.description, data.durationHours]
            );
        } else {
            await handleConfigInsert(tableName, data);
        }
        res.status(201).json({ message: 'Config created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/config/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const tableMap = {
        'departments': 'departments',
        'channels': 'channels',
        'services': 'services',
        'complaintTypes': 'complaint_types',
        'complaintGroups': 'complaint_groups',
        'slaCodes': 'sla_codes'
    };
    
    const tableName = tableMap[type];
    if (!tableName) return res.status(400).json({ error: 'Invalid config type' });

    try {
        await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/config/:type/:id', async (req, res) => {
     // Bạn có thể thêm API update config ở đây nếu cần
     res.status(501).json({message: "Not implemented yet"});
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});