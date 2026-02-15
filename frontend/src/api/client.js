const API_BASE = import.meta.env.VITE_API_URL || 'https://glitch-cwr1.onrender.com/api';

/**
 * Generic Fetch Wrapper
 */
async function request(endpoint, options = {}) {
    const defaults = {
        headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
        },
    };

    // Merge headers
    options.headers = { ...defaults.headers, ...options.headers };

    // If Content-Type is explicitly undefined (e.g. FormData uploads),
    // delete it so fetch auto-sets multipart/form-data with boundary
    Object.keys(options.headers).forEach(key => {
        if (options.headers[key] === undefined) {
            delete options.headers[key];
        }
    });

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/onboarding') {
                window.location.href = '/login';
            }
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    // Return null for 204 No Content
    if (response.status === 204) return null;

    return response.json();
}

export const api = {
    // Auth
    requestMagicLink: (email) => request('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyMagicLink: (token) => request('/auth/verify', { method: 'POST', body: JSON.stringify({ token }) }),

    // Quests
    getCurrentQuest: () => request('/quests/current'),

    // Signals
    getFeed: () => request('/signals'),
    uploadSignal: (questId, videoFile) => {
        const formData = new FormData();
        formData.append('quest_id', questId);
        formData.append('video', videoFile);

        return request('/signals', {
            method: 'POST',
            body: formData,
            // Header hack: fetch automatically sets Content-Type to multipart/form-data with boundary
            // when body is FormData, so we need to EXCLUDE Content-Type: application/json
            headers: {
                'Content-Type': undefined
            }
        });
    },

    // Audits
    submitAudit: (signalId, vote) => request('/audits', {
        method: 'POST',
        body: JSON.stringify({ signal_id: signalId, vote })
    }),
    getAuditHistory: () => request('/audits/history'),

    // User & Profile
    getMe: () => request('/users/me'),
    getProfile: (handle) => request(`/profiles/${handle}`),
    updateHandle: (newHandle) => request('/profile/handle', { method: 'POST', body: JSON.stringify({ new_handle: newHandle }) }),
    updateCity: (city) => request('/profile/city', { method: 'POST', body: JSON.stringify({ city }) }),
    deleteAccount: () => request('/profile', { method: 'DELETE' }),

    // Settings
    getNotificationSettings: () => request('/settings/notifications'),
    updateNotificationSettings: (settings) => request('/settings/notifications', { method: 'PATCH', body: JSON.stringify(settings) }),

    // Social / Moderation
    getBlockedUsers: () => request('/blocks'),
    blockUser: (blockedId) => request('/blocks', { method: 'POST', body: JSON.stringify({ blocked_id: blockedId }) }),
    unblockUser: (blockedId) => request(`/blocks/${blockedId}`, { method: 'DELETE' }),

    // Reports
    submitReport: ({ signal_id, reason, description }) => request('/reports', {
        method: 'POST',
        body: JSON.stringify({ signal_id, reason, description })
    }),
    getMyReports: () => request('/reports/mine'),

    // Appeals
    submitAppeal: (reason) => request('/appeals', { method: 'POST', body: JSON.stringify({ reason }) }),
    getAppeals: () => request('/appeals'),

    // Engagement
    getRecap: (userId) => request(`/recaps/${userId}/latest`),
    getAuraHistory: () => request('/aura/history'),
    getLeaderboard: (scope = 'global', city = null) => {
        const query = new URLSearchParams({ scope });
        if (city) query.append('city', city);
        return request(`/leaderboard?${query.toString()}`);
    },

    redeemVouch: (code) => request('/vouches', { method: 'POST', body: JSON.stringify({ code }) }),

    // Realtime URL
    realtimeUrl: `${API_BASE}/realtime/feed`
};
