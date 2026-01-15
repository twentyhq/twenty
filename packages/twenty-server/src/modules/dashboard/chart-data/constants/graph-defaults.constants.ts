import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';

export const GRAPH_DEFAULT_DATE_GRANULARITY =
  ObjectRecordGroupByDateGranularity.DAY;

export const GRAPH_DEFAULT_ORDER_BY = GraphOrderBy.FIELD_ASC;
