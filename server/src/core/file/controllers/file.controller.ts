import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { checkFilePath, checkFilename } from '../file.utils';
import { FileService } from '../services/file.service';

// TODO: Add cookie authentication
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  /**
   * Serve files from local storage
   * We recommend using an s3 bucket for production
   */
  @Get('*/:filename')
  async getFile(@Param() params: string[], @Res() res: Response) {
    const folderPath = checkFilePath(params[0]);
    const filename = checkFilename(params['filename']);
    const fileStream = await this.fileService.getFileStream(
      folderPath,
      filename,
    );

    fileStream.on('error', () => {
      res.status(404).send({ error: 'File not found' });
    });

    fileStream.pipe(res);
  }
}
