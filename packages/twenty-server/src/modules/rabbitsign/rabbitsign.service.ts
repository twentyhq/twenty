import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import crypto from 'crypto';

@Injectable()
export class RabbitSignService {
  constructor(private readonly configService: ConfigService) {}

  private getCurrentUtcTime(): string {
    return new Date().toISOString().split('.')[0] + 'Z';
  }

  private getTodayInLocalTimezone(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  private sha512(input: string): string {
    return crypto.createHash('sha512').update(input, 'utf8').digest('hex').toUpperCase();
  }

  async signPdf(
    pdfBuffer: Buffer,
    fileName: string,
    signers: Array<{
      email: string;
      name: string;
      position: {
        x: number;
        y: number;
      };
    }>,
  ) {
    const RABBITSIGN_API_KEY_ID = this.configService.get<string>('RABBITSIGN_API_KEY_ID');
    const RABBITSIGN_API_KEY_SECRET = this.configService.get<string>('RABBITSIGN_API_KEY_SECRET');

    if (!RABBITSIGN_API_KEY_ID || !RABBITSIGN_API_KEY_SECRET) {
      throw new Error('RabbitSign API credentials not configured');
    }

    // Step 1: Get upload URL
    const path1 = '/api/v1/upload-url';
    const httpMethod1 = 'POST';
    const utcTime1 = this.getCurrentUtcTime();
    const signature1 = this.sha512(`${httpMethod1} ${path1} ${utcTime1} ${RABBITSIGN_API_KEY_SECRET}`);
    const headers1 = {
      'x-rabbitsign-api-key-id': RABBITSIGN_API_KEY_ID,
      'x-rabbitsign-api-signature': signature1,
      'x-rabbitsign-api-time-utc': utcTime1,
    };

    const uploadUrlResp = await axios.post('https://www.rabbitsign.com/api/v1/upload-url', null, { 
      headers: headers1 
    });
    const uploadUrl = uploadUrlResp.data.uploadUrl;

    // Step 2: Upload PDF
    await axios.put(uploadUrl, pdfBuffer, { 
      headers: { 'Content-Type': 'binary/octet-stream' } 
    });

    // Step 3: Create folder (signing request)
    const path2 = '/api/v1/folder';
    const httpMethod2 = 'POST';
    const utcTime2 = this.getCurrentUtcTime();
    const signature2 = this.sha512(`${httpMethod2} ${path2} ${utcTime2} ${RABBITSIGN_API_KEY_SECRET}`);
    const headers2 = {
      'x-rabbitsign-api-key-id': RABBITSIGN_API_KEY_ID,
      'x-rabbitsign-api-signature': signature2,
      'x-rabbitsign-api-time-utc': utcTime2,
      'Content-Type': 'application/json',
    };

    // Transform signers into the required format
    const signerInfo = signers.reduce((acc, signer, index) => {
      acc[signer.email] = {
        name: signer.name,
        fields: [
          {
            id: index + 1,
            type: "SIGNATURE",
            currentValue: "",
            position: {
              docNumber: 0,
              pageIndex: 0,
              x: signer.position.x,
              y: signer.position.y,
              width: 120,
              height: 40,
            },
          },
        ],
      };
      return acc;
    }, {});

    const body2 = {
      folder: {
        title: fileName,
        summary: 'Sent via API',
        docInfo: [
          {
            url: uploadUrl,
            docTitle: fileName,
          },
        ],
        signerInfo,
      },
      date: this.getTodayInLocalTimezone(),
    };

    const folderResp = await axios.post('https://www.rabbitsign.com/api/v1/folder', body2, { 
      headers: headers2 
    });

    return folderResp.data;
  }
} 