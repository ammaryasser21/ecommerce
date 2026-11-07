
import { UseInterceptors } from '@nestjs/common';

import {
    FileInterceptor,
    FilesInterceptor,
    FileFieldsInterceptor,
    AnyFilesInterceptor,
} from '@nestjs/platform-express';

import type {
    MulterOptions,
} from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { CloudUploadOptions, LocalUploadOptions } from '../interface/multer.interface.js';
import { createLocalMulterOptions } from '../utils/local-upload.js';
import { createCloudMulterOptions } from '../utils/cloud-upload.js';
import { UploadField } from '../types/upload-decorator.types.js';


// --------------------------------------------------
// Internal Factory
// --------------------------------------------------

const createUploadDecorators = (
    createOptions: (
        options: LocalUploadOptions | CloudUploadOptions,
    ) => MulterOptions,
) => {

    return {

        // ------------------------------------------
        // Single
        // ------------------------------------------

        single: (
            fieldName: string,
            options: LocalUploadOptions | CloudUploadOptions = {},
        ) => UseInterceptors(
            FileInterceptor(
                fieldName,
                createOptions(options),
            ),
        ),

        // ------------------------------------------
        // Multiple Files
        // ------------------------------------------

        array: (
            fieldName: string,
            maxCount: number,
            options: LocalUploadOptions | CloudUploadOptions = {},
        ) => UseInterceptors(
            FilesInterceptor(
                fieldName,
                maxCount,
                createOptions(options),
            ),
        ),

        // ------------------------------------------
        // Multiple Fields
        // ------------------------------------------

        fields: (
            fields: UploadField[],
            options: LocalUploadOptions | CloudUploadOptions = {},
        ) => UseInterceptors(
            FileFieldsInterceptor(
                fields,
                createOptions(options),
            ),
        ),

        // ------------------------------------------
        // Any Files
        // ------------------------------------------

        any: (
            options: LocalUploadOptions | CloudUploadOptions = {},
        ) => UseInterceptors(
            AnyFilesInterceptor(
                createOptions(options),
            ),
        ),
    };
};

// --------------------------------------------------
// Local Decorators
// --------------------------------------------------

const localUpload = createUploadDecorators(
    createLocalMulterOptions,
);

export const LocalUpload = localUpload.single;
export const LocalUploads = localUpload.array;
export const LocalUploadFields = localUpload.fields;
export const LocalAnyUploads = localUpload.any;

// --------------------------------------------------
// Cloud Decorators
// --------------------------------------------------

const cloudUpload = createUploadDecorators(
    createCloudMulterOptions,
);

export const CloudUpload = cloudUpload.single;
export const CloudUploads = cloudUpload.array;
export const CloudUploadFields = cloudUpload.fields;
export const CloudAnyUploads = cloudUpload.any;
