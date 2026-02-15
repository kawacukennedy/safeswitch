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
                <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Courier New', Courier, monospace;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #000000;">
                        <tr>
                            <td align="center" style="padding: 40px 20px;">
                                <div style="max-width: 480px; width: 100%; background-color: #000000; border: 1px solid #333333; text-align: left; padding: 0;">
                                    
                                    <!-- Header -->
                                    <div style="border-bottom: 1px solid #333333; padding: 20px;">
                                        <h1 style="margin: 0; font-size: 24px; color: #ffffff; letter-spacing: -1px; font-weight: 700;">GLITCH_ID_VERIFICATION</h1>
                                    </div>

                                    <!-- Content -->
                                    <div style="padding: 30px;">
                                        <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #cccccc;">
                                            > INCOMING_TRANSMISSION<br>
                                            > TARGET: ${email}<br>
                                            > ACTION: AUTHENTICATION_REQUIRED
                                        </p>

                                        <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.5; color: #ffffff;">
                                            Verify your humanity to access the network.
                                        </p>

                                        <a href="${link}" style="display: block; width: 100%; background-color: #ffffff; color: #000000; text-align: center; padding: 16px 0; text-decoration: none; font-weight: 700; font-size: 16px; text-transform: uppercase; border: 1px solid #ffffff; letter-spacing: 1px;">
                                            [ ACCESS_GLITCH ]
                                        </a>

                                        <p style="margin: 30px 0 0; font-size: 11px; color: #666666;">
                                            > EXPIRATION: 15_MINUTES<br>
                                            > TOKEN: ${link}
                                        </p>
                                    </div>

                                    <!-- Footer -->
                                    <div style="border-top: 1px solid #333333; padding: 15px; background-color: #050505;">
                                        <p style="margin: 0; font-size: 10px; color: #444444; text-align: center;">
                                            // SYSTEM_GENERATED_MESSAGE<br>
                                            // DO_NOT_REPLY
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
