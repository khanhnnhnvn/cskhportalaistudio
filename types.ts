export enum TicketStatus {
  NEW = 'Mới',
  PROCESSING = 'Đang xử lý',
  PENDING = 'Chờ xử lý',
  DONE = 'Đã đóng',
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  departmentId: string;
  role: 'admin' | 'staff';
}

export interface Ticket {
  id: string;
  receivedDate: string; // ISO Date
  assigneeId: string;
  channelId: string;
  serviceId: string;
  complaintTypeId: string;
  complaintGroupId: string;
  content: string;
  processingDepartmentId: string;
  slaCodeId: string;
  collaborationStatus: string;
  responseTime: string | null; // ISO DateTime
  closedTime: string | null; // ISO DateTime
  status: TicketStatus;
  organization: string;
}

export interface ConfigItem {
  id: string;
  name: string;
  description?: string;
}

export interface SLACode extends ConfigItem {
  durationHours: number;
}

export interface SystemConfig {
  departments: ConfigItem[];
  channels: ConfigItem[];
  services: ConfigItem[];
  complaintTypes: ConfigItem[];
  complaintGroups: ConfigItem[];
  slaCodes: SLACode[];
}

export interface DashboardStats {
  totalToday: number;
  totalMonth: number;
  pendingTotal: number;
  byChannel: { name: string; value: number }[];
}