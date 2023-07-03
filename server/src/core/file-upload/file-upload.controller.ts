import { Controller, Get, Param, Res } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { join } from 'path';

@Controller('files')
export class FileUploadController {
  /**
   * Serve files from local storage
   * We recommend using an s3 bucket for production
   */
  @Get('*/:filename')
  async getFile(@Param() params: string[], @Res() res: Response) {
    const filePath = join(
      process.cwd(),
      '.local-storage/',
      params[0],
      params['filename'],
    );
    const fileStream = createReadStream(filePath);

    fileStream.on('error', () => {
      res.status(404).send({ error: 'File not found' });
    });

    fileStream.pipe(res);
  }
}
