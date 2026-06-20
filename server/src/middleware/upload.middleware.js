import { upload } from '../config/multer.js';

export const uploadPoster = upload.single('poster');
