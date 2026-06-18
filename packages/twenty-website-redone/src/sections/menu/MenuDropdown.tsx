'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { useState } from 'react';

import { ArrowUpRight } from '@/icons';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { useUnlocalizedPathname } from '@/platform/i18n/use-unlocalized-pathname';
import { ExternalLink } from '@/ui';
import {
  EASING,
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { type MenuNavChild } from './menu.data';

const DropdownLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(320px, 360px);
`;

const DropdownList = styled.ul`
  align-content: start;
  display: grid;
  grid-auto-rows: min-content;
  grid-template-columns: 1fr;
  list-style: none;
  padding: ${spacing(2)};
`;

const DropdownLink = styled(NavigationMenu.Link)`
  align-items: center;
  border-radius: ${radius(2)};
  column-gap: ${spacing(3)};
  display: grid;
  grid-template-columns: auto 1fr;
  padding: ${spacing(3)};
  text-decoration: none;
  transition: background 0.18s ${EASING.standard};

  &:hover {
    background: ${color('black-5')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: -1px;
  }
`;

const IconWrap = styled.span`
  align-items: center;
  background: ${color('black-5')};
  border-radius: ${radius(1.5)};
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  height: 32px;
  justify-content: center;
  position: relative;
  width: 32px;

  ${DropdownLink}[data-active] & {
    color: ${color('blue')};
  }
`;

const ExternalBadge = styled.span`
  align-items: center;
  background: ${semanticColor.surface};
  border-radius: 999px;
  bottom: -3px;
  color: ${color('blue')};
  display: inline-flex;
  height: 12px;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  right: -3px;
  width: 12px;
`;

const TextStack = styled.span`
  display: grid;
  min-width: 0;

  & > * + * {
    margin-top: 3px;
  }
`;

const ItemLabel = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0;
  line-height: 1.1;
  text-transform: uppercase;

  &::before {
    background: ${color('blue')};
    content: '';
    display: none;
    height: 2px;
    margin-right: ${spacing(1.5)};
    vertical-align: middle;
    width: 8px;
  }

  ${DropdownLink}[data-active] & {
    color: ${color('blue')};
  }

  ${DropdownLink}[data-active] &::before {
    display: inline-block;
  }
`;

const ItemDescription = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.3;
`;

const PreviewPanel = styled.div`
  border-left: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  min-height: 0;
  padding: ${spacing(3)};
`;

const PreviewFrame = styled.div`
  background: ${color('black-5')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  flex: 1;
  min-height: 160px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const PreviewTitle = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 1.2;
`;

const PreviewDescription = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  line-height: 1.4;
`;

const PreviewText = styled.div`
  display: grid;

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

export type MenuDropdownProps = {
  items: readonly MenuNavChild[];
};

export function MenuDropdown({ items }: MenuDropdownProps) {
  const { i18n } = useLingui();
  const pathname = useUnlocalizedPathname();
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? '');
  const activeItem =
    items.find((item) => item.href === activeHref) ?? items[0] ?? null;

  return (
    <DropdownLayout>
      <DropdownList>
        {items.map((child) => {
          const IconComponent = child.icon;
          const isCurrentPage =
            child.external !== true &&
            (pathname === child.href || pathname.startsWith(`${child.href}/`));
          return (
            <li
              key={child.href}
              onFocus={() => setActiveHref(child.href)}
              onMouseEnter={() => setActiveHref(child.href)}
            >
              <DropdownLink
                data-active={isCurrentPage ? '' : undefined}
                render={
                  child.external === true ? (
                    <ExternalLink href={child.href} />
                  ) : (
                    <LocalizedLink href={child.href} />
                  )
                }
              >
                <IconWrap aria-hidden>
                  <IconComponent size={16} />
                  {child.external === true && (
                    <ExternalBadge aria-hidden>
                      <ArrowUpRight sizePx={6} />
                    </ExternalBadge>
                  )}
                </IconWrap>
                <TextStack>
                  <ItemLabel>{i18n._(child.label)}</ItemLabel>
                  <ItemDescription>{i18n._(child.description)}</ItemDescription>
                </TextStack>
              </DropdownLink>
            </li>
          );
        })}
      </DropdownList>
      {activeItem && (
        <PreviewPanel>
          <PreviewFrame>
            <NextImage
              alt={i18n._(activeItem.preview.imageAlt)}
              fill
              sizes="720px"
              src={activeItem.preview.image}
              style={{
                objectFit: 'cover',
                objectPosition: activeItem.preview.imagePosition ?? 'top left',
                transform:
                  activeItem.preview.imageScale === undefined
                    ? undefined
                    : `scale(${activeItem.preview.imageScale})`,
                transformOrigin: 'center',
              }}
            />
          </PreviewFrame>
          <PreviewText>
            <PreviewTitle>{i18n._(activeItem.preview.title)}</PreviewTitle>
            <PreviewDescription>
              {i18n._(activeItem.preview.description)}
            </PreviewDescription>
          </PreviewText>
        </PreviewPanel>
      )}
    </DropdownLayout>
  );
}
