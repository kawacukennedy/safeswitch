import { api } from '../../api/client';

const Suspension = () => {
    const { showToast } = useToast();
    const [appeal, setAppeal] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!appeal) return;
        try {
            await api.submitAppeal(appeal);
            setSubmitted(true);
            showToast({ message: 'appeal submitted', type: 'success' });
        } catch (err) {
            showToast({ message: 'Failed to submit appeal', type: 'error' });
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', background: 'black', color: 'white' }}>
            <AlertOctagon size={48} style={{ color: 'var(--color-aura-negative)', marginBottom: '24px' }} />
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>account suspended</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                violation: automated activity detected.
            </p>

            {!submitted ? (
                <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                        placeholder="reason for appeal..."
                        value={appeal}
                        onChange={(e) => setAppeal(e.target.value)}
                    />
                    <Button onClick={handleSubmit} disabled={!appeal}>
                        submit appeal
                    </Button>
                </div>
            ) : (
                <div style={{ padding: '16px', background: 'rgba(124, 255, 178, 0.1)', borderRadius: '8px', color: 'var(--color-aura-positive)' }}>
                    appeal under review
                </div>
            )}
        </div>
    );
};

export default Suspension;
