import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import {
    Briefcase, Clock, CheckCircle2, XCircle, MapPin,
    User, HardHat, DollarSign, Calendar, Search, Eye, X, ExternalLink, Navigation, Timer
} from 'lucide-react';

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [usersData, setUsersData] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setLoading(true);

        const collectionName = activeTab === 'active' ? "jobRequests" : "completed jobs";
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));

        const unsub = onSnapshot(q, async (snapshot) => {
            const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJobs(jobsList);
            fetchLinkedDetails(jobsList);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Error:", error);
            setLoading(false);
        });

        return unsub;
    }, [activeTab]);

    const fetchLinkedDetails = async (jobsList) => {
        const tempStore = { ...usersData };
        for (const job of jobsList) {
            if (job.customerId && !tempStore[job.customerId]) {
                const cDoc = await getDoc(doc(db, "customers", job.customerId));
                if (cDoc.exists()) tempStore[job.customerId] = cDoc.data();
            }
            if (job.workerId && !tempStore[job.workerId]) {
                const wDoc = await getDoc(doc(db, "workers", job.workerId));
                if (wDoc.exists()) tempStore[job.workerId] = wDoc.data();
            }
        }
        setUsersData(tempStore);
    };

    // Filter Logic with REF Search 👇
    const displayJobs = jobs.filter(job => {
        const lowerSearch = searchTerm.toLowerCase();

        const matchesType = (job.jobType || '').toLowerCase().includes(lowerSearch);
        const matchesCustomer = (usersData[job.customerId]?.fullName || '').toLowerCase().includes(lowerSearch);

        // REF Search (Last 6 chars of ID)
        const jobRef = job.id.slice(-6).toLowerCase();
        const matchesRef = jobRef.includes(lowerSearch);

        const matchesSearch = matchesType || matchesCustomer || matchesRef;

        if (activeTab === 'active') {
            const isNotFinished = job.status !== 'completed' && job.status !== 'cancelled';
            return matchesSearch && isNotFinished;
        } else {
            return matchesSearch;
        }
    });

    const openInMaps = (geoPoint) => {
        if (!geoPoint || !geoPoint.latitude) {
            alert("Location coordinates not found!");
            return;
        }
        const url = `https://www.google.com/maps?q=${geoPoint.latitude},${geoPoint.longitude}`;
        window.open(url, "_blank");
    };

    return (
        <div className="p-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent italic uppercase tracking-tighter">Job Operations</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                        Filter: <span className="text-indigo-400">{activeTab === 'active' ? 'Live (Excluding Completed)' : 'Full History'}</span>
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search Name, Type or REF..."
                            className="bg-slate-900 border border-slate-800 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-2xl shadow-2xl">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Live Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            History
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Display */}
            {loading ? (
                <div className="flex justify-center py-20"><p className="text-slate-500 animate-pulse font-black uppercase tracking-widest text-xs italic">Updating Stream...</p></div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {displayJobs.length > 0 ? displayJobs.map((job) => (
                        <div key={job.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[2.5rem] p-7 hover:border-indigo-500/40 transition-all group shadow-xl relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-1 bg-gradient-to-l ${job.status === 'completed' ? 'from-emerald-500' : 'from-blue-500'} opacity-50`}></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-indigo-500/10 rounded-3xl text-indigo-400 group-hover:scale-110 transition-transform"><Briefcase size={24} /></div>
                                    <div>
                                        <h3 className="text-white text-lg font-black italic uppercase tracking-tight leading-none">{job.jobType || 'Service'}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                {job.status}
                                            </span>
                                            <span className="text-slate-600 text-[9px] font-mono font-bold">REF: {job.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-400 font-black text-2xl font-mono tracking-tighter italic leading-none">Rs.{job.fare || '0'}</p>
                                    <p className="text-slate-600 text-[10px] uppercase font-bold tracking-widest mt-1 italic">Service Fare</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/20 p-5 rounded-[2rem] border border-slate-800/50">
                                    <p className="text-[9px] text-slate-500 font-black uppercase mb-3 flex items-center gap-2"><User size={12} className="text-blue-500" /> Requester</p>
                                    <div className="flex items-center gap-3">
                                        <img src={usersData[job.customerId]?.ProfileImage || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-2xl object-cover border border-slate-700" alt="pfp" />
                                        <div>
                                            <p className="text-slate-200 text-sm font-bold leading-tight">{usersData[job.customerId]?.fullName || 'Loading...'}</p>
                                            <p className="text-slate-500 text-[10px] mt-1 font-mono">{usersData[job.customerId]?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-800/20 p-5 rounded-[2rem] border border-slate-800/50">
                                    <p className="text-[9px] text-slate-500 font-black uppercase mb-3 flex items-center gap-2"><HardHat size={12} className="text-amber-500" /> Worker</p>
                                    <div className="flex items-center gap-3">
                                        <img src={usersData[job.workerId]?.profileUrl || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-2xl object-cover border border-slate-700" alt="wpfp" />
                                        <div>
                                            <p className="text-slate-200 text-sm font-bold leading-tight">{usersData[job.workerId]?.name || (job.workerId ? 'Assigned' : 'Unassigned')}</p>
                                            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-tighter mt-1">Verified Partner</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-800/60">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                                        <Clock size={12} className="text-blue-500" /> Start: {job.createdAt ? new Date(job.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                                    </div>
                                    {job.completedAt && (
                                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-tight">
                                            <CheckCircle2 size={12} /> End: {new Date(job.completedAt.seconds * 1000).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => openInMaps(job.customerLocation)}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-white hover:text-black text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-xl"
                                >
                                    <Navigation size={14} /> Map Location <ExternalLink size={12} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
                            <p className="text-slate-600 font-black uppercase tracking-widest text-xs italic animate-pulse">
                                No matching records found in {activeTab}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobManagement;