'use client';

import { ArrowRightUpIcon, INFORMATIVE_ICONS } from '@/icons';
import { LocalizedLink } from '@/lib/i18n';
import type { MenuNavChildItemType, MenuScheme } from '@/sections/Menu/types';
import { theme } from '@/theme';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react';
import Image from 'next/image';
import { useState } from 'react';

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

type NavDropdownContentProps = {
  items: MenuNavChildItemType[];
  pathname: string;
  scheme: MenuScheme;
};

export function NavDropdownContent({
  items,
  pathname,
  scheme,
}: NavDropdownContentProps) {
  const { i18n } = useLingui();
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
                    {i18n._(child.label)}
                  </DropdownLabel>
                  {child.description && (
                    <DropdownDescription data-scheme={scheme}>
                      {i18n._(child.description)}
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
              {i18n._(activePreview.title)}
            </PreviewTitle>
            <PreviewDescription data-scheme={scheme}>
              {i18n._(activePreview.description)}
            </PreviewDescription>
          </PreviewText>
        </PreviewPanel>
      )}
    </DropdownLayout>
  );
}
