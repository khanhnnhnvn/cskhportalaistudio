import React, { useState } from 'react';
import { User, SystemConfig } from '../types';
import { Plus, Edit, Trash2, Key, Save, X } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  config: SystemConfig;
}

export const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, config }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: editingUser ? editingUser.id : `u-${Date.now()}`,
      username: formData.get('username') as string,
      fullName: formData.get('fullName') as string,
      departmentId: formData.get('departmentId') as string,
      role: formData.get('role') as 'admin' | 'staff',
    };

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? newUser : u));
    } else {
      setUsers(prev => [...prev, newUser]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa người dùng này?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleChangePassword = (userId: string) => {
    // In a real app, this would open a dialog or call an API
    alert(`Đã gửi yêu cầu đổi mật khẩu cho user ID: ${userId}`);
  };

  const getDepartmentName = (id: string) => config.departments.find(d => d.id === id)?.name || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4 border-b">Họ tên</th>
              <th className="p-4 border-b">Username</th>
              <th className="p-4 border-b">Phòng ban</th>
              <th className="p-4 border-b">Vai trò</th>
              <th className="p-4 border-b text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{user.fullName}</td>
                <td className="p-4 text-gray-600">{user.username}</td>
                <td className="p-4">{getDepartmentName(user.departmentId)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                   <button onClick={() => handleChangePassword(user.id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded" title="Đổi mật khẩu">
                    <Key size={18} />
                  </button>
                  <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Xóa">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{editingUser ? 'Sửa thông tin' : 'Thêm người dùng'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ tên</label>
                <input name="fullName" required defaultValue={editingUser?.fullName} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input name="username" required defaultValue={editingUser?.username} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phòng ban</label>
                <select name="departmentId" defaultValue={editingUser?.departmentId} className="w-full border rounded p-2">
                  {config.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vai trò</label>
                <select name="role" defaultValue={editingUser?.role || 'staff'} className="w-full border rounded p-2">
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                    <Save size={16} /> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};