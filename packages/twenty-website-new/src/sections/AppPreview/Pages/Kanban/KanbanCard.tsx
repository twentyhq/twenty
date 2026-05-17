import { RatingStarIcon } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheck,
  IconCurrencyDollar,
  IconId,
  IconStar,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';

import type { CellEntity, CellPerson, KanbanCard } from '../../types';
import { FaviconLogo } from '../../Shared/components/FaviconLogo';
import { PersonAvatar } from '../../Shared/components/PersonAvatar';
import { Chip } from '../../Shared/components/Chip';
import {
  KANBAN_PAGE_COLORS,
  KANBAN_PAGE_FONT,
  KANBAN_PAGE_TABLER_STROKE,
} from './kanban-page-theme';

const Card = styled.div`
  background: ${KANBAN_PAGE_COLORS.backgroundSecondary};
  border: 1px solid ${KANBAN_PAGE_COLORS.border};
  border-radius: 4px;
  box-shadow: ${KANBAN_PAGE_COLORS.shadow};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  padding: 8px 8px 4px;
`;

const CardTitle = styled.span`
  color: ${KANBAN_PAGE_COLORS.text};
  font-family: ${KANBAN_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div<{ $checked?: boolean }>`
  align-items: center;
  background: ${({ $checked }) =>
    $checked ? KANBAN_PAGE_COLORS.accentSurfaceSoft : 'transparent'};
  border: 1px solid
    ${({ $checked }) =>
      $checked
        ? KANBAN_PAGE_COLORS.accentBorder
        : KANBAN_PAGE_COLORS.borderStrong};
  border-radius: 3px;
  color: ${KANBAN_PAGE_COLORS.textSecondary};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const CardFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px 4px 10px;
`;

const FieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 24px;
  width: 100%;
`;

const FieldIcon = styled.div`
  align-items: center;
  color: ${KANBAN_PAGE_COLORS.textTertiary};
  display: flex;
  flex: 0 0 16px;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const FieldValueWrap = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

const FieldText = styled.span`
  color: ${KANBAN_PAGE_COLORS.text};
  font-family: ${KANBAN_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StarsRow = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 2px;
  padding: 0 4px;
`;

const StarGlyph = styled.span`
  align-items: center;
  display: inline-flex;
  height: 12px;
  justify-content: center;
  width: 12px;
`;

function EntityChip({ entity }: { entity: CellEntity }) {
  return (
    <Chip
      clickable={false}
      label={entity.name}
      leftComponent={<FaviconLogo domain={entity.domain} label={entity.name} />}
      maxWidth={152}
    />
  );
}

function PersonChip({ person }: { person: CellPerson }) {
  return (
    <Chip
      clickable={false}
      label={person.name}
      leftComponent={<PersonAvatar person={person} />}
      maxWidth={152}
    />
  );
}

function RatingValue({ rating }: { rating: number }) {
  return (
    <StarsRow>
      {Array.from({ length: 5 }, (_, index) => (
        <StarGlyph key={index}>
          <RatingStarIcon
            fillColor={
              index < rating ? KANBAN_PAGE_COLORS.textSecondary : '#d6d6d6'
            }
          />
        </StarGlyph>
      ))}
    </StarsRow>
  );
}

function Checkbox({ checked = false }: { checked?: boolean }) {
  return (
    <CheckboxContainer>
      <CheckboxBox $checked={checked}>
        {checked ? (
          <IconCheck
            aria-hidden
            color={KANBAN_PAGE_COLORS.textSecondary}
            size={10}
            stroke={KANBAN_PAGE_TABLER_STROKE}
          />
        ) : null}
      </CheckboxBox>
    </CheckboxContainer>
  );
}

export function KanbanCard({ card }: { card: KanbanCard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
        <Checkbox checked={card.checked} />
      </CardHeader>

      <CardFields>
        <FieldRow>
          <FieldIcon>
            <IconCurrencyDollar
              aria-hidden
              color={KANBAN_PAGE_COLORS.textTertiary}
              size={16}
              stroke={KANBAN_PAGE_TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <FieldText>{card.amount}</FieldText>
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconBuildingSkyscraper
              aria-hidden
              color={KANBAN_PAGE_COLORS.textTertiary}
              size={16}
              stroke={KANBAN_PAGE_TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <EntityChip entity={card.company} />
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconUserCircle
              aria-hidden
              color={KANBAN_PAGE_COLORS.textTertiary}
              size={16}
              stroke={KANBAN_PAGE_TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <PersonChip person={card.accountOwner} />
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconStar
              aria-hidden
              color={KANBAN_PAGE_COLORS.textTertiary}
              size={16}
              stroke={KANBAN_PAGE_TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <RatingValue rating={card.rating} />
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconCalendarEvent
              aria-hidden
              color={KANBAN_PAGE_COLORS.textTertiary}
              size={16}
              stroke={KANBAN_PAGE_TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <FieldText>{card.date}</FieldText>
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconUser
              aria-hidden
              color={KANBAN_PAGE_COLORS.textTertiary}
              size={16}
              stroke={KANBAN_PAGE_TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <PersonChip person={card.mainContact} />
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconId
              aria-hidden
              color={KANBAN_PAGE_COLORS.textTertiary}
              size={16}
              stroke={KANBAN_PAGE_TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <FieldText>{card.recordId}</FieldText>
          </FieldValueWrap>
        </FieldRow>
      </CardFields>
    </Card>
  );
}
