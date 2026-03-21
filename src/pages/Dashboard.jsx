import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Users, ShieldCheck, Zap, TrendingUp, Activity, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ customers: 0, workers: 0, activeJobs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Customers Count (All)
    const unsubCustomers = onSnapshot(collection(db, "customers"), (s) =>
      setStats(p => ({ ...p, customers: s.size }))
    );

    // 2. Verified Workers Count Only 
    const unsubWorkers = onSnapshot(collection(db, "workers"), (snapshot) => {
      const verifiedOnly = snapshot.docs.filter(doc => {
        const status = doc.data().verificationStatus?.toLowerCase();
        return status === 'verified';
      }).length;

      setStats(p => ({ ...p, workers: verifiedOnly }));
    });

    // 3. Active Jobs Count
    const unsubJobs = onSnapshot(collection(db, "jobRequests"), (snapshot) => {
      const activeOnly = snapshot.docs.filter(doc => {
        const s = doc.data().status?.toLowerCase();
        return s !== 'completed' && s !== 'cancelled' && s !== '';
      }).length;

      setStats(prev => ({ ...prev, activeJobs: activeOnly }));
      setLoading(false);
    });

    return () => { unsubCustomers(); unsubWorkers(); unsubJobs(); };
  }, []);

  const handleSignOut = async () => {
    try {
      if (window.confirm("Are you sure you want to sign out from TECHNI COMMAND?")) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic uppercase tracking-tighter">
            TECHNI COMMAND
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Real-time System Analytics</p>
            {loading && <Activity className="animate-spin text-indigo-500" size={14} />}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="group flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-red-500/50 px-6 py-3 rounded-2xl transition-all shadow-xl shadow-black/20"
        >
          <div className="flex flex-col items-end">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none">Admin Session</span>
            <span className="text-red-400 text-[11px] font-bold uppercase tracking-tight group-hover:text-red-500 transition-colors">Sign Out</span>
          </div>
          <div className="p-2 bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
            <LogOut size={18} />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Customers" value={stats.customers} icon={<Users size={28} />} color="purple" trend="Active Base" />
        { }
        <StatCard title="Verified Workers" value={stats.workers} icon={<ShieldCheck size={28} />} color="emerald" trend="Fleet Strength" />
        <StatCard title="Live Active Jobs" value={stats.activeJobs} icon={<Zap size={28} />} color="blue" trend="Live Sync" />
      </div>

      <div className="mt-10 p-8 bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 animate-pulse">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-tighter italic">System Integrity</h3>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">Monitoring verified nodes and active traffic across Firebase clusters.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Core Engine Active</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => {
  const colorMap = {
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-8 rounded-[2.5rem] relative group hover:border-indigo-500/40 transition-all hover:translate-y-[-4px] duration-300 shadow-2xl shadow-black/40">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${colorMap[color]}`}>{icon}</div>
      <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-5xl font-black text-white italic tracking-tighter">{value}</p>
      <div className={`mt-6 text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-xl w-fit ${colorMap[color]}`}>{trend}</div>
    </div>
  );
};

export default Dashboard;