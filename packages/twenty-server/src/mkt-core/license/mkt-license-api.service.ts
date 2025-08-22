import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export interface LicenseApiResponse {
  licenseKey: string;
  status: string;
  expiresAt: string;
  // Thêm các field khác tùy theo API response
}

@Injectable()
export class MktLicenseApiService {
  private readonly logger = new Logger(MktLicenseApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchLicenseFromApi(
    orderId: string,
    orderName: string,
  ): Promise<LicenseApiResponse> {
    try {
      this.logger.log(`Fetching license from API for order: ${orderId}`);

      // Thay thế URL API thực tế của bạn
      const apiUrl =
        process.env.LICENSE_API_URL ||
        'https://api.license-provider.com/licenses';

      const response = await firstValueFrom(
        this.httpService.post<LicenseApiResponse>(apiUrl, {
          orderId,
          orderName,
          // Thêm các thông tin khác cần thiết
        }),
      );

      this.logger.log(`Successfully fetched license for order: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch license from API for order: ${orderId}`,
        error,
      );
      const mockResponse = {
        licenseKey: 'LICENSE_KEY_MOCK',
        status: 'INACTIVE',
        expiresAt: '2025-08-22',
      };
      this.logger.log(`Mock response:`, mockResponse);
      return mockResponse;
      //throw error;
    }
  }
}
