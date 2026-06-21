import { upload } from '../config/multer.js';

export const uploadPoster = upload.single('poster');
export const uploadMovieImages = upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]);
