import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PropertyPlatformService {
  private readonly apiUrl = 'https://api.propertyplatform.com'; // Replace with the actual API URL
  private readonly apiKey = process.env.PROPERTY_PLATFORM_API_KEY;

  async getListings(params: any): Promise<any> {
    const response = await axios.get(`${this.apiUrl}/listings`, {
      params,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
    return response.data;
  }
}
