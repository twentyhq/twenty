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
  type ShahryarMobileVisitSyncChange,
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

export class ShahryarMobileVisitSyncChangeDTO implements ShahryarMobileVisitSyncChange {
  @IsString()
  localId: string;

  @IsOptional()
  @IsString()
  serverId?: string;

  @IsIn(['create', 'update'])
  operation: ShahryarVisitSyncOperation;

  @IsString()
  assignedMarketId: string;

  @IsString()
  supervisorId: string;

  @IsString()
  checkInAt: string;

  @ValidateNested()
  @Type(() => ShahryarGeoLocationDTO)
  gpsLocation: ShahryarGeoLocationDTO;

  @IsArray()
  @IsUUID('4', { each: true })
  photoFileIds: string[];

  @IsNumber()
  soldCartons: number;

  @IsNumber()
  requestedCartons: number;

  @IsOptional()
  @IsString()
  issue?: string;

  @IsOptional()
  @IsString()
  decisionMaker?: string;

  @IsOptional()
  @IsString()
  requestDetails?: string;

  @IsString()
  report: string;

  @IsOptional()
  @IsString()
  baseServerUpdatedAt?: string;

  @IsString()
  clientUpdatedAt: string;
}

export class ShahryarServerVisitSnapshotDTO implements ShahryarServerVisitSnapshot {
  id: string;
  updatedAt: string;
}

export class ShahryarMobileSyncRequestDTO implements ShahryarMobileSyncRequest {
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsString()
  lastPulledAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShahryarMobileVisitSyncChangeDTO)
  changes: ShahryarMobileVisitSyncChangeDTO[];
}

export class ShahryarMobileSyncAcceptedChangeDTO implements ShahryarMobileSyncAcceptedChange {
  localId: string;
  serverId?: string;
  operation: ShahryarVisitSyncOperation;
  acceptedAt: string;
}

export class ShahryarMobileSyncConflictDTO implements ShahryarMobileServerSyncConflict {
  localId: string;
  serverId: string;
  reason: 'server-newer';
  clientUpdatedAt: string;
  serverUpdatedAt: string;
}

export class ShahryarMobileSyncRejectedChangeDTO implements ShahryarMobileSyncRejectedChange {
  localId: string;
  reason:
    | 'invalid-carton-count'
    | 'invalid-timestamp'
    | 'missing-server-id'
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
