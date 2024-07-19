'use server';

import getBaseUrl from '@/lib/base-url';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = getBaseUrl();

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: email,
    subject: 'Pet Shop - Confirmation email',
    html: `<p>Click to <a href='${confirmLink}'>Confirm Link</a></p>>`,
  });

  if (error) return console.log(error);
  if (data) return data;
};

export const sendResetPasswordLinkEmail = async (
  email: string,
  token: string,
) => {
  const confirmLink = `${domain}/auth/new-password?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: email,
    subject: 'Pet Shop - Confirmation email',
    html: `<p>Click to <a href='${confirmLink}'>to reset the password</a></p>>`,
  });

  if (error) return console.log(error);
  if (data) return data;
};
