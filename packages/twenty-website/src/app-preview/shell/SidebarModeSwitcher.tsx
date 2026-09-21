import { styled } from '@linaria/react';
import { IconHome, IconMessageCircle, IconSettings } from '@tabler/icons-react';

import { mediaUp } from '@/tokens';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { APP_PREVIEW_CHROME } from '@/app-preview/app-preview-chrome';

const Root = styled.div`
  display: none;

  ${mediaUp('md')} {
    [data-desktop-mode='expanded'] & {
      align-items: center;
      border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
      box-sizing: border-box;
      column-gap: 2px;
      display: flex;
      height: ${APP_PREVIEW_CHROME.spacingBasePx * 10}px;
    }
  }
`;

const Mode = styled.div<{ $selected?: boolean }>`
  align-items: center;
  background: ${({ $selected }) =>
    $selected ? THEME_LIGHT.background.transparent.light : 'transparent'};
  border-radius: ${THEME_LIGHT.border.radius.smRound};
  color: ${({ $selected }) =>
    $selected
      ? THEME_LIGHT.font.color.primary
      : THEME_LIGHT.font.color.tertiary};
  column-gap: ${({ $selected }) => ($selected ? '4px' : '0')};
  display: flex;
  height: ${APP_PREVIEW_CHROME.spacingBasePx * 7}px;
  padding: 0 6px;
`;

const ModeLabel = styled.span`
  font-family: var(--font-product), sans-serif;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

// Only the active mode carries its label, as the product's switcher does.
const NAVIGATION_MODES = [
  { Icon: IconHome, label: 'Home', selected: true },
  { Icon: IconMessageCircle, label: 'AI', selected: false },
  { Icon: IconSettings, label: 'Settings', selected: false },
];

// The drawer's Home/AI/Settings switcher — chrome only, as on the old site:
// the AI conversation lives in the floating Terminal.
export function SidebarModeSwitcher() {
  return (
    <Root aria-hidden>
      {NAVIGATION_MODES.map(({ Icon, label, selected }) => (
        <Mode $selected={selected} key={label}>
          <Icon
            aria-hidden
            size={THEME_LIGHT.icon.size.md}
            strokeWidth={THEME_LIGHT.icon.stroke.md}
          />
          {selected ? <ModeLabel>{label}</ModeLabel> : null}
        </Mode>
      ))}
    </Root>
  );
}
