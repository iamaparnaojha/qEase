import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Add debug logs
console.log('Twilio Credentials:', {
    accountSid: accountSid ? 'Present' : 'Missing',
    authToken: authToken ? 'Present' : 'Missing',
    phoneNumber: twilioPhoneNumber ? 'Present' : 'Missing'
});

// Check if credentials exist before creating client
if (!accountSid || !authToken) {
    console.error('Twilio credentials are missing');
    // Create dummy client for development
    const client = {
        messages: {
            create: async () => {
                console.log('SMS would be sent in production');
                return { sid: 'DUMMY_SID' };
            }
        }
    };
} else {
    // Create real Twilio client
    const client = twilio(accountSid, authToken);
}

export const sendSMS = async (to, message) => {
    try {
        if (!accountSid || !authToken) {
            console.log('Development mode: SMS not sent');
            console.log('Would send SMS to:', to);
            console.log('Message:', message);
            return true;
        }

        const response = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: to
        });
        console.log('SMS sent successfully:', response.sid);
        return true;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
};
