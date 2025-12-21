import path from 'path';

import type { RequestHandler } from 'express';
import type { PostMiddlewareFunction, PreMiddlewareFunction } from 'mongoose';
import multer from 'multer';
import sharp from 'sharp';

import { upload as multerUploadMiddleware } from '@lib/upload.js';
import { IMAGE_OPTIONS, UPLOAD_DIR } from '@configs/config.js';

import deleteFile from '@lib/deleteFile.js';

type UploadOptions = {
  stack: (RequestHandler | RequestHandler[])[];
  fields: (multer.Field & { single?: boolean; path?: string; prefix?: string })[];
  optimize?: {
    w: number;
    h: number;
    path: string;
  };
  rootPath: string;
  rootPrefix: string;
};

type MulterUploadObject = {
  [fieldname: string]: Express.Multer.File[];
};

const storeUploadedImages: RequestHandler = async (req, res, next) => {
  if (!req.hasFiles || !req.files || typeof req.files !== 'object') return next();

  const files = Object.values(req.files as MulterUploadObject)
    .flat()
    .map((file) =>
      sharp(file.buffer)
        .rotate()
        .resize(IMAGE_OPTIONS.w, IMAGE_OPTIONS.h, {
          fit: IMAGE_OPTIONS.fit,
          withoutEnlargement: true,
        })
        .webp({
          quality: IMAGE_OPTIONS.quality,
          effort: IMAGE_OPTIONS.effort,
        })
        .toFormat('webp')
        .toFile(file.path),
    );

  Promise.all(files);
};

export default function upload(options: UploadOptions): RequestHandler[] {
  const writeUploadedImagesInBody: RequestHandler = (req, res, next) => {
    if (!req.files || typeof req.files !== 'object') return next();

    for (let [fieldName, files] of Object.entries(req.files as MulterUploadObject)) {
      const {
        maxCount,
        single,
        path: fPath,
        prefix,
      } = options.fields.find((f) => f.name === fieldName)!;
      const isSingleFile = single === true && maxCount === 1;

      req.body[fieldName] = files.slice(0, isSingleFile ? 1 : maxCount).map((f) => {
        const filename = `${f.filename}.webp`;
        const savePath = path.join(fPath || options.rootPath, filename);
        const fileUrl = `${prefix || options.rootPrefix}/${filename}`;
        f.path = savePath;

        return fileUrl;
      });

      if (isSingleFile) req.body[fieldName] = req.body[fieldName][0];
    }

    req.hasFiles = true;

    next();
  };
  return [
    multerUploadMiddleware.fields(options.fields),
    writeUploadedImagesInBody,
    ...options.stack.flat(),
    storeUploadedImages,
  ];
}

// TODO: implement Middlewares to delete files from storage after update or append

export const mongoosePreUpdateMiddleware: PreMiddlewareFunction = async function (next) {
  const query = this as any;
  const updatedImage: string | undefined = (query.getUpdate() || {}).image;

  if (!updatedImage) return next();

  const oldDoc = await query.model.findOne(query.getQuery()).lean();
  if (!oldDoc || typeof oldDoc.image !== 'string') return next();

  const filepath = path.join(UPLOAD_DIR, oldDoc.image);

  await deleteFile(filepath);
};

export const mongoosePostDeleteMiddleware: PostMiddlewareFunction = async function (doc) {
  if (!doc) return;
  const filepath = path.join(UPLOAD_DIR, doc.image);
  await deleteFile(filepath);
};
