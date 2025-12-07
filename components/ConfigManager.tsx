import React, { useState } from 'react';
import { SystemConfig, ConfigItem, SLACode } from '../types';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface ConfigManagerProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

type ConfigKey = keyof SystemConfig;

export const ConfigManager: React.FC<ConfigManagerProps> = ({ config, setConfig }) => {
  const [activeTab, setActiveTab] = useState<ConfigKey>('departments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | SLACode | null>(null);

  const tabs: { key: ConfigKey; label: string }[] = [
    { key: 'departments', label: 'Phòng ban' },
    { key: 'channels', label: 'Kênh tiếp nhận' },
    { key: 'services', label: 'Dịch vụ' },
    { key: 'complaintTypes', label: 'Loại khiếu nại' },
    { key: 'complaintGroups', label: 'Nhóm khiếu nại' },
    { key: 'slaCodes', label: 'Mã SLA' },
  ];

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Construct base object
    const baseItem = {
      id: editingItem ? editingItem.id : `${activeTab.slice(0,3)}-${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    // Add specific fields if SLA
    let newItem: ConfigItem | SLACode = baseItem;
    if (activeTab === 'slaCodes') {
        newItem = {
            ...baseItem,
            durationHours: Number(formData.get('durationHours')),
        } as SLACode;
    }

    setConfig(prev => {
        const list = prev[activeTab] as any[];
        const updatedList = editingItem 
            ? list.map(item => item.id === editingItem.id ? newItem : item)
            : [...list, newItem];
        return { ...prev, [activeTab]: updatedList };
    });

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa mục cấu hình này?')) {
        setConfig(prev => ({
            ...prev,
            [activeTab]: (prev[activeTab] as any[]).filter(item => item.id !== id)
        }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Cấu hình hệ thống</h2>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 gap-1 pb-1">
        {tabs.map(tab => (
            <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.key 
                    ? 'bg-white border border-b-0 border-gray-200 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">{tabs.find(t => t.key === activeTab)?.label}</h3>
            <button 
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
            >
                <Plus size={16} /> Thêm mới
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr>
                        <th className="p-3 border-b">Tên</th>
                        <th className="p-3 border-b">Mô tả</th>
                        {activeTab === 'slaCodes' && <th className="p-3 border-b">Thời gian (Giờ)</th>}
                        <th className="p-3 border-b w-24 text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {(config[activeTab] as any[]).map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">{item.name}</td>
                            <td className="p-3 text-gray-600">{item.description}</td>
                            {activeTab === 'slaCodes' && <td className="p-3 text-blue-600 font-semibold">{item.durationHours}h</td>}
                            <td className="p-3 flex justify-center gap-2">
                                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    {(config[activeTab] as any[]).length === 0 && (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">Chưa có dữ liệu</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{editingItem ? 'Cập nhật' : 'Thêm mới'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên hiển thị</label>
                <input name="name" required defaultValue={editingItem?.name} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả / Giải thích</label>
                <textarea name="description" rows={3} defaultValue={editingItem?.description} className="w-full border rounded p-2"></textarea>
              </div>
              
              {activeTab === 'slaCodes' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Thời gian xử lý (Giờ)</label>
                    <input type="number" name="durationHours" required defaultValue={(editingItem as SLACode)?.durationHours} className="w-full border rounded p-2" />
                  </div>
              )}

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