/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \ \ /\ / / _ \ '_ \| __| | | | Auto-generated file
 *  | |  \ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \_/\_/ \___|_| |_|\__|\__, |
 *                              |___/
 */

import React from 'react';
import {
  RemoteFragmentRenderer,
  createRemoteComponentRenderer,
} from '@remote-dom/react/host';

// =============================================================================
// HTML Element Wrapper Components
// =============================================================================

// Filter out remote-dom internal props that shouldn't be passed to DOM elements
const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

// Map event names to proper React camelCase
const EVENT_NAME_MAP: Record<string, string> = {
  onclick: 'onClick',
  ondblclick: 'onDoubleClick',
  onmousedown: 'onMouseDown',
  onmouseup: 'onMouseUp',
  onmouseover: 'onMouseOver',
  onmouseout: 'onMouseOut',
  onmouseenter: 'onMouseEnter',
  onmouseleave: 'onMouseLeave',
  onkeydown: 'onKeyDown',
  onkeyup: 'onKeyUp',
  onkeypress: 'onKeyPress',
  onfocus: 'onFocus',
  onblur: 'onBlur',
  onchange: 'onChange',
  oninput: 'onInput',
  onsubmit: 'onSubmit',
  onscroll: 'onScroll',
  onwheel: 'onWheel',
  oncontextmenu: 'onContextMenu',
  ondrag: 'onDrag',
};

// Convert CSS string to React style object
const parseStyle = (
  styleString: string | undefined,
): React.CSSProperties | undefined => {
  if (!styleString || typeof styleString !== 'string') {
    return styleString as React.CSSProperties | undefined;
  }

  const style: Record<string, string> = {};
  const declarations = styleString.split(';').filter(Boolean);

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    // Convert kebab-case to camelCase
    const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
    style[camelProperty] = value;
  }

  return style;
};

// Wrap event handlers to prevent passing non-serializable event objects
const wrapEventHandler = (handler: () => void) => {
  return (_event: unknown) => {
    // Call handler without the event - it can't be serialized to the worker
    handler();
  };
};

const filterProps = (props: Record<string, unknown>) => {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (INTERNAL_PROPS.has(key) || value === undefined) continue;

    if (key === 'style') {
      filtered.style = parseStyle(value as string | undefined);
    } else {
      // Normalize event handler names to React camelCase
      const normalizedKey = EVENT_NAME_MAP[key.toLowerCase()] || key;
      // Wrap event handlers to prevent passing non-serializable events
      if (normalizedKey.startsWith('on') && typeof value === 'function') {
        filtered[normalizedKey] = wrapEventHandler(value as () => void);
      } else {
        filtered[normalizedKey] = value;
      }
    }
  }
  return filtered;
};

const DivWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('div', filterProps(props), children);
};

const SpanWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('span', filterProps(props), children);
};

const SectionWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('section', filterProps(props), children);
};

const ArticleWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('article', filterProps(props), children);
};

const HeaderWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('header', filterProps(props), children);
};

const FooterWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('footer', filterProps(props), children);
};

const MainWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('main', filterProps(props), children);
};

const NavWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('nav', filterProps(props), children);
};

const AsideWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('aside', filterProps(props), children);
};

const PWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('p', filterProps(props), children);
};

const H1Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h1', filterProps(props), children);
};

const H2Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h2', filterProps(props), children);
};

const H3Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h3', filterProps(props), children);
};

const H4Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h4', filterProps(props), children);
};

const H5Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h5', filterProps(props), children);
};

const H6Wrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('h6', filterProps(props), children);
};

const StrongWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('strong', filterProps(props), children);
};

const EmWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('em', filterProps(props), children);
};

const SmallWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('small', filterProps(props), children);
};

const CodeWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('code', filterProps(props), children);
};

const PreWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('pre', filterProps(props), children);
};

const BlockquoteWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('blockquote', filterProps(props), children);
};

const AWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('a', filterProps(props), children);
};

const ImgWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('img', filterProps(props), children);
};

const UlWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('ul', filterProps(props), children);
};

const OlWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('ol', filterProps(props), children);
};

const LiWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('li', filterProps(props), children);
};

const FormWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('form', filterProps(props), children);
};

const LabelWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('label', filterProps(props), children);
};

const HtmlInputWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('input', filterProps(props), children);
};

const TextareaWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('textarea', filterProps(props), children);
};

const SelectWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('select', filterProps(props), children);
};

const OptionWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('option', filterProps(props), children);
};

const HtmlButtonWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('button', filterProps(props), children);
};

const TableWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('table', filterProps(props), children);
};

const TheadWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('thead', filterProps(props), children);
};

const TbodyWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('tbody', filterProps(props), children);
};

const TfootWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('tfoot', filterProps(props), children);
};

const TrWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('tr', filterProps(props), children);
};

const ThWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('th', filterProps(props), children);
};

const TdWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('td', filterProps(props), children);
};

const BrWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('br', filterProps(props), children);
};

const HrWrapper = ({
  children,
  ...props
}: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('hr', filterProps(props), children);
};

// =============================================================================
// Component Registry
// =============================================================================

export const componentRegistry = new Map<
  string,
  ReturnType<typeof createRemoteComponentRenderer>
>([
  // HTML Elements
  ['remote-div', createRemoteComponentRenderer(DivWrapper)],
  ['remote-span', createRemoteComponentRenderer(SpanWrapper)],
  ['remote-section', createRemoteComponentRenderer(SectionWrapper)],
  ['remote-article', createRemoteComponentRenderer(ArticleWrapper)],
  ['remote-header', createRemoteComponentRenderer(HeaderWrapper)],
  ['remote-footer', createRemoteComponentRenderer(FooterWrapper)],
  ['remote-main', createRemoteComponentRenderer(MainWrapper)],
  ['remote-nav', createRemoteComponentRenderer(NavWrapper)],
  ['remote-aside', createRemoteComponentRenderer(AsideWrapper)],
  ['remote-p', createRemoteComponentRenderer(PWrapper)],
  ['remote-h1', createRemoteComponentRenderer(H1Wrapper)],
  ['remote-h2', createRemoteComponentRenderer(H2Wrapper)],
  ['remote-h3', createRemoteComponentRenderer(H3Wrapper)],
  ['remote-h4', createRemoteComponentRenderer(H4Wrapper)],
  ['remote-h5', createRemoteComponentRenderer(H5Wrapper)],
  ['remote-h6', createRemoteComponentRenderer(H6Wrapper)],
  ['remote-strong', createRemoteComponentRenderer(StrongWrapper)],
  ['remote-em', createRemoteComponentRenderer(EmWrapper)],
  ['remote-small', createRemoteComponentRenderer(SmallWrapper)],
  ['remote-code', createRemoteComponentRenderer(CodeWrapper)],
  ['remote-pre', createRemoteComponentRenderer(PreWrapper)],
  ['remote-blockquote', createRemoteComponentRenderer(BlockquoteWrapper)],
  ['remote-a', createRemoteComponentRenderer(AWrapper)],
  ['remote-img', createRemoteComponentRenderer(ImgWrapper)],
  ['remote-ul', createRemoteComponentRenderer(UlWrapper)],
  ['remote-ol', createRemoteComponentRenderer(OlWrapper)],
  ['remote-li', createRemoteComponentRenderer(LiWrapper)],
  ['remote-form', createRemoteComponentRenderer(FormWrapper)],
  ['remote-label', createRemoteComponentRenderer(LabelWrapper)],
  ['remote-input', createRemoteComponentRenderer(HtmlInputWrapper)],
  ['remote-textarea', createRemoteComponentRenderer(TextareaWrapper)],
  ['remote-select', createRemoteComponentRenderer(SelectWrapper)],
  ['remote-option', createRemoteComponentRenderer(OptionWrapper)],
  ['remote-button', createRemoteComponentRenderer(HtmlButtonWrapper)],
  ['remote-table', createRemoteComponentRenderer(TableWrapper)],
  ['remote-thead', createRemoteComponentRenderer(TheadWrapper)],
  ['remote-tbody', createRemoteComponentRenderer(TbodyWrapper)],
  ['remote-tfoot', createRemoteComponentRenderer(TfootWrapper)],
  ['remote-tr', createRemoteComponentRenderer(TrWrapper)],
  ['remote-th', createRemoteComponentRenderer(ThWrapper)],
  ['remote-td', createRemoteComponentRenderer(TdWrapper)],
  ['remote-br', createRemoteComponentRenderer(BrWrapper)],
  ['remote-hr', createRemoteComponentRenderer(HrWrapper)],
  // Core
  ['remote-fragment', RemoteFragmentRenderer],
]);
