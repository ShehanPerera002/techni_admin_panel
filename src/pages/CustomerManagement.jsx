import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import {
  Search, Mail, Phone, Calendar, MapPin, Eye, X, User, ExternalLink, Navigation, LocateFixed
} from 'lucide-react';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "customers"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'verified' : 'blocked';
    if (window.confirm(`Change status to ${newStatus}?`)) {
      try {
        await updateDoc(doc(db, "customers", id), { verificationStatus: newStatus });
        setSelectedCustomer(null);
      } catch (err) { console.error(err); }
    }
  };

  const filtered = customers.filter(c =>
    (c.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic uppercase">
            Customer Registry
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Live Database: Map Sync Active</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full bg-slate-900 border border-slate-800 text-white pl-12 pr-4 py-2.5 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 animate-pulse font-bold tracking-widest text-xs uppercase text-center py-20">Syncing with Cloud...</p>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-800/40 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Client Profile</th>
                <th className="px-8 py-5">Phone</th>
                <th className="px-8 py-5">Geo-Location</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.ProfileImage || 'https://via.placeholder.com/150'}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        alt="pfp"
                      />
                      <div>
                        <p className="text-slate-200 font-bold text-sm">{user.fullName || 'Unnamed'}</p>
                        <p className="text-slate-600 text-[10px] font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-400 text-xs font-mono">{user.phone}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <LocateFixed size={12} className={user.latitude ? "text-emerald-500" : "text-slate-700"} />
                      <span className="text-[10px] font-bold">
                        {user.latitude ? `${user.latitude.toFixed(3)}, ${user.longitude.toFixed(3)}` : 'No GPS'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${user.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {user.verificationStatus || 'unverified'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setSelectedCustomer(user)} className="p-2.5 bg-slate-800 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-4">
                <img src={selectedCustomer.ProfileImage} className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-xl" />
                <div>
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">{selectedCustomer.fullName}</h2>
                  <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 mt-1">
                    <Navigation size={10} className="text-purple-500" /> UID: {selectedCustomer.uid}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-all"><X size={24} /></button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoItem label="Email Address" value={selectedCustomer.email} icon={<Mail size={14} />} />
                <InfoItem label="Phone Number" value={selectedCustomer.phone} icon={<Phone size={14} />} />
                <div className="md:col-span-2">
                  <InfoItem label="Current Address" value={selectedCustomer.address} icon={<MapPin size={14} />} />
                </div>
                <InfoItem label="Birth Date" value={selectedCustomer.birthDate} icon={<Calendar size={14} />} />
                <InfoItem label="Account Type" value={selectedCustomer.role} icon={<User size={14} />} />
              </div>

              {/* GPS TRACKING BOX */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[2rem]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <LocateFixed size={14} className="animate-pulse" /> Live Signal Coordinates
                    </h4>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-slate-500 text-[9px] font-bold">LATITUDE</p>
                        <p className="text-white font-mono text-sm">{selectedCustomer.latitude || '0.000000'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[9px] font-bold">LONGITUDE</p>
                        <p className="text-white font-mono text-sm">{selectedCustomer.longitude || '0.000000'}</p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${selectedCustomer.latitude},${selectedCustomer.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-lg shadow-indigo-900/20"
                  >
                    Track Current Location <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-800/50 flex justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => toggleStatus(selectedCustomer.id, selectedCustomer.verificationStatus)}
                className={`px-10 py-3 rounded-2xl font-black text-xs uppercase transition-all shadow-xl ${selectedCustomer.verificationStatus === 'blocked'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white'
                  }`}
              >
                {selectedCustomer.verificationStatus === 'blocked' ? 'Unblock Customer' : 'Block Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
    <p className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-2 mb-1">{icon} {label}</p>
    <p className="text-slate-200 text-sm font-semibold">{value || 'N/A'}</p>
  </div>
);

export default CustomerManagement;