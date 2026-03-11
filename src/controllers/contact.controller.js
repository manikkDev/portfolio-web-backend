import * as contactService from '../services/contact.service.js';
import { ApiError } from '../utils/ApiError.js';

export async function submitContact(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    const result = await contactService.createContact({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I will get back to you soon.',
      data: { id: result.id, created_at: result.created_at },
    });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal(err.message));
  }
}
