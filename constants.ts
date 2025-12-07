import { SystemConfig, Ticket, TicketStatus, User } from './types';

export const INITIAL_CONFIG: SystemConfig = {
  departments: [
    { id: 'dept-1', name: 'CSKH', description: 'Phòng chăm sóc khách hàng' },
    { id: 'dept-2', name: 'Kỹ thuật', description: 'Phòng kỹ thuật hạ tầng' },
    { id: 'dept-3', name: 'Kinh doanh', description: 'Phòng kinh doanh' },
  ],
  channels: [
    { id: 'ch-1', name: 'Hotline' },
    { id: 'ch-2', name: 'Email' },
    { id: 'ch-3', name: 'Facebook' },
    { id: 'ch-4', name: 'Zalo' },
  ],
  services: [
    { id: 'srv-1', name: 'Internet cáp quang' },
    { id: 'srv-2', name: 'Truyền hình số' },
    { id: 'srv-3', name: 'Camera' },
  ],
  complaintTypes: [
    { id: 'type-1', name: 'Báo hỏng' },
    { id: 'type-2', name: 'Khiếu nại cước' },
    { id: 'type-3', name: 'Tư vấn dịch vụ' },
  ],
  complaintGroups: [
    { id: 'grp-1', name: 'Kỹ thuật' },
    { id: 'grp-2', name: 'Thái độ phục vụ' },
    { id: 'grp-3', name: 'Quy trình' },
  ],
  slaCodes: [
    { id: 'sla-1', name: 'VIP', description: 'Khách hàng VIP, xử lý gấp', durationHours: 2 },
    { id: 'sla-2', name: 'STD', description: 'Tiêu chuẩn', durationHours: 24 },
    { id: 'sla-3', name: 'LOW', description: 'Ưu tiên thấp', durationHours: 48 },
  ],
};

export const INITIAL_USERS: User[] = [
  { id: 'u-1', username: 'admin', fullName: 'Quản trị viên', departmentId: 'dept-1', role: 'admin' },
  { id: 'u-2', username: 'nv_kythuat', fullName: 'Nguyễn Văn A', departmentId: 'dept-2', role: 'staff' },
  { id: 'u-3', username: 'nv_cskh', fullName: 'Trần Thị B', departmentId: 'dept-1', role: 'staff' },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-20231025-001',
    receivedDate: new Date().toISOString().split('T')[0],
    assigneeId: 'u-1',
    channelId: 'ch-1',
    serviceId: 'srv-1',
    complaintTypeId: 'type-1',
    complaintGroupId: 'grp-1',
    content: 'Mạng chậm vào buổi tối',
    processingDepartmentId: 'dept-2',
    slaCodeId: 'sla-2',
    collaborationStatus: 'Đã chuyển kỹ thuật',
    responseTime: null,
    closedTime: null,
    status: TicketStatus.PROCESSING,
    organization: 'Công ty ABC',
  },
  {
    id: 'T-20231024-002',
    receivedDate: '2023-10-24',
    assigneeId: 'u-3',
    channelId: 'ch-2',
    serviceId: 'srv-2',
    complaintTypeId: 'type-2',
    complaintGroupId: 'grp-3',
    content: 'Sai cước phí tháng 9',
    processingDepartmentId: 'dept-1',
    slaCodeId: 'sla-1',
    collaborationStatus: 'Tự xử lý',
    responseTime: '2023-10-24T10:00:00.000Z',
    closedTime: '2023-10-24T14:00:00.000Z',
    status: TicketStatus.DONE,
    organization: 'Hộ gia đình X',
  },
];

export const CURRENT_USER: User = INITIAL_USERS[0]; // Simulating logged in user