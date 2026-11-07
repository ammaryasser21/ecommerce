
import {
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { SendEmailParams } from '../../interface/email.interface.js';


@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);

    private readonly transporter: Transporter;
    private readonly email: string;
    private readonly appName: string;

    constructor(private readonly configService: ConfigService) {
        this.email = this.configService.getOrThrow<string>('EMAIL_USER');

        const password = this.configService.getOrThrow<string>('EMAIL_PASS');

        this.appName = this.configService.get<string>('MY_APP') ?? 'My App';

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.email,
                pass: password,
            },
        });
    }

    async onModuleInit(): Promise<void> {
        try {
            await this.transporter.verify();

            this.logger.log('SMTP connection is ready');
        } catch (error) {
            this.logger.error('SMTP connection failed', error);
        }
    }

    async sendEmail({
        from = `"${this.appName} App" <${this.email}>`,
        ...mailOptions
    }: SendEmailParams) {
        try {
            const info = await this.transporter.sendMail({
                ...mailOptions,
                from,
            });

            this.logger.log(`Email sent: ${info.messageId}`);

            return info;
        } catch (error) {
            this.logger.error('Email sending failed', error);

            throw error;
        }
    }
}
