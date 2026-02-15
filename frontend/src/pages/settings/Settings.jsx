import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, User, Bell, Shield, FileText, Lock, LogOut } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SettingsItem = ({ icon: Icon, label, onClick, destructive, value }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 transition-all hover:bg-white/5 active:scale-[0.98] group border-b border-white/5 last:border-0`}
    >
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${destructive ? 'bg-neon-pink/10 text-neon-pink' : 'bg-white/5 text-white/70 group-hover:text-white'}`}>
                <Icon size={18} />
            </div>
            <span className={`text-sm font-bold tracking-wide ${destructive ? 'text-neon-pink' : 'text-white'}`}>
                {label}
            </span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-xs text-white/40 font-mono">{value}</span>}
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
    </button>
);

const Settings = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(false);
        showToast({ message: 'DISCONNECTING...', type: 'loading' });

        // Simulating logout process
        setTimeout(() => {
            // Clear local storage if needed
            // localStorage.removeItem('token');
            navigate('/');
            showToast({ message: 'DISCONNECTED', type: 'success' });
        }, 800);
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden pb-10">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/10 blur-[100px] pointer-events-none" />

            <div className="p-6 relative isolate max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight">SETTINGS</h1>
                </div>

                <div className="space-y-6">
                    {/* Account Section */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black tracking-widest text-white/40 uppercase px-2">Account</h3>
                        <div className="glass-card overflow-hidden">
                            <SettingsItem
                                icon={User}
                                label="IDENTITY MANAGEMENT"
                                onClick={() => navigate('/settings/account')}
                            />
                            <SettingsItem
                                icon={Shield}
                                label="BLOCKED SIGNALS"
                                onClick={() => navigate('/settings/blocked')}
                                value="0"
                            />
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black tracking-widest text-white/40 uppercase px-2">System</h3>
                        <div className="glass-card overflow-hidden">
                            <SettingsItem
                                icon={Bell}
                                label="NOTIFICATIONS"
                                onClick={() => navigate('/settings/notifications')}
                                value="ON"
                            />
                        </div>
                    </div>

                    {/* Meta Section */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black tracking-widest text-white/40 uppercase px-2">Protocol</h3>
                        <div className="glass-card overflow-hidden">
                            <SettingsItem
                                icon={Lock}
                                label="PRIVACY POLICY"
                                onClick={() => navigate('/settings/privacy')}
                            />
                            <SettingsItem
                                icon={FileText}
                                label="TERMS OF SERVICE"
                                onClick={() => navigate('/settings/terms')}
                            />
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full glass-button border-neon-pink/20 hover:border-neon-pink/50 text-neon-pink flex items-center justify-center gap-2 h-14 group"
                    >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold tracking-widest">DISCONNECT</span>
                    </button>

                    <div className="text-center mt-8">
                        <p className="text-[10px] text-white/20 font-mono">
                            GLITCH_CLIENT v2.6.0<br />
                            BUILD_ID: 8847_AF_33
                        </p>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowLogoutConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-neutral-900 border border-white/10 p-6 rounded-2xl max-w-xs w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            <h3 className="text-xl font-bold mb-2 text-center text-white relative z-10">Disconnect?</h3>
                            <p className="text-white/60 text-center text-sm mb-6 relative z-10">
                                You will be disconnected from the Glitch network.
                            </p>

                            <div className="flex gap-3 relative z-10">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 py-3 rounded-xl bg-neon-pink text-black font-bold text-sm hover:bg-neon-pink/90 transition-colors"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
