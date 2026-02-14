import { api } from '../../api/client';

const BlockedUsers = () => {
    const { showToast } = useToast();
    const [blockedUsers, setBlockedUsers] = useState([]);

    React.useEffect(() => {
        api.getBlockedUsers().then(setBlockedUsers).catch(console.error);
    }, []);

    const unblock = async (id) => {
        try {
            await api.unblockUser(id);
            setBlockedUsers(prev => prev.filter(u => u.blocked_id !== id));
            showToast({ message: 'user unblocked', type: 'success' });
        } catch (err) {
            showToast({ message: 'Failed to unblock', type: 'error' });
        }
    };

    return (
        <div className="blocked-page min-h-screen">
            <Header title="blocked users" showBack />
            <main className="container" style={{ marginTop: '20px' }}>
                {blockedUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                        <p>you haven't blocked anyone.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {blockedUsers.map(user => (
                            <Card key={user.blocked_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                                <span>@{user.handle}</span>
                                <Button
                                    variant="secondary"
                                    style={{ width: 'auto', padding: '0 16px', height: '32px', fontSize: '14px' }}
                                    onClick={() => unblock(user.blocked_id)}
                                >
                                    unblock
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BlockedUsers;
