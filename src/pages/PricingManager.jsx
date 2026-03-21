import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const PricingManager = () => {
  const [pricing, setPricing] = useState([]);

  // Firestore එකෙන් තියෙන ගණන් ටික ඇදලා ගන්නවා
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pricing_logic"), (snapshot) => {
      setPricing(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  // ගාණක් වෙනස් කරපු ගමන් Firestore එකට යවන Function එක
  const handleUpdate = async (id, field, value) => {
    try {
      const docRef = doc(db, "pricing_logic", id);
      await updateDoc(docRef, { [field]: Number(value) }); // Number එකක් විදිහටම යවනවා
      console.log("Updated successfully!");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Edit Service Prices</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pricing.map((item) => (
          <div key={item.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-xl font-bold text-indigo-400 mb-4 uppercase">{item.id.replace('_', ' ')}</h2>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(item).map((field) => (
                field !== 'id' && field !== 'category_name' && field !== 'is_active' && (
                  <div key={field}>
                    <label className="text-slate-500 text-xs uppercase font-bold">{field.replace('_', ' ')}</label>
                    <input
                      type="number"
                      defaultValue={item[field]}
                      onBlur={(e) => handleUpdate(item.id, field, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-slate-600 text-sm mt-6">* Click outside the box to save changes automatically.</p>
    </div>
  );
};

export default PricingManager;