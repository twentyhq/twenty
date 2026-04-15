import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconArrowUpRight,
  IconBuildingSkyscraper,
  IconChevronDown,
  IconChevronLeft,
  IconChevronUp,
  IconDatabaseExport,
  IconDatabaseImport,
  IconDotsVertical,
  IconHandClick,
  IconMail,
  IconPlus,
  IconSparkles,
  IconTargetArrow,
  IconTrash,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

const APP_FONT = `'Inter', ${theme.font.family.sans}`;
const TABLER_STROKE = 1.7;

const COLORS = {
  backdrop: '#1b1b1b',
  border: '#ebebeb',
  imageAreaSurface: '#f5f5f3',
  itemBackground: 'rgba(0, 0, 0, 0.04)',
  panelBackground: 'rgba(255, 255, 255, 0.96)',
  panelMuted: '#fcfcfc',
  textLight: '#b3b3b3',
  textSecondary: '#666666',
  textTertiary: '#999999',
  white: '#ffffff',
} as const;

type MenuItemData = {
  highlighted?: boolean;
  icon: ComponentType<{
    'aria-hidden'?: boolean;
    color?: string;
    size?: number | string;
    stroke?: number | string;
  }>;
  label: string;
};

const MENU_SECTIONS: Array<{ items: MenuItemData[]; label: string }> = [
  {
    label: 'Record Selection',
    items: [
      { icon: IconMail, label: 'Send email' },
      {
        highlighted: true,
        icon: IconDatabaseExport,
        label: 'Export selection as CSV',
      },
      { icon: IconTrash, label: 'Delete 8 records' },
    ],
  },
  {
    label: '"Companies" object',
    items: [
      { icon: IconDatabaseImport, label: 'Import data' },
      { icon: IconBuildingSkyscraper, label: 'Create company' },
    ],
  },
  {
    label: 'Navigate',
    items: [
      { icon: IconArrowUpRight, label: 'Go to People' },
      { icon: IconTargetArrow, label: 'Go to Opportunities' },
    ],
  },
];

const VisualRoot = styled.div`
  background: ${COLORS.imageAreaSurface};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const SceneTexture = styled.div`
  inset: 0;
  opacity: 0.4;
  pointer-events: none;
  position: absolute;
`;

const TopStripes = styled.div`
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.32) 0 2px,
    transparent 2px 15px
  );
  inset: 0 0 64% 0;
  position: absolute;
`;

const MidDashes = styled.div`
  background: repeating-linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.26) 0 2px,
      transparent 2px 14px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.18) 0 10px,
      transparent 10px 15px
    );
  inset: 34% 0 34% 0;
  position: absolute;
`;

const BottomDots = styled.div`
  background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.14) 0%,
      rgba(255, 255, 255, 0.08) 26%,
      rgba(255, 255, 255, 0.04) 100%
    ),
    radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.18) 0 1px,
      transparent 1px 100%
    );
  background-size:
    100% 100%,
    12px 12px;
  inset: 48% 0 0 0;
  position: absolute;
`;

const SceneFade = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.04) 18%,
    rgba(255, 255, 255, 0) 42%,
    rgba(0, 0, 0, 0.18) 100%
  );
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

const SceneStage = styled.div`
  aspect-ratio: 411 / 508;
  background: ${COLORS.backdrop};
  height: auto;
  left: 50%;
  overflow: hidden;
  position: absolute;
  top: 16px;
  transform: translateX(-50%);
  width: min(calc(100% - 32px), 411px);
`;

const SceneCanvas = styled.div`
  inset: 0;
  position: absolute;
`;

const SceneFrame = styled.div`
  inset: 0;
  position: absolute;
`;

const Toolbar = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  position: absolute;
  right: 4%;
  top: 14.2%;
`;

const ToolbarButton = styled.div<{ $compact?: boolean }>`
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(28, 28, 28, 0.04);
  color: ${COLORS.textSecondary};
  display: inline-flex;
  flex: ${({ $compact }) => ($compact ? '0 0 auto' : '1 1 auto')};
  gap: ${({ $compact }) => ($compact ? '0' : '6px')};
  height: 27px;
  justify-content: center;
  min-width: ${({ $compact }) => ($compact ? '27px' : '0')};
  padding: ${({ $compact }) => ($compact ? '0 8px' : '0 12px')};
`;

const ToolbarLabel = styled.span<{ $light?: boolean }>`
  color: ${({ $light }) => ($light ? COLORS.textLight : COLORS.textSecondary)};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
`;

const ToolbarSeparator = styled.span`
  background: rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  display: block;
  height: 14px;
  width: 1px;
`;

