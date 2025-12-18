import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-tab.entity';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type PageLayoutWidgetEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    PageLayoutWidgetEntity,
    | PageLayoutTabEntity
    | ObjectMetadataEntity
    | WorkspaceEntity
    | ApplicationEntity
  >;

export type FlatPageLayoutWidget = FlatEntityFrom<
  PageLayoutWidgetEntity,
  PageLayoutWidgetEntityRelationProperties
>;
