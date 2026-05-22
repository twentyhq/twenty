import { z } from 'zod';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

export const pageLayoutTypeSchema = z.enum([
  PageLayoutType.RECORD_PAGE,
  PageLayoutType.RECORD_INDEX,
  PageLayoutType.STANDALONE_PAGE,
  PageLayoutType.DASHBOARD,
]);
