import { api } from '../../api/client';

const AccountManagement = () => {
    const { showToast } = useToast();
    const [handle, setHandle] = useState('');
    const [city, setCity] = useState('');
    const [editing, setEditing] = useState(null); // 'handle' | 'city' | null

    // Load initial data
    React.useEffect(() => {
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

    return (
        <div className="account-page min-h-screen">
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
                                    >cancle</Button>
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
                                    >cancle</Button>
                                    <Button
                                        onClick={() => handleSave('city', document.getElementById('edit-city').value)}
                                        style={{ flex: 1 }}
                                    >save</Button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', fontWeight: '500' }}>{city}</span>
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
                        onClick={() => showToast({ message: 'function disabled for safety', type: 'error' })}
                    >
                        delete account
                    </Button>
                    <p style={{ marginTop: '8px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        this action is permanent and cannot be undone.
                    </p>
                </div>

            </main>
        </div>
    );
};

export default AccountManagement;
