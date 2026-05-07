'use client';

import { ArrowRightUpIcon, INFORMATIVE_ICONS } from '@/icons';
import type {
  MenuNavChildItemType,
  MenuNavItemType,
  MenuScheme,
} from '@/sections/Menu/types';
import { theme } from '@/theme';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { Separator } from '@base-ui/react/separator';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { LocalizedLink, useUnlocalizedPathname } from '@/lib/i18n';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
import Image from 'next/image';
import React, { useState } from 'react';

const NavList = styled(NavigationMenu.List)`
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    column-gap: ${theme.spacing(8)};
    display: grid;
    grid-auto-flow: column;
  }
`;

const navItemStyles = `
  background: none;
  border: none;
  cursor: pointer;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0;
  padding: 0;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }

  &:hover {
    color: ${theme.colors.highlight[100]};
  }

  position: relative;

  &::before {
    bottom: ${theme.spacing(-3)};
    content: '';
    left: ${theme.spacing(-8)};
    position: absolute;
    right: ${theme.spacing(-8)};
    top: ${theme.spacing(-3)};
  }

  &[data-active] {
    color: ${theme.colors.highlight[100]};
    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 40%;
      width: 20%;
      height: 2px;
      background: ${theme.colors.highlight[100]};
    }
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const NavLink = styled(NavigationMenu.Link)`
  ${navItemStyles}
`;

const NavTrigger = styled(NavigationMenu.Trigger)`
  ${navItemStyles}
  align-items: center;
  column-gap: ${theme.spacing(1)};
  display: inline-flex;

  &::before {
    bottom: ${theme.spacing(-5)};
  }

  &[data-popup-open] {
    color: ${theme.colors.highlight[100]};
  }
`;

const TriggerChevron = styled(NavigationMenu.Icon)`
  display: inline-flex;
  flex-shrink: 0;
  transform: rotate(0deg);
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);

  ${NavTrigger}[data-popup-open] & {
    transform: rotate(180deg);
  }

  svg {
    display: block;
  }
`;

const Divider = styled(Separator)`
  height: 10px;
  width: 0px;

  &[data-scheme='primary'] {
    border-left: 1px solid ${theme.colors.primary.border[40]};
  }

  &[data-scheme='secondary'] {
    border-left: 1px solid ${theme.colors.secondary.border[40]};
  }
`;

const DropdownPositioner = styled(NavigationMenu.Positioner)`
  box-sizing: border-box;
  transform-origin: var(--transform-origin);
  z-index: ${theme.zIndex.modal};
`;

const DropdownPopup = styled(NavigationMenu.Popup)`
  background: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(3)};
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 24px 64px rgba(0, 0, 0, 0.04);
  min-width: 320px;
  max-width: min(720px, calc(100vw - ${theme.spacing(8)}));
  opacity: 1;
  overflow: hidden;
  transform: translateY(0) scale(1);
  transform-origin: var(--transform-origin);
  transition-duration: 220ms;
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }

  &[data-instant] {
    transition-duration: 0ms;
  }

  &[data-scheme='secondary'] {
    background: ${theme.colors.secondary.background[100]};
    border-color: ${theme.colors.secondary.border[10]};
    box-shadow:
      0 1px 1px rgba(0, 0, 0, 0.4),
      0 8px 24px rgba(0, 0, 0, 0.35),
      0 24px 64px rgba(0, 0, 0, 0.25);
  }
`;

const DropdownViewport = styled(NavigationMenu.Viewport)`
  position: relative;
`;

const DropdownLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  &[data-has-preview='true'] {
    grid-template-columns: minmax(280px, 320px) minmax(320px, 360px);
  }
`;

const DropdownList = styled.ul`
  align-content: start;
  display: grid;
  gap: 0;
  grid-auto-rows: min-content;
  grid-template-columns: 1fr;
  list-style: none;
  margin: 0;
  padding: ${theme.spacing(2)};
`;

const PreviewPanel = styled.div`
  border-left: 1px solid ${theme.colors.primary.border[10]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  min-height: 0;
  padding: ${theme.spacing(3)};

  &[data-scheme='secondary'] {
    border-left-color: ${theme.colors.secondary.border[10]};
  }
`;

