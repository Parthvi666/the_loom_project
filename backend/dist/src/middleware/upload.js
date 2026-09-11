"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUpload = void 0;
// Stores uploaded images locally so the frontend can use a real file flow in demos.
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const uploadDirectory = node_path_1.default.resolve(process.cwd(), 'uploads');
node_fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_request, _file, callback) => callback(null, uploadDirectory),
    filename: (_request, file, callback) => {
        const extension = node_path_1.default.extname(file.originalname).toLowerCase();
        callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
    },
});
exports.imageUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith('image/')),
});
