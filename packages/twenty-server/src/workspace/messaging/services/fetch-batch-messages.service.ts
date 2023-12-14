import { Injectable } from '@nestjs/common';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';

@Injectable()
export class FetchBatchMessagesService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {
    const gmailBatchEndpoint = 'https://www.googleapis.com/batch/gmail/v1';

    const fetchBatch = async (messageQueries, refreshToken) => {
      const batch = await fetch(`${gmailBatchEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/mixed',
          'Content-Length': '1000',
          Authorization: 'Bearer ' + refreshToken,
        },
        body: '', //TODO: build body
      });

      console.log('batch', batch);
    };
  }
}