const PreviewFrame = styled.div`
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  width: 100%;

  &[data-scheme='primary'] {
    background: ${theme.colors.primary.text[5]};
  }

  &[data-scheme='secondary'] {
    background: ${theme.colors.secondary.text[10]};
    border-color: ${theme.colors.secondary.border[10]};
  }

  img {
    height: 100%;
    object-fit: cover;
    object-position: top left;
    width: 100%;
  }
`;

const PreviewText = styled.div`
  display: grid;
  row-gap: ${theme.spacing(1)};
`;

const PreviewTitle = styled.span`
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: -0.01em;
  line-height: 1.2;

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }
`;

const PreviewDescription = styled.span`
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  letter-spacing: 0;
  line-height: 1.4;

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[60]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[60]};
  }
`;

const DropdownLink = styled(NavigationMenu.Link)`
  align-items: center;
  border-radius: ${theme.radius(2)};
  column-gap: ${theme.spacing(3)};
  display: grid;
  grid-template-columns: auto 1fr;
  padding: ${theme.spacing(3)} ${theme.spacing(3)};
  position: relative;
  text-decoration: none;
  transition:
    background 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);

  &[data-scheme='primary']:hover {
    background: ${theme.colors.primary.text[5]};
  }

  &[data-scheme='secondary']:hover {
    background: ${theme.colors.secondary.text[10]};
  }

  &[data-scheme='primary']:active {
    background: ${theme.colors.primary.text[10]};
  }

  &[data-scheme='secondary']:active {
    background: ${theme.colors.secondary.text[20]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: -1px;
  }
`;

const DropdownIconWrap = styled.span`
  align-items: center;
  border-radius: ${theme.radius(1.5)};
  display: inline-flex;
  height: 32px;
  justify-content: center;
  position: relative;
  width: 32px;

  &[data-scheme='primary'] {
    background: ${theme.colors.primary.text[5]};
    color: ${theme.colors.primary.text[60]};
  }

  &[data-scheme='secondary'] {
    background: ${theme.colors.secondary.text[10]};
    color: ${theme.colors.secondary.text[60]};
  }

  ${DropdownLink}[data-active] & {
    color: ${theme.colors.highlight[100]};
  }
`;

const ExternalBadge = styled.span`
  align-items: center;
  background: ${theme.colors.primary.background[100]};
  border-radius: 999px;
  bottom: -3px;
  display: inline-flex;
  height: 12px;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  right: -3px;
  width: 12px;

  ${DropdownIconWrap}[data-scheme='secondary'] & {
    background: ${theme.colors.secondary.background[100]};
  }
`;

const DropdownTextStack = styled.span`
  display: grid;
  min-width: 0;
  row-gap: 3px;
`;

const DropdownLabel = styled.span`
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0;
  line-height: 1.1;
  text-transform: uppercase;
  transition: color 0.18s cubic-bezier(0.22, 1, 0.36, 1);

  &::before {
    background: ${theme.colors.highlight[100]};
    content: '';
    display: none;
    height: 2px;
    margin-right: ${theme.spacing(1.5)};
    vertical-align: middle;
    width: 8px;
  }

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }

  ${DropdownLink}[data-active] & {
    color: ${theme.colors.highlight[100]};
  }

  ${DropdownLink}[data-active] &::before {
    display: inline-block;
  }
`;

const DropdownDescription = styled.span`
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  letter-spacing: 0;
  line-height: 1.3;

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[40]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[40]};
  }
`;

type DropdownContentProps = {
  items: MenuNavChildItemType[];
  pathname: string;
  renderText: (descriptor: MessageDescriptor) => string;
  scheme: MenuScheme;
};