const MenuShell = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 9px;
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.28),
    0 6px 18px rgba(0, 0, 0, 0.12);
  height: 81%;
  left: 14%;
  overflow: hidden;
  position: absolute;
  top: 19.1%;
  width: 81.5%;
`;

const MenuPanel = styled.div`
  background: ${COLORS.panelBackground};
  border: 1px solid ${COLORS.border};
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const MenuHeader = styled.div`
  align-items: center;
  background: ${COLORS.panelMuted};
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  gap: 8px;
  padding: 10px 12px;
`;

const HeaderIconWrap = styled.div`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const SearchPlaceholder = styled.div`
  color: ${COLORS.textTertiary};
  flex: 1 1 auto;
  font-family: ${APP_FONT};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  min-width: 0;
`;

const MenuBody = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px 16px;
  position: relative;
`;

const SectionLabel = styled.div`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  padding: 10px 4px 4px;
`;

const MenuRow = styled.div<{ $highlighted?: boolean }>`
  align-items: center;
  background: ${({ $highlighted }) =>
    $highlighted ? COLORS.itemBackground : 'transparent'};
  border-radius: 4px;
  display: flex;
  gap: 10px;
  min-height: 34px;
  padding: 4px;
  position: relative;
`;

const RowIconFrame = styled.div`
  align-items: center;
  background: ${COLORS.itemBackground};
  border-radius: 4px;
  color: ${COLORS.textSecondary};
  display: inline-flex;
  flex: 0 0 auto;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const RowLabel = styled.div`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  min-width: 0;
`;

const HandMarker = styled.div`
  bottom: -12px;
  color: #111111;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.98))
    drop-shadow(0 3px 8px rgba(28, 28, 28, 0.24));
  pointer-events: none;
  position: absolute;
  right: 30px;
  z-index: 1;
`;

const FadeOut = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.92) 55%,
    ${COLORS.panelBackground} 100%
  );
  bottom: 0;
  height: 54px;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
`;

function renderMenuIcon(
  Icon: MenuItemData['icon'],
  color: string = COLORS.textSecondary,
) {
  return <Icon aria-hidden color={color} size={15} stroke={TABLER_STROKE} />;
}

export function FastPathVisual() {
  return (
    <VisualRoot aria-hidden>
      <SceneStage>
        <SceneTexture>
          <TopStripes />
          <MidDashes />
          <BottomDots />
        </SceneTexture>
        <SceneFade />

        <SceneCanvas>
          <SceneFrame>
            <Toolbar>
              <ToolbarButton>
                {renderMenuIcon(IconPlus)}
                <ToolbarLabel>New Record</ToolbarLabel>
              </ToolbarButton>
              <ToolbarButton $compact>
                {renderMenuIcon(IconChevronUp)}
              </ToolbarButton>
              <ToolbarButton $compact>
                {renderMenuIcon(IconChevronDown)}
              </ToolbarButton>
              <ToolbarButton>
                {renderMenuIcon(IconDotsVertical)}
                <ToolbarSeparator />
                <ToolbarLabel $light>⌘K</ToolbarLabel>
              </ToolbarButton>
            </Toolbar>

            <MenuShell>
              <MenuPanel>
                <MenuHeader>
                  <HeaderIconWrap>
                    {renderMenuIcon(IconChevronLeft, COLORS.textSecondary)}
                  </HeaderIconWrap>
                  <SearchPlaceholder>Type anything...</SearchPlaceholder>
                  <HeaderIconWrap>
                    {renderMenuIcon(IconSparkles, COLORS.textSecondary)}
                  </HeaderIconWrap>
                </MenuHeader>

                <MenuBody>
                  {MENU_SECTIONS.map((section) => (
                    <div key={section.label}>
                      <SectionLabel>{section.label}</SectionLabel>
                      {section.items.map((item) => (
                        <MenuRow
                          $highlighted={item.highlighted}
                          key={`${section.label}-${item.label}`}
                        >
                          <RowIconFrame>
                            {renderMenuIcon(item.icon)}
                          </RowIconFrame>
                          <RowLabel>{item.label}</RowLabel>
                          {item.highlighted ? (
                            <HandMarker>
                              <IconHandClick
                                aria-hidden
                                size={32}
                                stroke={1.9}
                              />
                            </HandMarker>
                          ) : null}
                        </MenuRow>
                      ))}
                    </div>
                  ))}
                  <FadeOut />
                </MenuBody>
              </MenuPanel>
            </MenuShell>
          </SceneFrame>
        </SceneCanvas>
      </SceneStage>
    </VisualRoot>
  );
}
