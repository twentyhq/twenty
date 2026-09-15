import { styled } from '@linaria/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { Chip } from '@/app-preview/primitives/Chip';
import { FaviconLogo } from '@/app-preview/primitives/FaviconLogo';
import { PreviewTag } from '@/app-preview/primitives/PreviewTag';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { type ContactColumnId } from '../types/contact-column-id';
import { type ContactCompany } from '../types/contact-company';
import { ActorAvatar } from './ActorAvatar';

const CellText = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BooleanRow = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.primary};
  display: inline-flex;
  gap: 4px;
`;

const BooleanText = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

export function CellValue({
  columnId,
  company,
}: {
  columnId: ContactColumnId;
  company: ContactCompany;
}) {
  switch (columnId) {
    case 'company':
      return (
        <Chip
          isBold
          label={company.name}
          leftComponent={
            <FaviconLogo domain={company.domain} label={company.name} />
          }
          variant="highlighted"
        />
      );
    case 'url':
      return <Chip label={company.domain} variant="static" />;
    case 'createdBy':
      return (
        <Chip
          label={company.createdBy.name}
          leftComponent={<ActorAvatar actor={company.createdBy} />}
          variant="transparent"
        />
      );
    case 'address':
      return <CellText>{company.address}</CellText>;
    case 'accountOwner':
      return (
        <Chip
          label={company.accountOwner.name}
          leftComponent={<ActorAvatar actor={company.accountOwner} />}
          variant="transparent"
        />
      );
    case 'icp':
      return (
        <BooleanRow>
          {company.icp ? <IconCheck size={14} /> : <IconX size={14} />}
          <BooleanText>{company.icp ? 'True' : 'False'}</BooleanText>
        </BooleanRow>
      );
    case 'arr':
      return <CellText>{company.arr}</CellText>;
    case 'industry':
      return <PreviewTag color="gray" label={company.industry} />;
  }
}