function DropdownContent({
  items,
  pathname,
  renderText,
  scheme,
}: DropdownContentProps) {
  const previewItems = items.filter((item) => item.preview);
  const hasPreview = previewItems.length > 0;
  const defaultPreviewItem = previewItems[0] ?? null;
  const [activeHref, setActiveHref] = useState<string | null>(
    defaultPreviewItem?.href ?? null,
  );

  const activePreviewItem =
    previewItems.find((item) => item.href === activeHref) ?? defaultPreviewItem;
  const activePreview = activePreviewItem?.preview;

  return (
    <DropdownLayout data-has-preview={hasPreview ? 'true' : 'false'}>
      <DropdownList>
        {items.map((child) => {
          const IconComponent = child.icon
            ? INFORMATIVE_ICONS[child.icon]
            : null;

          const handleActivate = () => {
            if (child.preview) {
              setActiveHref(child.href);
            }
          };

          return (
            <li
              key={child.href}
              onMouseEnter={handleActivate}
              onFocus={handleActivate}
            >
              <DropdownLink
                data-scheme={scheme}
                data-active={
                  !child.external && pathname.startsWith(child.href)
                    ? true
                    : undefined
                }
                render={
                  child.external ? (
                    <a
                      href={child.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ) : (
                    <LocalizedLink href={child.href} />
                  )
                }
              >
                <DropdownIconWrap data-scheme={scheme} aria-hidden>
                  {IconComponent && (
                    <IconComponent size={16} color="currentColor" />
                  )}
                  {child.external && (
                    <ExternalBadge aria-hidden>
                      <ArrowRightUpIcon
                        size={6}
                        strokeColor={theme.colors.highlight[100]}
                      />
                    </ExternalBadge>
                  )}
                </DropdownIconWrap>
                <DropdownTextStack>
                  <DropdownLabel data-scheme={scheme}>
                    {renderText(child.label)}
                  </DropdownLabel>
                  {child.description && (
                    <DropdownDescription data-scheme={scheme}>
                      {renderText(child.description)}
                    </DropdownDescription>
                  )}
                </DropdownTextStack>
              </DropdownLink>
            </li>
          );
        })}
      </DropdownList>
      {hasPreview && activePreview && (
        <PreviewPanel data-scheme={scheme}>
          <PreviewFrame data-scheme={scheme}>
            <Image
              src={activePreview.image}
              alt={activePreview.imageAlt}
              fill
              sizes="360px"
              style={{
                objectFit: 'cover',
                objectPosition: activePreview.imagePosition ?? 'top left',
                transform: activePreview.imageScale
                  ? `scale(${activePreview.imageScale})`
                  : undefined,
                transformOrigin: 'center',
              }}
            />
          </PreviewFrame>
          <PreviewText>
            <PreviewTitle data-scheme={scheme}>
              {renderText(activePreview.title)}
            </PreviewTitle>
            <PreviewDescription data-scheme={scheme}>
              {renderText(activePreview.description)}
            </PreviewDescription>
          </PreviewText>
        </PreviewPanel>
      )}
    </DropdownLayout>
  );
}

type NavProps = {
  navItems: MenuNavItemType[];
  scheme: MenuScheme;
};

export function Nav({ navItems, scheme }: NavProps) {
  const renderText = useRenderMessage();
  const pathname = useUnlocalizedPathname();

  const hasDropdown = navItems.some((item) => item.children);

  return (
    <NavigationMenu.Root delay={0} render={<div />}>
      <NavList>
        {navItems.map((item, index) => {
          const isLast = index === navItems.length - 1;

          return (
            <React.Fragment key={`${index}-${item.href ?? 'dropdown'}`}>
              <NavigationMenu.Item>
                {item.children ? (
                  <>
                    <NavTrigger
                      data-scheme={scheme}
                      data-active={
                        item.children.some(
                          (child) =>
                            !child.external && pathname.startsWith(child.href),
                        ) || undefined
                      }
                    >
                      {renderText(item.label)}
                      <TriggerChevron aria-hidden>
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 3.5L5 6.5L8 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </TriggerChevron>
                    </NavTrigger>
                    <NavigationMenu.Content>
                      <DropdownContent
                        items={item.children}
                        pathname={pathname}
                        renderText={renderText}
                        scheme={scheme}
                      />
                    </NavigationMenu.Content>
                  </>
                ) : (
                  item.href && (
                    <NavLink
                      data-scheme={scheme}
                      data-active={pathname.startsWith(item.href) || undefined}
                      render={<LocalizedLink href={item.href} />}
                    >
                      {renderText(item.label)}
                    </NavLink>
                  )
                )}
              </NavigationMenu.Item>
              {!isLast && (
                <Divider data-scheme={scheme} orientation="vertical" />
              )}
            </React.Fragment>
          );
        })}
      </NavList>
      {hasDropdown && (
        <NavigationMenu.Portal>
          <DropdownPositioner sideOffset={12} align="start">
            <DropdownPopup data-scheme={scheme}>
              <DropdownViewport />
            </DropdownPopup>
          </DropdownPositioner>
        </NavigationMenu.Portal>
      )}
    </NavigationMenu.Root>
  );
}
