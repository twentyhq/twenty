import { type GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';

export type WidgetConfigurationType =
  | `${GraphType}`
  | 'IFRAME'
  | 'STANDALONE_RICH_TEXT';
