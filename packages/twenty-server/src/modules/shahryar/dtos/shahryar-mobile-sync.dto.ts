import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  type ShahryarGeoLocation,
  type ShahryarMobileRecordKind,
  type ShahryarMobileNotificationRegistrationRequest,
  type ShahryarMobileNotificationRegistrationResponse,
  type ShahryarMobilePhotoAssociationRequest,
  type ShahryarMobilePhotoAssociationResponse,
  type ShahryarMobileServerSyncConflict,
  type ShahryarMobileSyncAcceptedChange,
  type ShahryarMobileSyncPullResponse,
  type ShahryarMobileSyncRejectedChange,
  type ShahryarMobileSyncRequest,
  type ShahryarMobileSyncResponse,
  type ShahryarServerRecordSnapshot,
  type ShahryarServerVisitSnapshot,
  type ShahryarVisitSyncOperation,
} from 'twenty-shared/shahryar';

export class ShahryarGeoLocationDTO implements ShahryarGeoLocation {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class ShahryarMobileSyncChangeDTO {
  @IsOptional()
  @IsIn(['visit', 'working-time', 'payment', 'absence'])
  recordKind?: ShahryarMobileRecordKind;

  @IsString()
  localId: string;

  @IsOptional()
  @IsString()
  serverId?: string;

  @IsIn(['create', 'update'])
  operation: ShahryarVisitSyncOperation;

  @IsOptional()
  @IsString()
  assignedMarketId?: string;

  @IsOptional()
  @IsString()
  supervisorId?: string;

  @IsOptional()
  @IsString()
  checkInAt?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShahryarGeoLocationDTO)
  gpsLocation?: ShahryarGeoLocationDTO;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  photoFileIds?: string[];

  @IsOptional()
  @IsNumber()
  soldCartons?: number;

  @IsOptional()
  @IsNumber()
  requestedCartons?: number;

  @IsOptional()
  @IsString()
  issue?: string;

  @IsOptional()
  @IsString()
  decisionMaker?: string;

  @IsOptional()
  @IsString()
  requestDetails?: string;

  @IsOptional()
  @IsString()
  report?: string;

  @IsOptional()
  @IsString()
  workDate?: string;

  @IsOptional()
  @IsString()
  checkOutAt?: string;

  @IsOptional()
  @IsNumber()
  totalMinutes?: number;

  @IsOptional()
  @IsString()
  marketId?: string;

  @IsOptional()
  @IsString()
  collectedById?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  paidAt?: string;

  @IsOptional()
  @IsIn(['PRESENT', 'LATE', 'ABSENT', 'CLOSED', 'OPEN', 'PARTIAL'])
  status?: 'PRESENT' | 'LATE' | 'ABSENT' | 'CLOSED' | 'OPEN' | 'PARTIAL';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  absenceDate?: string;

  @IsOptional()
  @IsString()
  workingTime?: string;

  @IsOptional()
  @IsIn(['ABSENT', 'LATE', 'NO_WORK'])
  reason?: 'ABSENT' | 'LATE' | 'NO_WORK';

  @IsOptional()
  @IsString()
  baseServerUpdatedAt?: string;

  @IsString()
  clientUpdatedAt: string;
}

export class ShahryarMobileVisitSyncChangeDTO extends ShahryarMobileSyncChangeDTO {}

export class ShahryarServerVisitSnapshotDTO implements ShahryarServerVisitSnapshot {
  id: string;
  updatedAt: string;
}

export class ShahryarServerRecordSnapshotDTO implements ShahryarServerRecordSnapshot {
  id: string;
  recordKind: ShahryarMobileRecordKind;
  updatedAt: string;
}

export class ShahryarMobileSyncRequestDTO implements Omit<
  ShahryarMobileSyncRequest,
  'changes'
> {
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsString()
  lastPulledAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShahryarMobileSyncChangeDTO)
  changes: ShahryarMobileSyncChangeDTO[];
}

export class ShahryarMobileSyncAcceptedChangeDTO implements ShahryarMobileSyncAcceptedChange {
  localId: string;
  recordKind: ShahryarMobileRecordKind;
  serverId?: string;
  operation: ShahryarVisitSyncOperation;
  acceptedAt: string;
}

export class ShahryarMobileSyncConflictDTO implements ShahryarMobileServerSyncConflict {
  localId: string;
  serverId: string;
  recordKind: ShahryarMobileRecordKind;
  reason: 'server-newer';
  clientUpdatedAt: string;
  serverUpdatedAt: string;
}

export class ShahryarMobileSyncRejectedChangeDTO implements ShahryarMobileSyncRejectedChange {
  localId: string;
  recordKind?: ShahryarMobileRecordKind;
  reason:
    | 'invalid-amount'
    | 'invalid-carton-count'
    | 'invalid-duration'
    | 'invalid-timestamp'
    | 'missing-server-id'
    | 'missing-required-field'
    | 'unauthorized-supervisor';
}

export class ShahryarMobileSyncResponseDTO implements ShahryarMobileSyncResponse {
  deviceId: string;
  nextPullCursor: string;
  acceptedChanges: ShahryarMobileSyncAcceptedChangeDTO[];
  conflicts: ShahryarMobileSyncConflictDTO[];
  rejectedChanges: ShahryarMobileSyncRejectedChangeDTO[];
}

export class ShahryarMobileSyncPullResponseDTO implements ShahryarMobileSyncPullResponse {
  serverTime: string;
  nextPullCursor: string;
  currentSupervisorId?: string;
  assignedMarkets: ShahryarMobileSyncPullResponse['assignedMarkets'];
  serverVisits: ShahryarServerVisitSnapshotDTO[];
  serverRecords: ShahryarServerRecordSnapshotDTO[];
}

export class ShahryarMobilePhotoAssociationRequestDTO implements ShahryarMobilePhotoAssociationRequest {
  @IsString()
  localPhotoId: string;

  @IsUUID('4')
  fileId: string;

  @IsIn(['market', 'visit'])
  targetType: 'market' | 'visit';

  @IsString()
  targetId: string;

  @IsString()
  capturedAt: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShahryarGeoLocationDTO)
  gpsLocation?: ShahryarGeoLocationDTO;
}

export class ShahryarMobilePhotoAssociationResponseDTO implements ShahryarMobilePhotoAssociationResponse {
  localPhotoId: string;
  fileId: string;
  targetType: 'market' | 'visit';
  targetId: string;
  associatedAt: string;
}

export class ShahryarMobileNotificationRegistrationRequestDTO implements ShahryarMobileNotificationRegistrationRequest {
  @IsString()
  deviceId: string;

  @IsString()
  expoPushToken: string;

  @IsIn(['android', 'ios'])
  platform: 'android' | 'ios';
}

export class ShahryarMobileNotificationRegistrationResponseDTO implements ShahryarMobileNotificationRegistrationResponse {
  deviceId: string;
  registeredAt: string;
  enabledNotificationKinds: Array<'missing-report' | 'missed-visit'>;
}
