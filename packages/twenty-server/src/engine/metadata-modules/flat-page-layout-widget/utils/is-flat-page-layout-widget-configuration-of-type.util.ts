import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export function isFlatPageLayoutWidgetConfigurationOfType<
  Widget extends FlatPageLayoutWidget<WidgetConfigurationType>,
  Type extends WidgetConfigurationType,
>(
  widget: Pick<Widget, 'configuration'>,
  type: Type,
): widget is Widget & FlatPageLayoutWidget<Type> {
  return widget.configuration.configurationType === type;
}
