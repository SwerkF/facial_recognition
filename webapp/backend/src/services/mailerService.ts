import dotenv from 'dotenv';
import nodemailer, { Transporter } from 'nodemailer';
import { CreateEmailResponseSuccess, Resend } from 'resend';

import { logger } from '../utils/logger';

dotenv.config();

type MailProvider = 'smtp' | 'resend';

class MailerService {
    private resend: Resend;
    private smtpTransport: Transporter;
    private from: string;
    private provider: MailProvider;
    private logger;

    constructor() {
        this.provider = (process.env.MAILER_PROVIDER as MailProvider) || 'smtp';
        this.from = process.env.MAILER_EMAIL_FROM || '';

        this.logger = logger.child({
            module: '[Nexelis][MailerService]',
        });

        // Initialize Resend
        this.resend = new Resend(process.env.RESEND_API_KEY);

        // Initialize SMTP Transport (MailHog)
        this.smtpTransport = nodemailer.createTransport({
            host: process.env.MAILER_HOST || 'mailhog',
            port: parseInt(process.env.MAILER_PORT || '1025'),
            secure: false,
        });
    }

    /**
     * Envoie un email via le provider configuré (Resend ou SMTP/MailHog).
     * @param to Destinataire.
     * @param subject Sujet de l'email.
     * @param html Contenu HTML de l'email.
     * @returns La réponse du provider.
     */
    public async sendEmail(
        email: string,
        subject: string,
        // reactBody: React.FunctionComponentElement<EmailProps>
        reactBody: string
    ): Promise<CreateEmailResponseSuccess | null> {
        const { data } = await this.resend.emails.send({
            from: this.from,
            to: email,
            subject,
            react: reactBody,
        });
        return data;
    }
}

export const mailerService = new MailerService();
