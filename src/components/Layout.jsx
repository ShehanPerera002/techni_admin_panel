import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;