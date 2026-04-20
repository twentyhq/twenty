'use client';

import { useEffect } from 'react';

// Dev-only helper: finds elements that cause horizontal scrolling
// (i.e. whose right edge extends beyond the viewport width) and
// outlines them, plus logs them to the console.
//
// Mount it anywhere on a page during debugging. It does nothing in
// production builds and self-cleans on unmount.
export function OverflowProbe({
  outlineColor = 'rgba(255, 0, 64, 0.85)',
  pollIntervalMs = 600,
}: {
  outlineColor?: string;
  pollIntervalMs?: number;
} = {}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const markedNodes = new Set<HTMLElement>();
    const previousOutlines = new WeakMap<HTMLElement, string>();
    const previousOutlineOffsets = new WeakMap<HTMLElement, string>();

    const reset = () => {
      markedNodes.forEach((node) => {
        const previousOutline = previousOutlines.get(node) ?? '';
        const previousOffset = previousOutlineOffsets.get(node) ?? '';
        node.style.outline = previousOutline;
        node.style.outlineOffset = previousOffset;
      });
      markedNodes.clear();
    };

    const describe = (node: HTMLElement) => {
      const id = node.id ? `#${node.id}` : '';
      const className =
        typeof node.className === 'string' && node.className.length > 0
          ? `.${node.className.trim().split(/\s+/).slice(0, 2).join('.')}`
          : '';
      return `${node.tagName.toLowerCase()}${id}${className}`;
    };

    const scan = () => {
      reset();

      const documentWidth = document.documentElement.clientWidth;
      const offenders: Array<{
        node: HTMLElement;
        rightOverflow: number;
        leftOverflow: number;
      }> = [];

      const allElements = document.body.querySelectorAll<HTMLElement>('*');
      allElements.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          return;
        }
        const rightOverflow = Math.max(0, rect.right - documentWidth);
        const leftOverflow = Math.max(0, -rect.left);
        if (rightOverflow > 1 || leftOverflow > 1) {
          offenders.push({ node, rightOverflow, leftOverflow });
        }
      });

      offenders.sort(
        (a, b) =>
          b.rightOverflow + b.leftOverflow - (a.rightOverflow + a.leftOverflow),
      );

      const topOffenders = offenders.slice(0, 12);

      topOffenders.forEach(({ node }) => {
        previousOutlines.set(node, node.style.outline);
        previousOutlineOffsets.set(node, node.style.outlineOffset);
        node.style.outline = `2px solid ${outlineColor}`;
        node.style.outlineOffset = '-2px';
        markedNodes.add(node);
      });

      if (topOffenders.length > 0) {
        console.groupCollapsed(
          `[OverflowProbe] viewport=${documentWidth}px — ${offenders.length} offending element(s)`,
        );
        topOffenders.forEach(({ node, rightOverflow, leftOverflow }) => {
          console.log(
            `${describe(node)}  →  rightOverflow=${rightOverflow.toFixed(1)}px  leftOverflow=${leftOverflow.toFixed(1)}px`,
            node,
          );
        });
        console.groupEnd();
      } else {
        console.log(
          `[OverflowProbe] viewport=${documentWidth}px — no horizontal overflow detected`,
        );
      }
    };

    scan();
    const intervalId = window.setInterval(scan, pollIntervalMs);
    window.addEventListener('resize', scan);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('resize', scan);
      reset();
    };
  }, [outlineColor, pollIntervalMs]);

  return null;
}
