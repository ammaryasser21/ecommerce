import {
  Controller,
  Post,
  UploadedFile,
} from '@nestjs/common';

import { STORAGE_TYPES } from '../../common/enums/multer.js';
import { CloudUpload } from '../../common/decorators/upload.decorator.js';

@Controller('users')
export class UsersController {

  @Post('upload')
  // @UseInterceptors(
  //   FileInterceptor(
  //     'file',
  //     createCloudMulterOptions({
  //       storageType: STORAGE_TYPES.MEMORY,
  //       folder: 'users',
  //     }),
  //   )
  // )

  // @LocalUpload('file', {
  //   storageType: STORAGE_TYPES.DISK,
  //   folder: 'users',
  // })

  @CloudUpload('file', {
    storageType: STORAGE_TYPES.MEMORY,
    folder: 'users',
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully',
      file,
    };
  }
}