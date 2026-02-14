import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { api } from '../../api/client';

const AuditHistory = () => {
    const [audits, setAudits] = useState([]);

    useEffect(() => {
        api.getAuditHistory()
            .then(setAudits)
            .catch(console.error);
    }, []);

    return (
        <div className="audit-history-page min-h-screen">
            <Header title="audit history" showBack />
            <main className="container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {audits.length === 0 && <div className="text-center text-white/50 p-8">No audit history.</div>}

                {audits.map(audit => (
                    <Card key={audit.id} style={{ display: 'flex', gap: '12px', padding: '12px' }}>
                        <div style={{ width: '60px', height: '60px', background: '#333', borderRadius: '8px', overflow: 'hidden' }}>
                            {/* Video Thumbnail (Mock) */}
                            <div className="w-full h-full bg-neutral-800" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    {new Date(audit.created_at).toLocaleDateString()}
                                </span>
                                <span style={{ color: (audit.aura_change > 0) ? 'var(--color-aura-positive)' : 'var(--color-aura-negative)' }}>
                                    {audit.aura_change > 0 ? '+' : ''}{audit.aura_change}
                                </span>
                            </div>
                            <div style={{ marginTop: '4px' }}>
                                <span style={{ marginRight: '8px' }}>you: {audit.vote}</span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                    consensus: {audit.consensus || 'pending'}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </main>
        </div>
    );
};

export default AuditHistory;
