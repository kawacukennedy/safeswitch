import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Loader2 } from 'lucide-react';
import { api } from '../../api/client';

const ReportStatus = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getMyReports()
            .then(data => {
                setReports(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load reports:', err);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'var(--color-aura-positive)';
            case 'dismissed': return 'var(--color-aura-negative)';
            default: return 'var(--color-neutral)';
        }
    };

    return (
        <div className="report-status-page" style={{ minHeight: '100vh' }}>
            <Header title="report status" showBack />
            <main className="container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                        <p>no reports submitted.</p>
                    </div>
                ) : (
                    reports.map(report => (
                        <Card key={report.id} style={{ display: 'flex', gap: '12px', padding: '12px' }}>
                            <div style={{ width: '60px', height: '60px', background: '#333', borderRadius: '8px' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '500' }}>{report.reason}</span>
                                    <span style={{
                                        fontSize: '12px',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: getStatusColor(report.status)
                                    }}>
                                        {report.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                    submitted {new Date(report.created_at).toLocaleDateString()}
                                </div>
                                {report.resolution_note && (
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                                        {report.resolution_note}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </main>
        </div>
    );
};

export default ReportStatus;
