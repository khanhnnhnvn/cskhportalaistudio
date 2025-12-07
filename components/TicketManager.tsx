import React, { useState } from 'react';
import { Ticket, TicketStatus, SystemConfig, User } from '../types';
import { Plus, Edit, Trash2, Search, X, Filter, Save } from 'lucide-react';

interface TicketManagerProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  config: SystemConfig;
  users: User[];
  currentUser: User;
}

export const TicketManager: React.FC<TicketManagerProps> = ({ tickets, setTickets, config, users, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTicket: Ticket = {
      id: editingTicket ? editingTicket.id : `T-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000)}`,
      receivedDate: formData.get('receivedDate') as string,
      assigneeId: formData.get('assigneeId') as string,
      channelId: formData.get('channelId') as string,
      serviceId: formData.get('serviceId') as string,
      complaintTypeId: formData.get('complaintTypeId') as string,
      complaintGroupId: formData.get('complaintGroupId') as string,
      content: formData.get('content') as string,
      processingDepartmentId: formData.get('processingDepartmentId') as string,
      slaCodeId: formData.get('slaCodeId') as string,
      collaborationStatus: formData.get('collaborationStatus') as string,
      responseTime: formData.get('responseTime') ? new Date(formData.get('responseTime') as string).toISOString() : null,
      closedTime: formData.get('closedTime') ? new Date(formData.get('closedTime') as string).toISOString() : null,
      status: formData.get('status') as TicketStatus,
      organization: formData.get('organization') as string,
    };

    if (editingTicket) {
      setTickets(prev => prev.map(t => t.id === editingTicket.id ? newTicket : t));
    } else {
      setTickets(prev => [newTicket, ...prev]);
    }
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa ticket này?')) {
      setTickets(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDepartmentName = (id: string) => config.departments.find(d => d.id === id)?.name || 'N/A';
  const getAssigneeName = (id: string) => users.find(u => u.id === id)?.fullName || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Ticket</h2>
        <button 
          onClick={() => { setEditingTicket(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Thêm mới
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo ID, nội dung, tổ chức..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-50">
          <Filter size={20} /> Lọc nâng cao
        </button>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-semibold uppercase">
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">Ngày nhận</th>
                <th className="p-4 border-b">Nội dung</th>
                <th className="p-4 border-b">Trạng thái</th>
                <th className="p-4 border-b">Người xử lý</th>
                <th className="p-4 border-b">Phòng ban</th>
                <th className="p-4 border-b text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors text-sm text-gray-700">
                  <td className="p-4 font-medium text-blue-600">{ticket.id}</td>
                  <td className="p-4">{ticket.receivedDate}</td>
                  <td className="p-4 max-w-xs truncate" title={ticket.content}>{ticket.content}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      ticket.status === TicketStatus.DONE ? 'bg-green-100 text-green-700 border-green-200' :
                      ticket.status === TicketStatus.PROCESSING ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      ticket.status === TicketStatus.PENDING ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-purple-100 text-purple-700 border-purple-200'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4">{getAssigneeName(ticket.assigneeId)}</td>
                  <td className="p-4">{getDepartmentName(ticket.processingDepartmentId)}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => { setEditingTicket(ticket); setIsModalOpen(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ticket.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Không tìm thấy dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingTicket ? 'Cập nhật Ticket' : 'Thêm mới Ticket'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Group 1: General Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-600 border-b pb-2">Thông tin chung</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhận</label>
                  <input type="date" name="receivedDate" required defaultValue={editingTicket?.receivedDate || new Date().toISOString().split('T')[0]} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổ chức / Khách hàng</label>
                  <input type="text" name="organization" required defaultValue={editingTicket?.organization} className="w-full border rounded p-2" placeholder="Tên khách hàng" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người tiếp nhận</label>
                  <select name="assigneeId" defaultValue={editingTicket?.assigneeId || currentUser.id} className="w-full border rounded p-2 bg-gray-50">
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kênh tiếp nhận</label>
                  <select name="channelId" defaultValue={editingTicket?.channelId} className="w-full border rounded p-2">
                    {config.channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ</label>
                  <select name="serviceId" defaultValue={editingTicket?.serviceId} className="w-full border rounded p-2">
                    {config.services.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Group 2: Complaint Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-600 border-b pb-2">Chi tiết khiếu nại</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại khiếu nại</label>
                        <select name="complaintTypeId" defaultValue={editingTicket?.complaintTypeId} className="w-full border rounded p-2">
                            {config.complaintTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm khiếu nại</label>
                        <select name="complaintGroupId" defaultValue={editingTicket?.complaintGroupId} className="w-full border rounded p-2">
                            {config.complaintGroups.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung xử lý</label>
                  <textarea name="content" required defaultValue={editingTicket?.content} rows={3} className="w-full border rounded p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã SLA</label>
                  <select name="slaCodeId" defaultValue={editingTicket?.slaCodeId} className="w-full border rounded p-2">
                    {config.slaCodes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.durationHours}h)</option>)}
                  </select>
                </div>
              </div>

               {/* Group 3: Processing */}
               <div className="space-y-4 md:col-span-2">
                <h4 className="font-semibold text-blue-600 border-b pb-2">Tiến độ xử lý</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bộ phận xử lý</label>
                        <select name="processingDepartmentId" defaultValue={editingTicket?.processingDepartmentId} className="w-full border rounded p-2">
                            {config.departments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng phối hợp</label>
                        <input type="text" name="collaborationStatus" defaultValue={editingTicket?.collaborationStatus} className="w-full border rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái ticket</label>
                        <select name="status" defaultValue={editingTicket?.status || TicketStatus.NEW} className="w-full border rounded p-2 font-medium">
                            {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian phản hồi</label>
                        <input type="datetime-local" name="responseTime" defaultValue={editingTicket?.responseTime?.slice(0, 16)} className="w-full border rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian đóng</label>
                        <input type="datetime-local" name="closedTime" defaultValue={editingTicket?.closedTime?.slice(0, 16)} className="w-full border rounded p-2" />
                    </div>
                </div>
               </div>

              <div className="md:col-span-2 flex justify-end gap-4 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Save size={18} /> Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};