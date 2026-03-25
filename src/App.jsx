import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';


import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import WorkerManagement from './pages/WorkerManagement';
import PricingManager from './pages/PricingManager';
import CustomerManagement from './pages/CustomerManagement';
import JobManagement from './pages/JobManagement';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        
        const isAllowed = await checkAdminStatus(currentUser.email);

        if (isAllowed) {
          setUser(currentUser);
          setIsAdmin(true);
        } else {

          alert("ACCESS DENIED: Internal Command Registry Only.");
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkAdminStatus = async (email) => {
    if (!email) return false;
    try {
      const cleanEmail = email.toLowerCase().trim();
      const q = query(collection(db, "admins"), where("email", "==", cleanEmail));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Critical Auth Error:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        {/* Loading Spinner/Effect */}
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <div className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse italic">
          TECHNI SYSTEM INITIALIZING...
        </div>
      </div>
    );
  }

  return (

    <BrowserRouter basename="/admin">
      <Routes>


        <Route
          path="/login"
          element={user && isAdmin ? <Navigate to="/" replace /> : <Login />}
        />


        <Route
          path="/"
          element={user && isAdmin ? <Layout /> : <Navigate to="/login" replace />}
        >
          {/* Default Page (techni.live/admin/) */}
          <Route index element={<Dashboard />} />


          <Route path="workers" element={<WorkerManagement />} />
          <Route path="pricing" element={<PricingManager />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="jobs" element={<JobManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
