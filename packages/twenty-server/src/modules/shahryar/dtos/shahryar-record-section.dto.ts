import { IsBoolean, IsObject, IsString } from 'class-validator';

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
  path: string;
  row: string[];
  createdAt: string;
}
