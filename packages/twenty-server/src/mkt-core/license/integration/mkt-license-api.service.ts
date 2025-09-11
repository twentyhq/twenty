import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';

import { MKT_LICENSE_STATUS } from 'src/mkt-core/license/license.constants';

export interface LicenseApiResponse {
  licenseKey: string;
  status: string;
  expiresAt: string;
  // add other fields according to API response
}

@Injectable()
export class MktLicenseApiService {
  private readonly logger = new Logger(MktLicenseApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchLicenseFromApi(
    orderId: string,
    orderName: string,
    orderItemId?: string,
  ): Promise<LicenseApiResponse> {
    try {
      this.logger.log(`Fetching license from API for order: ${orderId}`);

      // replace with actual API URL
      const apiUrl =
        process.env.LICENSE_API_URL ||
        'https://api.license-provider.com/licenses';

      const requestBody = {
        orderId,
        orderName,
        ...(orderItemId && { orderItemId }), // include orderItemId if provided
        // add other necessary information
      };

      this.logger.log(`Request body:`, requestBody);

      const response = await firstValueFrom(
        this.httpService.post<LicenseApiResponse>(apiUrl, requestBody),
      );

      this.logger.log(`Successfully fetched license for order: ${orderId}`);

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch license from API for order: ${orderId}`,
        error,
      );
      // generate unique mock license key based on orderId and orderItemId
      const uniqueSuffix = orderItemId
        ? `_ITEM_${orderItemId.slice(-8)}`
        : `_ORDER_${orderId.slice(-8)}`;
      const mockResponse = {
        licenseKey: `MOCK_LICENSE${uniqueSuffix}_${Date.now()}`,
        status: MKT_LICENSE_STATUS.ACTIVE,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 1 year from now
      };

      this.logger.log(`Mock response:`, mockResponse);

      return mockResponse;
      //throw error;
    }
  }
}
