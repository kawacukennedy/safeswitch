import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Shield, Activity, FileText } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const Profile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.getMe();
                setProfile(data);
            } catch (err) {
                showToast({ message: 'Failed to load profile', type: 'error' });
                // Fallback mock
                setProfile({
                    handle: 'guest_user',
                    aura_score: 0,
                    signals_count: 0,
                    audits_count: 0
                });
            }
        };
        fetchProfile();
    }, [showToast]);

    const stats = [
        { label: 'Signals', value: profile?.signals_count || 0 },
        { label: 'Audits', value: profile?.audits_count || 0 },
        { label: 'Rank', value: '#--' },
    ];

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-neon-blue/10 to-transparent pointer-events-none" />

            <div className="p-6 max-w-md mx-auto relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">Identity Protocol</h1>
                    <button onClick={() => navigate('/settings')} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5">
                        <Settings className="text-white" size={20} />
                    </button>
                </div>

                {/* Profile Card */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 blur-3xl opacity-30" />
                    <div className="glass-card p-8 flex flex-col items-center border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Shield size={64} className="text-white rotate-12" />
                        </div>

                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-neon-green to-neon-blue p-[2px] mb-4 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden group">
                                <span className="text-3xl font-mono font-bold text-white group-hover:scale-110 transition-transform">
                                    {(profile.handle || 'U').substring(0, 2).toUpperCase()}
                                </span>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">@{profile.handle}</h2>

                        <div className="flex items-center gap-2 mb-8 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                            <span className="text-sm font-medium text-neon-green tracking-wide">{profile.aura_score.toLocaleString()} AURA</span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-8 w-full border-t border-white/10 pt-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center group cursor-default">
                                    <div className="text-2xl font-black text-white group-hover:text-neon-blue transition-colors">
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium mt-1">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/recap')}
                        className="w-full h-16 glass-button flex items-center justify-between px-6 group hover:border-neon-pink/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-neon-pink/20 text-neon-pink">
                                <Activity size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white group-hover:text-neon-pink transition-colors">WEEKLY RECAP</div>
                                <div className="text-[10px] text-white/50">View your performance stats</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/history/aura')}
                        className="w-full h-16 glass-button flex items-center justify-between px-6 group hover:border-neon-blue/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-neon-blue/20 text-neon-blue">
                                <FileText size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white group-hover:text-neon-blue transition-colors">AURA HISTORY</div>
                                <div className="text-[10px] text-white/50">Transaction ledger</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/history/audit')}
                        className="w-full h-16 glass-button flex items-center justify-between px-6 group hover:border-neon-green/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-neon-green/20 text-neon-green">
                                <Shield size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white group-hover:text-neon-green transition-colors">AUDIT LOGS</div>
                                <div className="text-[10px] text-white/50">Your voting record</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
