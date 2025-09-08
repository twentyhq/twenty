import { Body,Controller,Get,NotFoundException,Param,Post,Query,Req,Res,UnauthorizedException,UseGuards } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request,Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

@Controller('api/files/invoice-files')
export class InvoiceFileController {
  @Get(':fileName')
  async downloadFile(
    @Param('fileName') fileName: string, 
    @Query('expires') expires: string,
    @Query('signature') signature: string,
    @Res() res: Response
  ) {
    try {
      // Time-based security check
      if (!expires || !signature) {
        throw new UnauthorizedException('Missing required parameters');
      }

      // Check if URL has expired
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = parseInt(expires);
      
      if (currentTime > expirationTime) {
        throw new UnauthorizedException('Download link has expired. Please regenerate URL.');
      }

      // Verify signature
      const secretKey = process.env.FILE_DOWNLOAD_SECRET || 'default-secret-key';
      const expectedSignature = this.generateSignature(fileName, expires, secretKey);
      
      if (signature !== expectedSignature) {
        throw new UnauthorizedException('Invalid signature');
      }

      const uploadsDir = process.env.FILE_UPLOAD_PATH || path.join(process.cwd(), 'uploads', 'invoice-files');
      const filePath = path.join(uploadsDir, fileName);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found');
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', stats.size);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('regenerate-url')
  async regenerateDownloadUrl(
    @Body() body: { fileName: string },
    @Req() req: Request
  ) {
    const { fileName } = body;
    
    if (!fileName) {
      throw new UnauthorizedException('FileName is required');
    }

    // Check if file exists
    const uploadsDir = process.env.FILE_UPLOAD_PATH || path.join(process.cwd(), 'uploads', 'invoice-files');
    const filePath = path.join(uploadsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // Generate new time-limited download URL
    const secretKey = process.env.FILE_DOWNLOAD_SECRET || 'default-secret-key';
    const expiresIn = parseInt(process.env.FILE_DOWNLOAD_EXPIRES || '30');
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const signature = this.generateSignature(fileName, expires.toString(), secretKey);
    const downloadUrl = `/api/files/invoice-files/${fileName}?expires=${expires}&signature=${signature}`;

    return {
      downloadUrl,
      expires,
      expiresIn,
      message: 'New download URL generated successfully'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':fileName')
  async adminDownloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response
  ) {
    try {
      
      if (!fileName) {
        throw new UnauthorizedException('FileName is required');
      }

      const uploadsDir = process.env.FILE_UPLOAD_PATH || path.join(process.cwd(), 'uploads', 'invoice-files');
      const filePath = path.join(uploadsDir, fileName);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found');
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', stats.size);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  private generateSignature(fileName: string, expires: string, secretKey: string): string {
    const data = `${fileName}:${expires}`;
    return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
  }
}
