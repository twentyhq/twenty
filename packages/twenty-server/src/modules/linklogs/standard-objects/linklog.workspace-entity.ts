import { Field, ObjectType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { LINKLOGS_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'product';

export const SEARCH_FIELDS_FOR_LINKLOGS: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.linklogs,
  namePlural: 'linklogs',
  labelSingular: msg`Linklog`,
  labelPlural: msg`Linklogs`,
  description: msg`Logs of access to traceable links`,
  icon: 'IconLink',
  labelIdentifierStandardId: LINKLOGS_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
@ObjectType()
export class LinkLogsWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Name of the traceable access log`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  @Field(() => String)
  product: string;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.linkName,
    type: FieldMetadataType.TEXT,
    label: msg`Linklog link Name`,
    description: msg`Link Name`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  linkName: string;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.linkId,
    type: FieldMetadataType.TEXT,
    label: msg`Link ID`,
    description: msg`ID of the traceable link associated with this log`,
    icon: 'IconLink',
  })
  @Field(() => String, { nullable: true })
  linkId: string;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.utmSource,
    type: FieldMetadataType.TEXT,
    label: msg`UTM Source`,
    description: msg`Source of the traffic (e.g., Google, Facebook)`,
    icon: 'IconMessage',
  })
  @Field(() => String)
  utmSource: string;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.utmMedium,
    type: FieldMetadataType.TEXT,
    label: msg`UTM Medium`,
    description: msg`Medium of the traffic (e.g., cpc, email)`,
    icon: 'IconMessage',
  })
  @Field(() => String)
  utmMedium: string;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Charge record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.utmCampaign,
    type: FieldMetadataType.TEXT,
    label: msg`UTM Campaign`,
    description: msg`Campaign associated with the traffic`,
    icon: 'IconMessage',
  })
  @Field(() => String)
  utmCampaign: string;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.userIp,
    type: FieldMetadataType.TEXT,
    label: msg`User IP`,
    description: msg`IP address of the user who accessed the link`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  userIp: string | null;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.userAgent,
    type: FieldMetadataType.TEXT,
    label: msg`User Agent`,
    description: msg`User agent of the browser/device used to access the link`,
    icon: 'IconDeviceMobile',
  })
  @WorkspaceIsNullable()
  @Field(() => String, { nullable: true })
  userAgent: string | null;

  @WorkspaceField({
    standardId: LINKLOGS_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_LINKLOGS,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: any;
}
