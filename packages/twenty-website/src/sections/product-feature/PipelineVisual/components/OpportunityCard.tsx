import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCreativeCommonsSa,
  IconCurrencyDollar,
  IconUser,
} from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { PreviewAvatar } from '@/app-preview/primitives/PreviewAvatar';

import { type DealData } from '../types/deal-data';
import { CompanyChip } from './CompanyChip';
import { CreatedByChip } from './CreatedByChip';
import { DealPersonChip } from './DealPersonChip';
import { FieldRow } from './FieldRow';

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  padding: 8px 8px 4px;
`;

const CardIdentifier = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
`;

const CardTitle = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  flex: 1 1 auto;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardCheckbox = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  margin-left: auto;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  padding: 5px;
  pointer-events: none;
  transition: all ease-in-out 160ms;
`;

const CheckboxBox = styled.div`
  border: 1px solid ${THEME_LIGHT.border.color.secondaryInverted};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  flex-shrink: 0;
  height: 14px;
  width: 14px;
`;

const CardFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px 4px 10px;
`;

const FieldText = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HoverableValue = styled.div`
  align-items: center;
  border-radius: ${THEME_LIGHT.border.radius.sm};
  cursor: pointer;
  display: inline-flex;
  max-width: 100%;
  min-width: 0;
  outline: 1px solid transparent;
  outline-offset: -1px;
  overflow: hidden;
  padding: 2px 4px;

  &:hover {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }

  &[data-readonly] {
    cursor: default;
  }

  &[data-readonly]:hover {
    background-color: transparent;
    outline-color: ${THEME_LIGHT.border.color.medium};
  }
`;

export function OpportunityCard({ data }: { data: DealData }) {
  return (
    <>
      <CardHeader>
        <CardIdentifier>
          <PreviewAvatar size={16} tone={data.avatarTone}>
            {data.title.charAt(0)}
          </PreviewAvatar>
          <CardTitle>{data.title}</CardTitle>
        </CardIdentifier>
        <CardCheckbox className="deal-card-checkbox">
          <CheckboxBox />
        </CardCheckbox>
      </CardHeader>
      <CardFields>
        <FieldRow icon={IconCurrencyDollar}>
          <HoverableValue>
            <FieldText>{data.amount}</FieldText>
          </HoverableValue>
        </FieldRow>
        <FieldRow icon={IconCreativeCommonsSa}>
          <HoverableValue data-readonly="">
            <CreatedByChip actor={data.createdBy} />
          </HoverableValue>
        </FieldRow>
        <FieldRow icon={IconCalendarEvent}>
          <HoverableValue>
            <FieldText>{data.date}</FieldText>
          </HoverableValue>
        </FieldRow>
        <FieldRow icon={IconBuildingSkyscraper}>
          <CompanyChip company={data.company} />
        </FieldRow>
        <FieldRow icon={IconUser}>
          <DealPersonChip person={data.contact} />
        </FieldRow>
      </CardFields>
    </>
  );
}
