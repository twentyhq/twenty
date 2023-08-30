import { EntitySchema } from 'typeorm';

import entityJson from './company-v2.entity.json';

export const CompanyEntity = new EntitySchema(entityJson as any);
