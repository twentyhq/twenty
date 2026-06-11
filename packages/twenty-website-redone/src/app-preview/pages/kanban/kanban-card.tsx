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
import { type ComponentType, type ReactNode } from 'react';

import { RatingStar } from '@/icons';
import { EASING } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { Chip } from '../../primitives/chip';
import { FaviconLogo } from '../../primitives/favicon-logo';
import { PersonAvatar } from '../../primitives/person-avatar';
import { PREVIEW_COLORS } from '../../preview-colors';
import {
  type CellEntity,
  type CellPerson,
  type KanbanCard as KanbanCardData,
} from '../../types';

const theme = APP_PREVIEW_THEME;

const Card = styled.div`
  animation: kanbanCardAppear 320ms ${EASING.standard} both;
  background: ${PREVIEW_COLORS.backgroundSecondary};
  border: 1px solid ${PREVIEW_COLORS.border};
  border-radius: 4px;
  box-shadow: ${theme.boxShadow.light};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @keyframes kanbanCardAppear {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  padding: 8px 8px 4px;
`;

const CardTitle = styled.span`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
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
    $checked ? PREVIEW_COLORS.accentSurfaceSoft : 'transparent'};
  border: 1px solid
    ${({ $checked }) =>
      $checked ? PREVIEW_COLORS.accentBorder : PREVIEW_COLORS.borderStrong};
  border-radius: 3px;
  color: ${PREVIEW_COLORS.textSecondary};
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

const FieldRowShell = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 24px;
  width: 100%;
`;

const FieldIcon = styled.div`
  align-items: center;
  color: ${PREVIEW_COLORS.textTertiary};
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
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
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
      variant="highlighted"
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
      variant="highlighted"
    />
  );
}

function FieldRow({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{
    'aria-hidden'?: boolean;
    color?: string;
    size?: number;
    stroke?: number;
  }>;
  children: ReactNode;
}) {
  return (
    <FieldRowShell>
      <FieldIcon>
        <Icon
          aria-hidden
          color={PREVIEW_COLORS.textTertiary}
          size={16}
          stroke={theme.icon.stroke.sm}
        />
      </FieldIcon>
      <FieldValueWrap>{children}</FieldValueWrap>
    </FieldRowShell>
  );
}

export function KanbanCard({ card }: { card: KanbanCardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
        <CheckboxContainer>
          <CheckboxBox $checked={card.checked}>
            {card.checked ? (
              <IconCheck
                aria-hidden
                color={PREVIEW_COLORS.textSecondary}
                size={10}
                stroke={theme.icon.stroke.sm}
              />
            ) : null}
          </CheckboxBox>
        </CheckboxContainer>
      </CardHeader>
      <CardFields>
        <FieldRow icon={IconCurrencyDollar}>
          <FieldText>{card.amount}</FieldText>
        </FieldRow>
        <FieldRow icon={IconBuildingSkyscraper}>
          <EntityChip entity={card.company} />
        </FieldRow>
        <FieldRow icon={IconUserCircle}>
          <PersonChip person={card.accountOwner} />
        </FieldRow>
        <FieldRow icon={IconStar}>
          <StarsRow>
            {Array.from({ length: 5 }, (_, index) => (
              <StarGlyph key={index}>
                <RatingStar
                  fillColor={
                    index < card.rating
                      ? PREVIEW_COLORS.textSecondary
                      : PREVIEW_COLORS.borderStrong
                  }
                />
              </StarGlyph>
            ))}
          </StarsRow>
        </FieldRow>
        <FieldRow icon={IconCalendarEvent}>
          <FieldText>{card.date}</FieldText>
        </FieldRow>
        <FieldRow icon={IconUser}>
          <PersonChip person={card.mainContact} />
        </FieldRow>
        <FieldRow icon={IconId}>
          <FieldText>{card.recordId}</FieldText>
        </FieldRow>
      </CardFields>
    </Card>
  );
}
