import { CloudUploadOptions, LocalUploadOptions } from "../interface/multer.interface.js";

export type UploadOptions =
    | {
        type: 'local';
        options?: LocalUploadOptions;
    }
    | {
        type: 'cloud';
        options?: CloudUploadOptions;
    };

export type UploadStrategy =
    | {
        way: 'single';
        fieldName: string;
    }
    | {
        way: 'array';
        fieldName: string;
        maxCount?: number;
    }
    | {
        way: 'fields';
        fields: Array<{
            name: string;
            maxCount?: number;
        }>;
    }
    | {
        way: 'any';
    }
    | {
        way: 'none';
    };

    export type UploadField = {
    name: string;
    maxCount?: number;
};
