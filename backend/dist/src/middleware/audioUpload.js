"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioUpload = void 0;
// Keeps short interview recordings in memory for the Sarvam request; no audio is persisted.
const multer_1 = __importDefault(require("multer"));
exports.audioUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
        const accepted = ['audio/webm', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/aac'].includes(file.mimetype);
        callback(null, accepted);
    },
});
