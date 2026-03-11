import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Store a contact form submission in Supabase.
 */
export async function createContact({ name, email, subject, message }) {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : null,
      message: message.trim(),
    })
    .select('id, created_at')
    .single();

  if (error) {
    logger.error('Failed to insert contact:', error.message);
    throw new Error('Failed to save contact message');
  }

  logger.info(`New contact submission from ${email} (id: ${data.id})`);
  return data;
}
