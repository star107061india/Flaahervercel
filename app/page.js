'use client'; // यह लाइन बटन को काम करने लायक बनाती है

import React, { useState } from 'react';

// Icons को कंपोनेंट के तौर पर बना लें ताकि कोड साफ-सुथरा रहे
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>;


export default function HomePage() {
  const [activeTab, setActiveTab] = useState('locked');

  const togglePassword = () => {
    const keyphraseInput = document.getElementById('keyphrase');
    if (keyphraseInput.type === 'password') {
        keyphraseInput.type = 'text';
    } else {
        keyphraseInput.type = 'password';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <ZapIcon />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">BardFlasher</h1>
            </div>
            <p className="text-slate-50 text-lg">Active Locked PI Withdrawal Bot</p>
        </div>

        <div className="w-full">
            <div role="tablist" className="h-10 items-center justify-center rounded-md p-1 grid w-full grid-cols-2 bg-black/50 border border-slate-700">
                <button type="button" onClick={() => setActiveTab('locked')} data-state={activeTab === 'locked' ? 'active' : 'inactive'} className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-slate-100 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium flex items-center gap-2">
                    <LockIcon />Locked Coins
                </button>
                <button type="button" onClick={() => setActiveTab('transfer')} data-state={activeTab === 'transfer' ? 'active' : 'inactive'} className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-slate-100 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium flex items-center gap-2">
                    <WalletIcon />Transfer
                </button>
            </div>
            <div className="mt-6">
                {activeTab === 'locked' && (
                    <div id="panel-locked">
                        <div className="rounded-lg border text-card-foreground shadow-sm bg-black/50 border-slate-700 backdrop-blur">
                            <div className="flex flex-col space-y-1.5 p-6"><h3 className="text-2xl font-semibold leading-none tracking-tight text-purple-400">Discover Locked Coins</h3><p className="text-sm text-slate-50">Enter your keyphrase to retrieve locked coins from your PI wallet</p></div>
                            <div className="p-6 pt-0 space-y-6">
                                <div className="space-y-2"><label className="text-sm font-medium leading-none text-slate-100" htmlFor="keyphrase">Keyphrase</label><div className="relative"><input type="password" className="flex h-10 w-full rounded-md border px-3 py-2 text-base bg-slate-700/50 border-slate-600 text-white pr-10" id="keyphrase" placeholder="Enter Locked wallet keyphrase" /><button onClick={togglePassword} className="inline-flex items-center justify-center rounded-md absolute right-0 top-0 h-full px-3 text-slate-50 hover:text-white" type="button"><EyeIcon /></button></div></div>
                                <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">Get Locked Coins</button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'transfer' && (
                    <div id="panel-transfer">
                         <div className="rounded-lg border shadow-sm bg-black/50 border-slate-700 backdrop-blur p-6">
                           <h3 className="text-2xl font-semibold leading-none tracking-tight text-purple-400 text-center">Transfer Coins</h3>
                           <p className="text-sm text-slate-50 text-center mt-2">This feature is coming soon.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
