import { Chip } from '@/app-preview/primitives/Chip';
import { FaviconLogo } from '@/app-preview/primitives/FaviconLogo';

import { type DealCompany } from '../deal-types';

export function CompanyChip({ company }: { company: DealCompany }) {
  return (
    <Chip
      clickable={false}
      label={company.name}
      leftComponent={
        <FaviconLogo domain={company.domain} label={company.name} />
      }
      maxWidth={152}
      variant="highlighted"
    />
  );
}
