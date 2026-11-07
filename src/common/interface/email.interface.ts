import { SendMailOptions } from 'nodemailer';

export interface SendEmailParams extends SendMailOptions {
    to: string;
    subject: string;
}

export interface EmailLayoutType {
    title: string;
    content: string;
    appName?: string;
}

export interface OtpTemplateType {
    name?: string;
    otp: string;
    title: string;
    expiresIn?: string;
}

export interface LoginAlertType {
    name?: string;
    device?: string;
    location?: string;
    date?: string;
}

export interface NotificationTemplateType {
    name?: string;
    title: string;
    message: string;
    buttonText?: string;
    buttonUrl?: string;
}