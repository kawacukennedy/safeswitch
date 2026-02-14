import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ChevronRight, User, Bell, Shield, FileText, Lock, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import clsx from 'clsx';

const SettingsItem = ({ icon: Icon, label, onClick, destructive }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 transition-colors hover:bg-white/5 active:bg-white/10"
        style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'left'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon size={20} className={destructive ? "text-red-400" : "text-white/70"} style={{ color: destructive ? 'var(--color-aura-negative)' : 'rgba(255,255,255,0.7)' }} />
            <span style={{ fontSize: '16px', color: destructive ? 'var(--color-aura-negative)' : 'white' }}>{label}</span>
        </div>
        <ChevronRight size={16} className="text-white/30" style={{ color: 'rgba(255,255,255,0.3)' }} />
    </button>
);

const Settings = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(false);
        showToast({ message: 'logging out...', type: 'loading' });
        setTimeout(() => {
            navigate('/');
            showToast({ message: 'logged out', type: 'success' });
        }, 1000);
    };

    return (
        <div className="settings-page min-h-screen" style={{ paddingBottom: '40px' }}>
            <Header title="settings" showBack />

            <main className="container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Account Section */}
                <section>
                    <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</h3>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <SettingsItem
                            icon={User}
                            label="account management"
                            onClick={() => navigate('/settings/account')}
                        />
                        <SettingsItem
                            icon={Shield}
                            label="blocked users"
                            onClick={() => navigate('/settings/blocked')}
                        />
                    </Card>
                </section>

                {/* Preferences Section */}
                <section>
                    <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferences</h3>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <SettingsItem
                            icon={Bell}
                            label="notifications"
                            onClick={() => navigate('/settings/notifications')}
                        />
                    </Card>
                </section>

                {/* About Section */}
                <section>
                    <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</h3>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <SettingsItem
                            icon={Lock}
                            label="privacy policy"
                            onClick={() => navigate('/settings/privacy')}
                        />
                        <SettingsItem
                            icon={FileText}
                            label="terms of service"
                            onClick={() => navigate('/settings/terms')}
                        />
                    </Card>
                </section>

                {/* Logout */}
                <Button
                    variant="secondary"
                    onClick={() => setShowLogoutConfirm(true)}
                    style={{ marginTop: '20px', borderColor: 'var(--color-aura-negative)', color: 'var(--color-aura-negative)' }}
                >
                    <LogOut size={18} style={{ marginRight: '8px' }} />
                    log out
                </Button>

            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowLogoutConfirm(false)}
                    />
                    <Card style={{ position: 'relative', width: '100%', maxWidth: '320px', textAlign: 'center', padding: '24px' }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>log out?</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>are you sure you want to log out?</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1 }}>cancel</Button>
                            <Button
                                variant="primary"
                                onClick={handleLogout}
                                style={{ flex: 1, background: 'var(--color-aura-negative)', color: 'white', border: 'none' }}
                            >
                                log out
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Settings;
