import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  Matches,
  IsUUID,
  ValidateIf,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  OrganizationHierarchyLevel,
  ORGANIZATION_LEVEL_VALIDATION_CONSTANTS,
} from 'src/mkt-core/mkt-organization-level/constants';
import {
  DefaultPermissions,
  AccessLimitations,
} from 'src/mkt-core/mkt-organization-level/types';

export class CreateOrganizationLevelDto {
  @IsString({ message: 'Level code must be a string' })
  @MinLength(ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_CODE.MIN_LENGTH, {
    message: `Level code must be at least ${ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_CODE.MIN_LENGTH} characters long`,
  })
  @MaxLength(ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_CODE.MAX_LENGTH, {
    message: `Level code cannot exceed ${ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_CODE.MAX_LENGTH} characters`,
  })
  @Matches(ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_CODE.REGEX, {
    message:
      'Level code must start with a letter and contain only uppercase letters, numbers, and underscores',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  levelCode: string;

  @IsString({ message: 'Level name must be a string' })
  @MinLength(ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_NAME.MIN_LENGTH, {
    message: `Level name must be at least ${ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_NAME.MIN_LENGTH} character long`,
  })
  @MaxLength(ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_NAME.MAX_LENGTH, {
    message: `Level name cannot exceed ${ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_NAME.MAX_LENGTH} characters`,
  })
  @Transform(({ value }) => value?.trim())
  levelName: string;

  @IsOptional()
  @IsString({ message: 'Level name (English) must be a string' })
  @MaxLength(ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_NAME_EN.MAX_LENGTH, {
    message: `Level name (English) cannot exceed ${ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.LEVEL_NAME_EN.MAX_LENGTH} characters`,
  })
  @Transform(({ value }) => value?.trim())
  levelNameEn?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.DESCRIPTION.MAX_LENGTH, {
    message: `Description cannot exceed ${ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.DESCRIPTION.MAX_LENGTH} characters`,
  })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsNumber({}, { message: 'Hierarchy level must be a number' })
  @IsInt({ message: 'Hierarchy level must be an integer' })
  @Min(OrganizationHierarchyLevel.MIN, {
    message: `Hierarchy level must be >= ${OrganizationHierarchyLevel.MIN}`,
  })
  @Max(OrganizationHierarchyLevel.MAX, {
    message: `Hierarchy level must be <= ${OrganizationHierarchyLevel.MAX}`,
  })
  hierarchyLevel: number;

  @IsOptional()
  @ValidateIf((o) => o.hierarchyLevel > OrganizationHierarchyLevel.MIN)
  @IsUUID('4', { message: 'Parent level ID must be a valid UUID' })
  parentLevelId?: string;

  @ValidateIf((o) => o.hierarchyLevel === OrganizationHierarchyLevel.MIN)
  @IsOptional()
  parentLevelId_shouldBeEmpty?: null;

  @IsOptional()
  @IsNumber({}, { message: 'Display order must be a number' })
  @IsInt({ message: 'Display order must be an integer' })
  @Min(ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.DISPLAY_ORDER.MIN_VALUE, {
    message: `Display order must be >= ${ORGANIZATION_LEVEL_VALIDATION_CONSTANTS.DISPLAY_ORDER.MIN_VALUE}`,
  })
  displayOrder?: number;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsObject({ message: 'Default permissions must be an object' })
  defaultPermissions?: DefaultPermissions; // If not provided, defaults to JUNIOR_STAFF template

  @IsOptional()
  @IsObject({ message: 'Access limitations must be an object' })
  accessLimitations?: AccessLimitations; // If not provided, defaults to JUNIOR_STAFF template
}
