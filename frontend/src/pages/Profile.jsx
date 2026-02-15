import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Activity, FileText, Zap, MapPin } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const Profile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [recentSignals, setRecentSignals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const me = await api.getMe();
                // Get full details including recent signals
                const fullProfile = await api.getProfile(me.handle);
                setProfile(fullProfile);
                if (fullProfile.recent_signals) {
                    setRecentSignals(fullProfile.recent_signals);
                }
            } catch (err) {
                console.error(err);
                if (err.message) showToast({ message: 'Failed to load profile', type: 'error' });
                // Fallback for dev
                setProfile({
                    handle: 'ghost',
                    aura_score: 0,
                    rank: '---',
                    city: 'Unknown'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [showToast]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="loader text-neon-green" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-neon-blue/10 to-transparent pointer-events-none" />

            <div className="p-6 relative isolate max-w-md mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white tracking-tight">PROFILE</h1>
                    <button onClick={() => navigate('/settings')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <Settings className="text-white" size={20} />
                    </button>
                </div>

                {/* Profile Identity Card */}
                <div className="glass-card p-6 mb-6 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-green to-blue-500 mb-4 p-1 shadow-[0_0_20px_rgba(124,255,178,0.3)]">
                        <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.handle} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-mono font-bold text-white/50">
                                    {(profile.handle || '?').substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-1 tracking-tight">@{profile.handle}</h2>

                    <div className="flex items-center gap-2 mb-6">
                        <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white/80 flex items-center gap-1">
                            <Shield size={12} className="text-neon-green" />
                            VERIFIED
                        </span>
                        {profile.city && (
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-white/60 flex items-center gap-1">
                                <MapPin size={10} />
                                {profile.city}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center group hover:border-neon-green/30 transition-colors">
                            <div className="text-neon-green font-black text-2xl mb-1 group-hover:scale-110 transition-transform">
                                {profile.aura_score?.toLocaleString()}
                            </div>
                            <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">AURA SCORE</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center group hover:border-neon-purple/30 transition-colors">
                            <div className="text-white font-black text-2xl mb-1 group-hover:scale-110 transition-transform">
                                #{profile.rank || '---'}
                            </div>
                            <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">GLOBAL RANK</div>
                        </div>
                    </div>
                </div>

                {/* Weekly Recap CTA */}
                <button
                    onClick={() => navigate('/recap')}
                    className="w-full mb-8 p-1 rounded-2xl bg-gradient-to-r from-neon-purple via-blue-500 to-neon-purple bg-[length:200%_100%] animate-shimmer group"
                >
                    <div className="bg-black rounded-xl p-4 flex items-center justify-between group-hover:bg-black/90 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-neon-purple">
                                <FileText size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-sm text-white">Weekly Identity Report</h3>
                                <p className="text-xs text-white/60">Analysis of your digital footprint</p>
                            </div>
                        </div>
                        <Activity size={16} className="text-white/40 group-hover:text-white transition-colors" />
                    </div>
                </button>

                {/* Glitch History */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white/40 tracking-widest uppercase">TRANSMISSION LOG</h3>
                        <span className="text-xs text-white/20 font-mono">{recentSignals.length} ENTRIES</span>
                    </div>

                    {recentSignals.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                            {recentSignals.map(signal => (
                                <div key={signal.id} className="flex-shrink-0 w-32 aspect-[9/16] rounded-xl bg-neutral-800 relative overflow-hidden border border-white/10 group">
                                    {signal.video_url ? (
                                        <video
                                            src={signal.video_url}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                            muted
                                            loop
                                            onMouseOver={e => e.target.play().catch(() => { })}
                                            onMouseOut={e => e.target.pause()}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 bg-neutral-900">
                                            <Zap size={24} />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                        <p className="text-[10px] font-bold text-white/90 line-clamp-2 leading-tight">
                                            {signal.quest_text}
                                        </p>
                                        <p className="text-[9px] text-white/50 mt-1 font-mono">
                                            {new Date(signal.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 rounded-2xl border border-dashed border-white/10 text-white/30 text-xs font-mono">
                            > NO_TRANSMISSIONS_DETECTED<br />
                            > INITIATE_PROTOCOL_TO_BEGIN
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
