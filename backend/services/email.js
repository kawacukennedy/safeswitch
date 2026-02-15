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
            subject: 'GLITCH // LOGIN_REQUEST',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login to Glitch</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Courier New', Courier, monospace; color: #ffffff;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #000000;">
                        <tr>
                            <td align="center" style="padding: 40px 10px;">
                                <div style="max-width: 480px; width: 100%; background-color: #050505; border: 1px solid #333333; text-align: left; padding: 0; box-shadow: 0 0 20px rgba(124, 255, 178, 0.1);">
                                    
                                    <!-- Header -->
                                    <div style="border-bottom: 1px solid #333333; padding: 20px; background: linear-gradient(180deg, rgba(124, 255, 178, 0.05) 0%, rgba(0,0,0,0) 100%);">
                                        <h1 style="margin: 0; font-size: 20px; color: #7CFFB2; letter-spacing: 2px; font-weight: 700; text-transform: uppercase;">/// GLITCH_PROTOCOL</h1>
                                    </div>

                                    <!-- Content -->
                                    <div style="padding: 40px 30px;">
                                        <p style="margin: 0 0 20px; font-size: 12px; line-height: 1.6; color: #666666; font-family: 'Courier New', Courier, monospace;">
                                            > SECURE_TRANSMISSION_RECEIVED<br>
                                            > TARGET_ID: ${email}<br>
                                            > TIMESTAMP: ${new Date().toISOString()}
                                        </p>

                                        <p style="margin: 0 0 40px; font-size: 18px; line-height: 1.4; color: #ffffff;">
                                            Identity verification required to access the network. Prove you are not a simulation.
                                        </p>

                                        <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${link}" style="display: inline-block; background-color: #7CFFB2; color: #000000; padding: 16px 32px; text-decoration: none; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-radius: 2px; box-shadow: 0 0 15px rgba(124, 255, 178, 0.4);">
                                                        [ ENTER_THE_GLITCH ]
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin: 40px 0 0; font-size: 11px; color: #444444; text-align: center;">
                                            LINK_EXPIRES_IN: 15_MINUTES<br>
                                            Usage of AI assistance is strictly prohibited.
                                        </p>
                                    </div>

                                    <!-- Footer -->
                                    <div style="border-top: 1px solid #333333; padding: 15px; background-color: #000000; text-align: center;">
                                        <p style="margin: 0; font-size: 10px; color: #333333;">
                                            GLITCH_NETWORK_V1.0 // NO_REPLY
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
            text: `> INCOMING_TRANSMISSION\n> TARGET: ${email}\n> ACTION: AUTHENTICATION_REQUIRED\n\nVerify your humanity:\n${link}\n\n> EXPIRATION: 15_MINUTES`,
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
