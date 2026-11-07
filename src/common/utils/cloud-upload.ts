
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

import { BadRequestException } from '@nestjs/common';

import type { Request } from 'express';
import type { StorageEngine } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { STORAGE_TYPES } from '../enums/multer.js';
import { CloudUploadOptions } from '../interface/multer.interface.js';

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const ensureDirectory = (folder: string): string => {

    const uploadRoot = path.resolve(process.cwd(), 'uploads');
    const uploadPath = path.resolve(uploadRoot, folder);

    if (
        uploadPath !== uploadRoot &&
        !uploadPath.startsWith(`${uploadRoot}${path.sep}`)
    ) {
        throw new Error('Invalid upload folder');
    }

    fs.mkdirSync(uploadPath, { recursive: true });

    return uploadPath;
};

const defaultFileName = (
    file: Express.Multer.File,
): string => {

    const extension = path.extname(file.originalname).toLowerCase();

    return `${file.fieldname}-${Date.now()}-${crypto.randomUUID()}${extension}`;
};

// --------------------------------------------------
// Storage
// --------------------------------------------------

const createStorage = (
    storageType: STORAGE_TYPES,
    folder: string,
): StorageEngine => {

    if (storageType === STORAGE_TYPES.MEMORY) {
        return multer.memoryStorage();
    }

    return multer.diskStorage({

        destination(
            req: Request,
            file: Express.Multer.File,
            cb,
        ) {
            cb(null, ensureDirectory(folder));
        },

        filename(
            req: Request,
            file: Express.Multer.File,
            cb,
        ) {
            cb(null, defaultFileName(file));
        },
    });
};

// --------------------------------------------------
// File Filter
// --------------------------------------------------

const createFileFilter = (
    fileValidation: string[],
): NonNullable<MulterOptions['fileFilter']> => {

    return (req, file, cb) => {

        if (
            fileValidation.length > 0 &&
            !fileValidation.includes(file.mimetype)
        ) {
            return cb(
                new BadRequestException('File type is not allowed'),
                false,
            );
        }

        cb(null, true);
    };
};

// --------------------------------------------------
// Main Utility
// --------------------------------------------------

export const createCloudMulterOptions = ({
    storageType = STORAGE_TYPES.MEMORY,
    folder = 'general',
    fileValidation = [],
    maxFileSize = 5 * 1024 * 1024,
}: CloudUploadOptions = {}): MulterOptions => {

    return {
        storage: createStorage(storageType, folder),

        limits: {
            fileSize: maxFileSize,
        },

        fileFilter: createFileFilter(fileValidation),
    };
};
