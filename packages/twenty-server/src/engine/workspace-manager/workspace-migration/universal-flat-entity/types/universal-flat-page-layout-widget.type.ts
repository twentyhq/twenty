import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatPageLayoutWidget = UniversalFlatEntityFrom<
  PageLayoutWidgetEntity,
  'pageLayoutWidget'
>;
