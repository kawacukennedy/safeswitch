import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

const Toggle = ({ label, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '16px' }}>{label}</span>
        <button
            onClick={() => onChange(!checked)}
            style={{
                width: '48px',
                height: '28px',
                background: checked ? 'var(--color-aura-positive)' : 'rgba(255,255,255,0.2)',
                borderRadius: '99px',
                position: 'relative',
                transition: 'background 0.2s'
            }}
        >
            <div style={{
                width: '24px',
                height: '24px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: checked ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
        </button>
    </div>
);

const Notifications = () => {
    const { showToast } = useToast();
    const [settings, setSettings] = useState({
        daily_quest: true,
        audit_reminder: true,
        aura_milestone: false
    });

    React.useEffect(() => {
        api.getNotificationSettings()
            .then(data => setSettings({
                daily_quest: data.daily_quest ?? true,
                audit_reminder: data.audit_reminder ?? true,
                aura_milestone: data.aura_milestone ?? false
            }))
            .catch(console.error);
    }, []);

    const toggle = async (key) => {
        const newValue = !settings[key];
        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            await api.updateNotificationSettings({ [key]: newValue });
        } catch (err) {
            showToast({ message: 'Failed to save setting', type: 'error' });
            setSettings(prev => ({ ...prev, [key]: !newValue })); // Revert
        }
    };

    return (
        <div className="notifications-page min-h-screen">
            <Header title="notifications" showBack />
            <main className="container" style={{ marginTop: '20px' }}>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <Toggle
                        label="daily quest reminder"
                        checked={settings.daily_quest}
                        onChange={() => toggle('daily_quest')}
                    />
                    <Toggle
                        label="audit reminder"
                        checked={settings.audit_reminder}
                        onChange={() => toggle('audit_reminder')}
                    />
                    <Toggle
                        label="aura milestone"
                        checked={settings.aura_milestone}
                        onChange={() => toggle('aura_milestone')}
                    />
                </Card>
            </main>
        </div>
    );
};

export default Notifications;
