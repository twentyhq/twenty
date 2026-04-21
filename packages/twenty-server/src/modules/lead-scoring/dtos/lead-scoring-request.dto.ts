import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class LeadScoreInputDto {
  @IsInt()
  @Min(0)
  emailOpens: number;

  @IsInt()
  @Min(0)
  emailClicks: number;

  @IsInt()
  @Min(0)
  pageViews: number;

  @IsInt()
  @Min(0)
  formSubmissions: number;

  @IsInt()
  @Min(0)
  websiteVisits: number;

  @IsInt()
  @Min(0)
  daysSinceLastActivity: number;

  @IsNumber()
  @Min(0)
  emailResponseRate: number;

  @IsInt()
  @Min(0)
  eventAttendance: number;

  @IsInt()
  @Min(0)
  contentDownloads: number;

  @IsInt()
  @Min(0)
  socialEngagement: number;
}

export class LeadBatchScoreItemDto {
  @IsString()
  leadId: string;

  @ValidateNested()
  @Type(() => LeadScoreInputDto)
  data: LeadScoreInputDto;
}

export class LeadBatchScoreRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeadBatchScoreItemDto)
  leads: LeadBatchScoreItemDto[];
}
