import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';

import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import {
  type ShahryarPhotoUploadRequestDTO,
  type ShahryarPhotoUploadResponseDTO,
} from 'src/modules/shahryar/dtos/shahryar-record-section.dto';
import { ShahryarMobileSyncService } from 'src/modules/shahryar/services/shahryar-mobile-sync.service';

export type ShahryarUploadedPhotoFile = {
  buffer?: Buffer;
  originalname: string;
};

type ShahryarPhotoTargetType = ShahryarPhotoUploadRequestDTO['targetType'];

type ShahryarPhotoTargetConfig = {
  fieldName: 'photos' | 'shopPhotos';
  objectNameSingular: 'shahryarMarket' | 'shahryarSupervisorVisit';
};

type ShahryarPhotoFieldMetadataRow = {
  id: string;
};

const SHAHRYAR_PHOTO_TARGET_CONFIGS: Record<
  ShahryarPhotoTargetType,
  ShahryarPhotoTargetConfig
> = {
  market: {
    fieldName: 'shopPhotos',
    objectNameSingular: 'shahryarMarket',
  },
  visit: {
    fieldName: 'photos',
    objectNameSingular: 'shahryarSupervisorVisit',
  },
};

@Injectable()
export class ShahryarPhotoService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly filesFieldService: FilesFieldService,
    private readonly shahryarMobileSyncService: ShahryarMobileSyncService,
  ) {}

  async uploadAndAssociatePhoto({
    authorizedSupervisorId,
    file,
    request,
    workspaceId,
  }: {
    authorizedSupervisorId?: string;
    file: ShahryarUploadedPhotoFile | undefined;
    request: ShahryarPhotoUploadRequestDTO;
    workspaceId: string;
  }): Promise<ShahryarPhotoUploadResponseDTO> {
    if (file?.buffer === undefined) {
      throw new BadRequestException('Photo file is required');
    }

    const fieldMetadataId = await this.resolvePhotoFieldMetadataId({
      targetType: request.targetType,
      workspaceId,
    });
    const uploadedFile = await this.filesFieldService.uploadFile({
      file: file.buffer,
      filename: file.originalname,
      fieldMetadataId,
      workspaceId,
    });
    const association = await this.shahryarMobileSyncService.associatePhoto({
      authorizedSupervisorId,
      request: {
        localPhotoId: request.localPhotoId ?? file.originalname,
        fileId: uploadedFile.id,
        targetType: request.targetType,
        targetId: request.targetId,
        capturedAt: request.capturedAt,
      },
      workspaceId,
    });

    return {
      fileId: uploadedFile.id,
      filename: file.originalname,
      targetType: request.targetType,
      targetId: request.targetId,
      associatedAt: association.associatedAt,
      url: uploadedFile.url,
    };
  }

  private async resolvePhotoFieldMetadataId({
    targetType,
    workspaceId,
  }: {
    targetType: ShahryarPhotoTargetType;
    workspaceId: string;
  }): Promise<string> {
    const targetConfig = SHAHRYAR_PHOTO_TARGET_CONFIGS[targetType];
    const [fieldMetadata] = (await this.coreDataSource.query(
      `SELECT field."id"
       FROM "core"."fieldMetadata" field
       INNER JOIN "core"."objectMetadata" object
       ON object."id" = field."objectMetadataId"
       WHERE field."workspaceId" = $1
       AND object."workspaceId" = $1
       AND object."nameSingular" = $2
       AND field."name" = $3
       AND field."type" = 'FILES'
       LIMIT 1`,
      [workspaceId, targetConfig.objectNameSingular, targetConfig.fieldName],
    )) as ShahryarPhotoFieldMetadataRow[];

    if (fieldMetadata === undefined) {
      throw new NotFoundException('Photo field metadata was not found');
    }

    return fieldMetadata.id;
  }
}
