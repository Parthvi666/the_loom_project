// Converts thrown route errors into consistent JSON responses.
import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  if (error?.code === 'LIMIT_FILE_SIZE') return response.status(413).json({ error: 'Image must be 10MB or smaller' });
  if (error?.code === 'LIMIT_UNEXPECTED_FILE') return response.status(400).json({ error: 'Only image uploads are supported' });
  response.status(500).json({ error: 'Internal server error' });
};