import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.traceableAcessLogs,
  namePlural: 'traceableAccessLogs',
  labelSingular: msg`TraceableAccessLog`,
  labelPlural: msg`TraceableAccessLogs`,
  description: msg`Logs of access to traceable links`,
  icon: 'IconLink',
  labelIdentifierStandardId: TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
export class TraceableAccessLogsWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Name of the traceable access log`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS.linkId,
    type: FieldMetadataType.TEXT,
    label: msg`Link ID`,
    description: msg`ID of the traceable link associated with this log`,
    icon: 'IconLink',
  })
  linkId: string;

  @WorkspaceField({
    standardId: TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS.utmSource,
    type: FieldMetadataType.TEXT,
    label: msg`UTM Source`,
    description: msg`Source of the traffic (e.g., Google, Facebook)`,
    icon: 'IconMessage',
  })
  utmSource: string;

  @WorkspaceField({
    standardId: TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS.utmMedium,
    type: FieldMetadataType.TEXT,
    label: msg`UTM Medium`,
    description: msg`Medium of the traffic (e.g., cpc, email)`,
    icon: 'IconMessage',
  })
  utmMedium: string;

  @WorkspaceField({
    standardId: TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS.utmCampaign,
    type: FieldMetadataType.TEXT,
    label: msg`UTM Campaign`,
    description: msg`Campaign associated with the traffic`,
    icon: 'IconMessage',
  })
  utmCampaign: string;

  @WorkspaceField({
    standardId: TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS.userIp,
    type: FieldMetadataType.TEXT,
    label: msg`User IP`,
    description: msg`IP address of the user who accessed the link`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  userIp: string | null;

  @WorkspaceField({
    standardId: TRACEABLE_ACCESS_LOGS_STANDARD_FIELD_IDS.userAgent,
    type: FieldMetadataType.TEXT,
    label: msg`User Agent`,
    description: msg`User agent of the browser/device used to access the link`,
    icon: 'IconDeviceMobile',
  })
  @WorkspaceIsNullable()
  userAgent: string | null;
}
