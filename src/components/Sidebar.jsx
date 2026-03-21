import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  LayoutDashboard,
  Users,
  Banknote,
  ShieldCheck,
  Briefcase,
  Activity,
  Wrench
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} /> },
    { name: 'Workers', path: '/workers', icon: <ShieldCheck size={22} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={22} /> },
    { name: 'Active Jobs', path: '/jobs', icon: <Briefcase size={22} /> },
    { name: 'Pricing', path: '/pricing', icon: <Banknote size={22} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shadow-2xl">
      {/* Logo Section */}
      <div className="p-8">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Techni Logo" className="h-10 w-auto object-contain drop-shadow-lg" />
          <h2 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent italic">
            TECHNI
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 ml-1">Admin Panel</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.15)]'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgb(59,130,246)]" />
              )}

              <span className={`${isActive ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors duration-300'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info / System Status Only */}
      <div className="p-6 border-t border-slate-800/50 bg-slate-900/50">
        <div className="bg-slate-800/20 p-5 rounded-[2rem] border border-slate-800/40 shadow-inner">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-3 italic">Core Connection</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-60" />
              </div>
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-tighter">Verified Node</span>
            </div>
            <Activity size={12} className="text-slate-700" />
          </div>
          <p className="text-[8px] text-slate-600 font-bold mt-3 tracking-widest">v1.0.4 SECURED</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;