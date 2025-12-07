import React, { useMemo } from 'react';
import { Ticket, TicketStatus, SystemConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, Clock, Inbox } from 'lucide-react';

interface DashboardProps {
  tickets: Ticket[];
  config: SystemConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ tickets, config }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const todayTickets = tickets.filter((t) => t.receivedDate === today);
    const monthTickets = tickets.filter((t) => {
      const d = new Date(t.receivedDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const pending = tickets.filter((t) => t.status !== TicketStatus.DONE);
    
    // Group by channel
    const channelCounts: Record<string, number> = {};
    config.channels.forEach(c => channelCounts[c.name] = 0);
    
    monthTickets.forEach(t => {
        const chName = config.channels.find(c => c.id === t.channelId)?.name || 'Unknown';
        channelCounts[chName] = (channelCounts[chName] || 0) + 1;
    });

    const byChannelData = Object.entries(channelCounts).map(([name, value]) => ({ name, value }));

    // Group by Status
    const statusCounts = [
        { name: 'Hoàn thành', value: tickets.filter(t => t.status === TicketStatus.DONE).length, color: '#10B981' },
        { name: 'Đang xử lý', value: tickets.filter(t => t.status === TicketStatus.PROCESSING).length, color: '#3B82F6' },
        { name: 'Chờ xử lý', value: tickets.filter(t => t.status === TicketStatus.PENDING).length, color: '#F59E0B' },
        { name: 'Mới', value: tickets.filter(t => t.status === TicketStatus.NEW).length, color: '#6366F1' },
    ];

    return {
      todayCount: todayTickets.length,
      monthCount: monthTickets.length,
      pendingCount: pending.length,
      byChannelData,
      statusCounts
    };
  }, [tickets, config]);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-800">Báo cáo tổng hợp</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Tiếp nhận hôm nay" 
            value={stats.todayCount} 
            icon={Inbox} 
            color="bg-blue-600" 
        />
        <StatCard 
            title="Tiếp nhận trong tháng" 
            value={stats.monthCount} 
            icon={Clock} 
            color="bg-indigo-600" 
        />
        <StatCard 
            title="Chưa xử lý (Tồn)" 
            value={stats.pendingCount} 
            icon={AlertCircle} 
            color="bg-amber-500" 
        />
        <StatCard 
            title="Đã hoàn thành" 
            value={stats.statusCounts.find(s => s.name === 'Hoàn thành')?.value || 0} 
            icon={CheckCircle} 
            color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kênh tiếp nhận (Tháng này)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byChannelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f3f4f6'}}
                />
                <Bar dataKey="value" name="Số lượng" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tình trạng xử lý</h3>
          <div className="h-80 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={stats.statusCounts}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {stats.statusCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};