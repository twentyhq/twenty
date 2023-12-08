import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { TokenService } from 'src/core/auth/services/token.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

@Injectable()
export class OpenApiService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async generateSchema(request: Request) {
    const workspace = await this.tokenService.validateToken(request);

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspace.id);

    if (!objectMetadataItems.length) {
      throw new BadRequestException(`No object found`);
    }

    return { data: 'toto' };
  }
}
