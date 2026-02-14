import React from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';

const LEGAL_TEXTS = {
    privacy: `we collect your email, handle, and city to operate the service. your videos are stored and may be viewed by other users for audit purposes. we do not share your data with third parties.`,
    terms: `by using glitch you agree to follow the human protocol. you must be 13 or older. do not upload harmful or illegal content. we may suspend accounts for violations.`
};

const Legal = ({ type }) => { // type: 'privacy' | 'terms'
    return (
        <div className="legal-page min-h-screen">
            <Header title={type === 'privacy' ? 'privacy policy' : 'terms of service'} showBack />
            <main className="container" style={{ marginTop: '20px' }}>
                <Card style={{ padding: '24px', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
                    <p>{LEGAL_TEXTS[type]}</p>
                    <p style={{ marginTop: '20px' }}>last updated: 2026-02-14</p>
                </Card>
            </main>
        </div>
    );
};

export default Legal;
