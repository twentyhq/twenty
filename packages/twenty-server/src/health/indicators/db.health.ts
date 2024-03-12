import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';

@Injectable()
export class DBHealthIndicator extends HealthIndicator {
  constructor(private readonly typeORMService: TypeORMService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.typeORMService.getMainDataSource().query(`SELECT 1`);

      return this.getStatus('db', true);
    } catch (e) {
      throw new HealthCheckError('TypeORM DB Connection check failed', e);
    }
  }
}
