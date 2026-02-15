import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

const AccountManagement = () => {
    const { showToast } = useToast();
    const [handle, setHandle] = useState('');
    const [city, setCity] = useState('');
    const [editing, setEditing] = useState(null); // 'handle' | 'city' | null
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Load initial data
    useEffect(() => {
        api.getMe().then(user => {
            setHandle(user.handle || '');
            setCity(user.city || '');
        }).catch(console.error);
    }, []);

    const handleSave = async (field, value) => {
        showToast({ message: 'updating...', type: 'loading' });
        try {
            if (field === 'handle') {
                await api.updateHandle(value);
                setHandle(value);
            }
            if (field === 'city') {
                await api.updateCity(value);
                setCity(value);
            }
            showToast({ message: `${field} updated`, type: 'success' });
            setEditing(null);
        } catch (err) {
            showToast({ message: err.message, type: 'error' });
        }
    };

    const handleDelete = async () => {
        showToast({ message: 'deleting account...', type: 'loading' });
        try {
            await api.deleteAccount();
            showToast({ message: 'account deleted', type: 'success' });
            window.location.href = '/';
        } catch (err) {
            showToast({ message: err.message, type: 'error' });
        }
    };

    return (
        <div className="account-page min-h-screen" style={{ minHeight: '100vh' }}>
            <Header title="account" showBack />

            <main className="container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Handle Section */}
                <section>
                    <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>handle</h3>
                    <Card>
                        {editing === 'handle' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Input defaultValue={handle} id="edit-handle" autoFocus />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setEditing(null)}
                                        style={{ flex: 1 }}
                                    >cancel</Button>
                                    <Button
                                        onClick={() => handleSave('handle', document.getElementById('edit-handle').value)}
                                        style={{ flex: 1 }}
                                    >save</Button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', fontWeight: '500' }}>@{handle}</span>
                                <Button variant="ghost" onClick={() => setEditing('handle')} style={{ width: 'auto', padding: '0 12px' }}>change</Button>
                            </div>
                        )}
                    </Card>
                </section>

                {/* City Section */}
                <section>
                    <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>city</h3>
                    <Card>
                        {editing === 'city' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Input defaultValue={city} id="edit-city" autoFocus />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setEditing(null)}
                                        style={{ flex: 1 }}
                                    >cancel</Button>
                                    <Button
                                        onClick={() => handleSave('city', document.getElementById('edit-city').value)}
                                        style={{ flex: 1 }}
                                    >save</Button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', fontWeight: '500' }}>{city || 'not set'}</span>
                                <Button variant="ghost" onClick={() => setEditing('city')} style={{ width: 'auto', padding: '0 12px' }}>change</Button>
                            </div>
                        )}
                    </Card>
                </section>

                {/* Delete Account */}
                <div style={{ marginTop: '40px' }}>
                    <Button
                        variant="secondary"
                        style={{ width: '100%', borderColor: 'var(--color-aura-negative)', color: 'var(--color-aura-negative)' }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        delete account
                    </Button>
                    <p style={{ marginTop: '8px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        this action is permanent and cannot be undone.
                    </p>
                </div>

            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <Card style={{ position: 'relative', width: '100%', maxWidth: '320px', textAlign: 'center', padding: '24px' }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: 'var(--color-aura-negative)' }}>delete account?</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>this cannot be undone. all data will be permanently lost.</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>cancel</Button>
                            <Button
                                variant="primary"
                                onClick={handleDelete}
                                style={{ flex: 1, background: 'var(--color-aura-negative)', color: 'white', border: 'none' }}
                            >
                                delete
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AccountManagement;
