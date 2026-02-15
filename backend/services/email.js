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
            from: 'Glitch <onboarding@resend.dev>',
            to: [email],
            subject: 'Login to Glitch',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login to Glitch</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 40px 20px; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333; border-radius: 12px; padding: 40px; text-align: center;">
                        <h1 style="margin: 0 0 24px; font-size: 32px; letter-spacing: -1px; background: linear-gradient(to right, #fff, #999); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: white;">GLITCH</h1>
                        
                        <p style="font-size: 18px; color: #ccc; margin-bottom: 32px;">
                            Click the button below to verify your humanity and sign in.
                        </p>
                        
                        <a href="${link}" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 600; padding: 16px 32px; border-radius: 99px; text-decoration: none; font-size: 16px; transition: opacity 0.2s;">
                            Verify & Sign In
                        </a>
                        
                        <p style="margin-top: 40px; font-size: 14px; color: #666;">
                            Or copy this link to your browser:<br>
                            <a href="${link}" style="color: #666; text-decoration: underline; word-break: break-all;">${link}</a>
                        </p>
                        
                        <hr style="border: 0; border-top: 1px solid #333; margin: 40px 0;">
                        
                        <p style="font-size: 12px; color: #444;">
                            If you didn't request this login, you can safely ignore this email.<br>
                            This link expires in 15 minutes.
                        </p>
                    </div>
                </body>
                </html>
            `,
            text: `Login to Glitch\n\nClick the link below to verify your humanity:\n${link}\n\nThis link expires in 15 minutes.`,
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
