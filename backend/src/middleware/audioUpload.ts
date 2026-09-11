// Keeps short interview recordings in memory for the Sarvam request; no audio is persisted.
import multer from 'multer';

export const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const accepted = ['audio/webm', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/aac'].includes(file.mimetype);
    callback(null, accepted);
  },
});
