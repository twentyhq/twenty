import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import {
  paginateByIdCursor,
  type RestCursorPageInfo,
} from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataRestApiExceptionFilter } from 'src/engine/metadata-modules/field-metadata/filters/field-metadata-rest-api-exception.filter';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { fromFieldMetadataEntityToFieldMetadataDto } from 'src/engine/metadata-modules/field-metadata/utils/from-field-metadata-entity-to-field-metadata-dto.util';
import {
  toLegacyFieldMetadataCreateResponse,
  toLegacyFieldMetadataDeleteResponse,
  toLegacyFieldMetadataFindOneResponse,
  toLegacyFieldMetadataListResponse,
  toLegacyFieldMetadataUpdateResponse,
} from 'src/engine/metadata-modules/field-metadata/utils/to-legacy-field-metadata-response.util';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';

@Controller('rest/metadata/fields')
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@UseFilters(FieldMetadataRestApiExceptionFilter)
@UsePipes(new ValidationPipe())
export class FieldMetadataController {
  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Get()
  async findMany(
    @Req() request: AuthenticatedRequest,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const { items, pageInfo, totalCount } = await paginateByIdCursor({
      repository: this.fieldMetadataRepository,
      workspaceId,
      limit: parseLimitRestRequest(request),
      startingAfter: parseStartingAfterRestRequest(request),
      endingBefore: parseEndingBeforeRestRequest(request),
    });

    const result: {
      data: FieldMetadataDTO[];
      pageInfo: RestCursorPageInfo;
      totalCount: number;
    } = {
      data: items.map(fromFieldMetadataEntityToFieldMetadataDto),
      pageInfo,
      totalCount,
    };

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataListResponse(result);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const field = await this.fieldMetadataRepository.findOne({
      where: { id, workspaceId },
    });

    if (!field) {
      throw new FieldMetadataException(
        'Field metadata not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    const result = fromFieldMetadataEntityToFieldMetadataDto(field);

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataFindOneResponse(result);
  }

  @Post()
  async createOne(
    @Body() input: CreateFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const flatField = await this.fieldMetadataService.createOneField({
      createFieldInput: input,
      workspaceId,
    });

    const result = fromFlatFieldMetadataToFieldMetadataDto(flatField);

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataCreateResponse(result);
  }

  @Patch(':id')
  async updateOnePatch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() update: UpdateFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.handleUpdate({ id, update, workspaceId });
  }

  @Put(':id')
  async updateOnePut(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() update: UpdateFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.handleUpdate({ id, update, workspaceId });
  }

  @Delete(':id')
  async deleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const flatField = await this.fieldMetadataService.deleteOneField({
      deleteOneFieldInput: { id },
      workspaceId,
    });

    const result = fromFlatFieldMetadataToFieldMetadataDto(flatField);

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataDeleteResponse(result);
  }

  private async handleUpdate({
    id,
    update,
    workspaceId,
  }: {
    id: string;
    update: UpdateFieldInput;
    workspaceId: string;
  }) {
    const flatField = await this.fieldMetadataService.updateOneField({
      updateFieldInput: { ...update, id },
      workspaceId,
    });

    const result = fromFlatFieldMetadataToFieldMetadataDto(flatField);

    return (await this.isNewMetadataFormat(workspaceId))
      ? result
      : toLegacyFieldMetadataUpdateResponse(result);
  }

  private async isNewMetadataFormat(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
      workspaceId,
    );
  }
}
