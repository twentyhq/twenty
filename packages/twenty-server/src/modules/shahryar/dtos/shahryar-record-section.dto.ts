import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class ShahryarRecordSectionDTO {
  path: string;
  @IsBoolean()
  canCreate: boolean;
  rows: string[][];
}

export class ShahryarCreateRecordRequestDTO {
  @IsString()
  path: string;

  @IsObject()
  values: Record<string, string>;
}

export class ShahryarCreateRecordResponseDTO {
  id: string;
  path: string;
  row: string[];
  createdAt: string;
}

export class ShahryarPhotoUploadRequestDTO {
  @IsIn(['market', 'visit'])
  targetType: 'market' | 'visit';

  @IsString()
  targetId: string;

  @IsOptional()
  @IsString()
  localPhotoId?: string;

  @IsString()
  capturedAt: string;
}

export class ShahryarPhotoUploadResponseDTO {
  fileId: string;
  filename: string;
  targetType: 'market' | 'visit';
  targetId: string;
  associatedAt: string;
  url: string;
}
