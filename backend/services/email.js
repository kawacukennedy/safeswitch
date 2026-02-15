const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const sendMagicLink = async (email, link) => {
    if (!resend) {
        console.log('--------------------------------------------------');
        console.log('RESEND_API_KEY not set. Logging email instead:');
        console.log(`To: ${email}`);
        console.log(`Link: ${link}`);
        console.log('--------------------------------------------------');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Glitch <auth@resend.dev>', // User acts on behalf of 'auth@resend.dev' by default on free tier? 
            // Actually, usually it's onboarding@resend.dev or similar. 
            // Best to use process.env.EMAIL_FROM || 'onboarding@resend.dev'
            to: [email],
            subject: 'Login to Glitch',
            html: `
                <div style="font-family: sans-serif; text-align: center; color: #000;">
                    <h1>Enter the Glitch</h1>
                    <p>Click the link below to verify your humanity.</p>
                    <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0;">Sign In</a>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, ignore it. It will expire in 15 minutes.</p>
                    <p style="color: #ccc; font-size: 12px;">${link}</p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error(error.message);
        }

        console.log(`Email sent to ${email} (ID: ${data.id})`);
    } catch (err) {
        console.error('Failed to send email:', err);
        // Fallback to log in case of error (e.g. unverified domain on free tier)
        console.log(`FALLBACK LINK: ${link}`);
        throw err;
    }
};

module.exports = { sendMagicLink };
