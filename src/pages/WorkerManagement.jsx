import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import {
  Search, Eye, X, Phone, Shield, MapPin, Calendar, Star, FileText, ExternalLink, Award, User, Info, CheckCircle2, AlertCircle
} from 'lucide-react';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'workers'), (snapshot) => {
      setWorkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleUpdateStatus = async (workerId, newStatus) => {
    const actions = {
      'verified': "Approve and Verify this worker?",
      'rejected': "Reject this application?",
      'blocked': "Block this professional from the platform?"
    };

    if (window.confirm(actions[newStatus] || "Change status?")) {
      try {
        await updateDoc(doc(db, 'workers', workerId), {
          verificationStatus: newStatus
        });
        setSelectedWorker(null);
      } catch (error) {
        console.error("Update Error:", error);
      }
    }
  };

  // මචං මෙතන තමයි වැදගත්ම වෙනස තියෙන්නේ 👇
  const filteredWorkers = workers.filter(w => {
    // Database එකේ status එක මොන විදිහට තිබුණත් (Pending/pending) lowercase කරලා ගන්නවා
    const status = (w.verificationStatus || 'pending').toLowerCase();

    // Tab එක අනුව filter කිරීම
    const matchesTab = activeTab === 'pending'
      ? status === 'pending'
      : status !== 'pending'; // Verified, Blocked, Rejected ඔක්කොම Active Registry එකට එනවා

    const matchesSearch = (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.phoneNumber || '').includes(searchQuery);

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-indigo-500 font-black italic">
        SYNCING WORKER REGISTRY...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic uppercase tracking-tighter">Worker Fleet</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Professional Verification & Control</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search Name/Phone..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-[11px] text-white focus:outline-none focus:border-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-xl">
          <button onClick={() => setActiveTab('pending')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'pending' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-500'}`}>Pending Approval</button>
          <button onClick={() => setActiveTab('verified')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'verified' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}>Active Registry</button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/40 text-slate-500 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Professional</th>
              <th className="px-8 py-5">Rating & availability</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredWorkers.length > 0 ? filteredWorkers.map(worker => (
              <tr key={worker.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img src={worker.profileUrl || 'https://via.placeholder.com/150'} className="w-12 h-12 rounded-2xl object-cover border border-slate-700 group-hover:border-indigo-500/50 transition-all" alt="pfp" />
                    <div>
                      <p className="text-slate-200 font-bold text-sm leading-tight">{worker.name}</p>
                      <p className="text-indigo-400 text-[9px] font-black uppercase mt-1 tracking-wider">{worker.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      <span className="text-slate-300 text-[11px] font-bold font-mono">{worker.averageRating || '0'}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${worker.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${worker.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : worker.verificationStatus === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : worker.verificationStatus === 'blocked' ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {worker.verificationStatus || 'pending'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => setSelectedWorker(worker)} className="p-2.5 bg-slate-800 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-8 py-10 text-center text-slate-600 text-[10px] uppercase font-bold tracking-widest">No profiles found in this category</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-6xl my-8 overflow-hidden animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

            {/* Modal Header */}
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img src={selectedWorker.profileUrl} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-indigo-600 shadow-2xl" alt="pfp" />
                  <div className={`absolute -bottom-1 -right-1 p-2 rounded-xl border-4 border-slate-900 ${selectedWorker.isOnline ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedWorker.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-indigo-400 text-[10px] font-black uppercase px-3 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">{selectedWorker.category}</span>
                    <span className="text-amber-400 text-[10px] font-black uppercase px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-1"><Star size={10} className="fill-amber-400" /> {selectedWorker.averageRating} Rating</span>
                    <span className="text-slate-400 text-[10px] font-black uppercase px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 uppercase tracking-widest">UID: {selectedWorker.uid}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedWorker(null)} className="p-4 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-[1.5rem] transition-all"><X size={24} /></button>
            </div>

            {/* Modal Body */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

              {/* Left Column: Worker Stats & Personal */}
              <div className="lg:col-span-1 space-y-6">
                <section className="bg-slate-800/20 p-6 rounded-[2rem] border border-slate-800">
                  <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2 underline underline-offset-8">Personal Records</h4>
                  <DetailItem label="NIC Number" value={selectedWorker.nic} />
                  <DetailItem label="Contact Number" value={selectedWorker.phoneNumber} />
                  <DetailItem label="Birth Date" value={selectedWorker.dob} />
                  <DetailItem label="Language Spoken" value={Array.isArray(selectedWorker.languages) ? selectedWorker.languages.join(", ") : selectedWorker.languages} />
                  <DetailItem label="Availability" value={selectedWorker.isAvailable ? "Available Now" : "Currently Busy"} />
                </section>

                <section className="bg-indigo-500/5 p-6 rounded-[2rem] border border-indigo-500/10">
                  <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={14} className="text-red-500" /> Current Geo-Position</h4>
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <p className="text-slate-400 text-[10px] font-mono leading-relaxed">
                        Lat: <span className="text-white font-bold">{selectedWorker.lat || '0.0000'}</span><br />
                        Lng: <span className="text-white font-bold">{selectedWorker.lng || '0.0000'}</span>
                      </p>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${selectedWorker.lat},${selectedWorker.lng}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black text-[11px] font-black rounded-2xl hover:bg-slate-200 transition-all uppercase shadow-lg shadow-white/5"
                    >
                      Track Live Location <ExternalLink size={14} />
                    </a>
                  </div>
                </section>
              </div>

              {/* Center/Right Column: Verification Media */}
              <div className="lg:col-span-3 space-y-8">
                <div>
                  <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2"><Shield size={14} className="text-emerald-500" /> Identity Verification Media</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DocBox label="NIC Front View" url={selectedWorker.nicFrontUrl} />
                    <DocBox label="NIC Back View" url={selectedWorker.nicBackUrl} />
                    <DocBox label="Police Clearance Report" url={selectedWorker.policeReportUrl} isMain />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><Award size={14} /> Professional Qualifications</h4>
                    <span className="bg-amber-500/10 text-amber-500 text-[9px] px-3 py-1 rounded-full font-black border border-amber-500/20">
                      {selectedWorker.certificates?.length || 0} Certificates Uploaded
                    </span>
                  </div>

                  {selectedWorker.certificates && selectedWorker.certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedWorker.certificates.map((certUrl, index) => (
                        <DocBox key={index} label={`Certificate 0${index + 1}`} url={certUrl} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-center bg-slate-800/10">
                      <AlertCircle size={30} className="mx-auto text-slate-700 mb-3" />
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No professional certificates found in database</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-8 bg-slate-800/50 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3 text-slate-500">
                <Info size={16} />
                <p className="text-[10px] font-bold uppercase">Actions recorded for audit: <span className="text-slate-400">{new Date().toLocaleDateString()}</span></p>
              </div>
              <div className="flex gap-4">
                {/* මචං මෙතන තමයි සැබෑ verificationStatus එක චෙක් කරලා බොත්තම් පෙන්වන්නේ 👇 */}
                {(selectedWorker.verificationStatus === 'pending' || !selectedWorker.verificationStatus) ? (
                  <>
                    <button onClick={() => handleUpdateStatus(selectedWorker.id, 'rejected')} className="px-10 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[11px] uppercase hover:bg-red-600 hover:text-white transition-all">Reject & Remove</button>
                    <button onClick={() => handleUpdateStatus(selectedWorker.id, 'verified')} className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase shadow-2xl shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center gap-2"><CheckCircle2 size={16} /> Approve Professional</button>
                  </>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedWorker.id, selectedWorker.verificationStatus === 'blocked' ? 'verified' : 'blocked')}
                    className={`px-12 py-4 rounded-2xl font-black text-[11px] uppercase transition-all shadow-xl ${selectedWorker.verificationStatus === 'blocked' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'}`}
                  >
                    {selectedWorker.verificationStatus === 'blocked' ? 'Restore Professional Access' : 'Permanent Block Access'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub Components (වෙනස් කළේ නැහැ)
const DetailItem = ({ label, value }) => (
  <div className="mb-5 group">
    <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider mb-1 group-hover:text-indigo-400 transition-colors">{label}</p>
    <p className="text-slate-100 text-[13px] font-bold tracking-tight">{value || 'N/A'}</p>
  </div>
);

const DocBox = ({ label, url, isMain }) => (
  <div className={`space-y-3 group ${isMain ? 'md:col-span-2 lg:col-span-1' : ''}`}>
    <div className="flex items-center justify-between px-1">
      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 group-hover:text-slate-300 transition-colors"><FileText size={10} /> {label}</p>
      {url && <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded uppercase font-black">Digital Copy</span>}
    </div>
    <a href={url} target="_blank" rel="noreferrer" className="block aspect-[16/10] bg-slate-950 rounded-[1.8rem] overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all relative group/img shadow-xl">
      {url ? (
        <>
          <img src={url} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 opacity-70 group-hover/img:opacity-100" alt={label} />
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all bg-slate-900/60 backdrop-blur-[2px]">
            <div className="bg-white text-black p-3 rounded-2xl shadow-2xl">
              <ExternalLink size={20} />
            </div>
            <span className="text-white text-[10px] font-black uppercase mt-3 tracking-[0.2em]">View Document</span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 text-[10px] font-black uppercase border-2 border-dashed border-slate-800/50 rounded-[1.8rem]">
          <AlertCircle size={24} className="mb-2 opacity-20" />
          Document Missing
        </div>
      )}
    </a>
  </div>
);

export default WorkerManagement;