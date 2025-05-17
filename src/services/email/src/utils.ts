import { Resend } from 'resend';
import { API_KEY } from './config';

const resend = new Resend(API_KEY);

export async function sendEmailFunc(recipient: string, subject: string, body: string) {
  const { data, error } = await resend.emails.send({
    from: 'Email from MAHub <onboarding@resend.dev>',
    to: [recipient],
    subject: subject,
    html: body,
  });

  if (error) {
    console.error({ error });
    return;
  }

  console.log({ data });
};