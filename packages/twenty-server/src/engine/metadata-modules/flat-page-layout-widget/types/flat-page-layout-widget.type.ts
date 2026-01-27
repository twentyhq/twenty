import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

export type FlatPageLayoutWidget<
  T extends WidgetConfigurationType = WidgetConfigurationType,
> = FlatEntityFrom<PageLayoutWidgetEntity<T>>;
