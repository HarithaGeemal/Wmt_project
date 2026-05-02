import nodemailer from 'nodemailer';
import logger from './logger.js';

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false 
    }
});

transport.verify((error, success) => {
    if (error) {
        logger.error('Error connecting to email server:', error);
    } else {
        logger.info('Email Transporer is ready');
    }
});

async function sendEmailWithRetry(mailOptions, maxRetries = 3) {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await transport.sendMail(mailOptions);
            logger.info(`Email sent: ${mailOptions.subject}`);
            return;
        } catch (error) {
            retries++;
            logger.error(`Email attempt ${retries} failed`, error);

            if (retries >= maxRetries) {
                throw error;
            }

            // optional delay before retry 
            await new Promise(res => setTimeout(res, 1000 * retries));
        }
    }
}

export { sendEmailWithRetry, transport };