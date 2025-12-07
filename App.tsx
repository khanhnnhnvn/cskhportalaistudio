import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TicketManager } from './components/TicketManager';
import { UserManager } from './components/UserManager';
import { ConfigManager } from './components/ConfigManager';
import { INITIAL_CONFIG, INITIAL_TICKETS, INITIAL_USERS, CURRENT_USER } from './constants';
import { SystemConfig, Ticket, User } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // App State - In a real app, this would be Redux or Context + API
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard tickets={tickets} config={config} />;
      case 'tickets':
        return (
          <TicketManager 
            tickets={tickets} 
            setTickets={setTickets} 
            config={config} 
            users={users}
            currentUser={CURRENT_USER}
          />
        );
      case 'users':
        return (
          <UserManager 
            users={users} 
            setUsers={setUsers} 
            config={config} 
          />
        );
      case 'config':
        return (
          <ConfigManager 
            config={config} 
            setConfig={setConfig} 
          />
        );
      default:
        return <Dashboard tickets={tickets} config={config} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header Area */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-gray-500 text-sm">Xin chào,</h2>
                <h1 className="text-xl font-bold text-gray-800">{CURRENT_USER.fullName}</h1>
            </div>
            <div className="flex items-center gap-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    {config.departments.find(d => d.id === CURRENT_USER.departmentId)?.name}
                </span>
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {CURRENT_USER.fullName.charAt(0)}
                </div>
            </div>
        </header>

        {/* Dynamic Content */}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;