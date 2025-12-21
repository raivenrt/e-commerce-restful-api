import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { ALLOWED_MIME_TYPES, MAX_FILE_COUNT, MAX_FILE_SIZE } from '../configs/config.js';

const storage = multer.memoryStorage();

/**
 * Upload middleware
 *
 * you can access configrations in `src/configs/config.ts`
 *
 * ALLOWED_MIME_TYPES, MAX_FILE_COUNT, MAX_FILE_SIZE
 */
export const upload = multer({
  storage,
  preservePath: false,
  limits: {
    files: MAX_FILE_COUNT,
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
      cb(
        new Error(
          `File type ${file.mimetype} is not allowed, only ${ALLOWED_MIME_TYPES.join(', ')} are allowed`,
        ),
      );

    file.filename = `${uuidv4().replace(/-/g, '')}`;
    cb(null, true);
  },
});
