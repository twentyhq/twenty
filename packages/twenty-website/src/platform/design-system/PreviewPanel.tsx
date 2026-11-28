'use client';

import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  SCHEMES,
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
  type Scheme,
} from '@/tokens';
import { SectionShell } from '@/ui';

const Root = styled.div`
  scroll-margin-top: ${spacing(28)};

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const Toolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(4)};
  justify-content: space-between;
`;

const Tabs = styled.div`
  display: flex;
  gap: ${spacing(5)};

  & button {
    background: none;
    border: none;
    border-bottom: ${spacing(0.5)} solid transparent;
    color: ${semanticColor.inkMuted};
    cursor: pointer;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    padding: ${spacing(2)} 0;
  }

  & button:hover {
    color: ${semanticColor.ink};
  }

  & button[aria-selected='true'] {
    border-bottom-color: ${semanticColor.ink};
    color: ${semanticColor.ink};
  }
`;

const Controls = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(3)};
  padding-block: ${spacing(1)};
`;

// Three schemes as one segmented control, like Arc's view toggles.
const Segmented = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  padding: ${spacing(0.5)};

  & button {
    background: none;
    border: none;
    border-radius: ${radius(1)};
    color: ${semanticColor.inkMuted};
    cursor: pointer;
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    padding: ${spacing(1)} ${spacing(2)};
    text-transform: uppercase;
  }

  & button[aria-pressed='true'] {
    background: ${semanticColor.line};
    color: ${semanticColor.ink};
  }
`;

const Expand = styled(LocalizedLink)`
  align-items: center;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.inkMuted};
  display: flex;
  height: ${spacing(8)};
  justify-content: center;
  width: ${spacing(8)};

  &:hover {
    border-color: ${semanticColor.lineStrong};
    color: ${semanticColor.ink};
  }
`;

const Stage = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  overflow: clip;
`;

const Center = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(4)};
  justify-content: center;
  min-height: ${spacing(80)};
  padding: ${spacing(10)} ${spacing(6)};
`;

const Legend = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)} ${spacing(5)};
  list-style: none;

  & li {
    align-items: center;
    color: ${semanticColor.inkMuted};
    display: flex;
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    gap: ${spacing(2)};
  }

  & i {
    border: 2px solid ${semanticColor.lineStrong};
    border-radius: ${radius(1)};
    display: inline-block;
    height: ${spacing(3)};
    width: ${spacing(3)};
  }

  & i[data-severity='error'] {
    border-color: ${color('error')};
  }

  & i[data-severity='warning'] {
    border-color: ${color('yellow')};
  }

  & i[data-severity='info'] {
    border-style: dashed;
  }
`;

// The top of a component page: the component as it renders, or its code.
export type XrayPart = {
  part: string;
  severity: 'error' | 'warning' | 'info';
  summary: string;
};

const OUTLINE: Record<XrayPart['severity'], string> = {
  error: `2px solid ${color('error')}`,
  warning: `2px solid ${color('yellow')}`,
  info: `1px dashed ${semanticColor.lineStrong}`,
};

// Linaria names a part's class after its declaration ("buttonClassName_x1y2"),
// so a part is found by that prefix inside the stage.
const partSelector = (part: string) => `#preview-stage [class*="${part}_"]`;

export function PreviewPanel({
  codeView,
  tab,
  onTabChange,
  scheme,
  fixedScheme,
  onSchemeChange,
  inspectHref,
  xrayParts,
  flashPart,
  children,
}: {
  codeView: ReactNode;
  tab: 'preview' | 'code';
  onTabChange: (tab: 'preview' | 'code') => void;
  scheme: Scheme;
  fixedScheme: boolean;
  onSchemeChange: (scheme: Scheme) => void;
  inspectHref: string;
  xrayParts: XrayPart[];
  flashPart: string | null;
  children: ReactNode;
}) {
  const [xray, setXray] = useState(false);
  const rules = [
    ...(xray
      ? xrayParts.map(
          (entry) =>
            `${partSelector(entry.part)}{outline:${OUTLINE[entry.severity]};outline-offset:2px}`,
        )
      : []),
    ...(flashPart
      ? [
          `${partSelector(flashPart)}{outline:2px solid ${color('blue')};outline-offset:4px}`,
        ]
      : []),
  ].join('');

  return (
    <Root id="preview">
      <Toolbar>
        <Tabs role="tablist">
          <button
            aria-selected={tab === 'preview'}
            role="tab"
            type="button"
            onClick={() => onTabChange('preview')}
          >
            Preview
          </button>
          <button
            aria-selected={tab === 'code'}
            role="tab"
            type="button"
            onClick={() => onTabChange('code')}
          >
            Code
          </button>
        </Tabs>
        <Controls>
          {xrayParts.length ? (
            <Segmented aria-label="X-ray">
              <button
                aria-pressed={xray}
                type="button"
                onClick={() => setXray(!xray)}
              >
                X-ray
              </button>
            </Segmented>
          ) : null}
          {fixedScheme ? null : (
            <Segmented aria-label="Scheme">
              {(Object.keys(SCHEMES) as Scheme[]).map((each) => (
                <button
                  key={each}
                  aria-pressed={each === scheme}
                  type="button"
                  onClick={() => onSchemeChange(each)}
                >
                  {each}
                </button>
              ))}
            </Segmented>
          )}
          <Expand aria-label="Open in the full window" href={inspectHref}>
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
              <path
                d="M9.5 2.5h4v4M13.5 2.5l-5 5M6.5 13.5h-4v-4M2.5 13.5l5-5"
                fill="none"
                stroke="currentColor"
              />
            </svg>
          </Expand>
        </Controls>
      </Toolbar>
      {tab === 'preview' ? (
        <Stage id="preview-stage">
          {rules ? <style>{rules}</style> : null}
          <SectionShell flushInline rhythm="flush" scheme={scheme}>
            <Center>{children}</Center>
          </SectionShell>
        </Stage>
      ) : (
        codeView
      )}
      {xray && tab === 'preview' ? (
        <Legend aria-label="What the X-ray outlines">
          {xrayParts.map((entry) => (
            <li key={entry.part}>
              <i data-severity={entry.severity} />
              {entry.part} · {entry.summary}
            </li>
          ))}
        </Legend>
      ) : null}
    </Root>
  );
}
