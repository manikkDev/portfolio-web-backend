import { db } from '../config/db.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const contacts = db.collection('contacts');

/**
 * Emails the message through Resend. The message is already saved, so a failure
 * here is logged and never fails the request.
 */
async function notify({ name, email, subject, message }) {
  const { resendApiKey, to } = env.mail;
  if (!resendApiKey || !to) return;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Portfolio <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `Portfolio message: ${subject || `from ${name}`}`,
        text: `${name} <${email}>\n\n${message}`,
      }),
    });
    if (!res.ok) logger.error('Contact email failed:', res.status, await res.text());
  } catch (err) {
    logger.error('Contact email failed:', err.message);
  }
}

/**
 * Store a contact form submission, then email it if email is configured.
 */
export async function createContact({ name, email, subject, message }) {
  const doc = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject?.trim() || null,
    message: message.trim(),
    created_at: new Date(),
  };

  const { insertedId } = await contacts.insertOne(doc);
  logger.info(`New contact submission (id: ${insertedId})`);

  await notify(doc);
  return { id: insertedId.toString(), created_at: doc.created_at };
}
