'use client';

import { styled } from '@linaria/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { theme } from '@/theme';
import { useWindowOrder } from '../WindowOrder/WindowOrderProvider';
import { WINDOW_SHADOWS } from '../windowShadows';
import {
  ConversationPanel,
  type ConversationMessage,
} from './conversation/ConversationPanel';
import { TerminalDiff } from './TerminalDiff/TerminalDiff';
import { EDITOR_TOKENS } from './TerminalEditor/editorTokens';
import { TerminalEditor } from './TerminalEditor/TerminalEditor';
import { TerminalPromptBox } from './TerminalPromptBox';
import { TerminalTopBar } from './TerminalTopBar';
import { type TerminalToggleValue } from './TerminalToggle';
import { TERMINAL_TOKENS } from './terminalTokens';

const WINDOW_ID = 'terminal-window';
const INITIAL_PROMPT_TEXT =
  'Scaffold a launch-ops CRM in my workspace with rockets, launches, payloads, customers, and launch sites, with relevant actions for each.';
const CLEARED_PROMPT_TEXT = 'Ask anything…';

// Initial / minimum dimensions for the Terminal window (Figma mock).
// Initial height is tuned to hug the prompt box + top bar so there's no
// large empty area above the prompt before the chat runs — it expands to
// TERMINAL_CHAT_EXPANDED_HEIGHT once the conversation starts.
const TERMINAL_INITIAL_WIDTH = 380;
const TERMINAL_INITIAL_HEIGHT = 220;
const TERMINAL_CHAT_EXPANDED_HEIGHT = 480;
const TERMINAL_EDITOR_WIDTH = 720;
const TERMINAL_EDITOR_HEIGHT = 480;
const TERMINAL_MIN_WIDTH = 300;
const TERMINAL_MIN_HEIGHT = 200;
const TERMINAL_INITIAL_BOTTOM_OFFSET = 96;
const MIN_EDGE_GAP = 0;
// Below this parent width, stack Terminal below App Window with a diagonal
// offset so both windows stay visible and clickable on mobile.
const MOBILE_PARENT_BREAKPOINT = 640;
const MOBILE_OFFSET_X = 16;
const MOBILE_OFFSET_Y = 48;

type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type ResizeEdge = 'top' | 'right' | 'bottom' | 'left';

type ResizeHandle = ResizeCorner | ResizeEdge;

type DragState = {
  pointerId: number;
  originX: number;
  originY: number;
  startLeft: number;
  startTop: number;
};

type ResizeState = {
  pointerId: number;
  originX: number;
  originY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  handle: ResizeHandle;
};

type TerminalPosition = { left: number; top: number };
type TerminalSize = { width: number; height: number };

const HORIZONTAL_HANDLES: ReadonlySet<ResizeHandle> = new Set([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'left',
  'right',
]);
const VERTICAL_HANDLES: ReadonlySet<ResizeHandle> = new Set([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'top',
  'bottom',
]);
const LEFT_HANDLES: ReadonlySet<ResizeHandle> = new Set([
  'top-left',
  'bottom-left',
  'left',
]);
const TOP_HANDLES: ReadonlySet<ResizeHandle> = new Set([
  'top-left',
  'top-right',
  'top',
]);

const Shell = styled.div<{
  $isDragging: boolean;
  $isResizing: boolean;
  $isReady: boolean;
  $animationsEnabled: boolean;
  $dark: boolean;
}>`
  background: ${({ $dark }) =>
    $dark ? EDITOR_TOKENS.surface.body : TERMINAL_TOKENS.surface.window};
  border: 1px solid ${TERMINAL_TOKENS.surface.windowBorder};
  border-radius: 20px;
  box-shadow: ${({ $isDragging, $isResizing }) =>
    $isDragging || $isResizing
      ? WINDOW_SHADOWS.mobileElevated
      : WINDOW_SHADOWS.mobileResting};
  display: flex;
  flex-direction: column;
  left: 0;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};
  overflow: hidden;
  position: absolute;
  top: 0;
  touch-action: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    box-shadow: ${({ $isDragging, $isResizing }) =>
      $isDragging || $isResizing
        ? WINDOW_SHADOWS.elevated
        : WINDOW_SHADOWS.resting};
  }
  transition: ${({ $isDragging, $isResizing, $animationsEnabled }) => {
    if ($isDragging || $isResizing) {
      return 'background-color 0.22s ease, box-shadow 0.14s ease, opacity 0.1s ease';
    }
    const base =
      'background-color 0.22s ease, box-shadow 0.22s ease, opacity 0.1s ease';
    if (!$animationsEnabled) {
      return base;
    }
    // Spring-like curve (overshoots slightly then settles) for a lively grow.
    const springCurve = 'cubic-bezier(0.34, 1.45, 0.55, 1)';
    const growDuration = '0.42s';
    return `${base}, height ${growDuration} ${springCurve}, width ${growDuration} ${springCurve}, transform ${growDuration} ${springCurve}`;
  }};
  will-change: transform, width, height;
`;

const Body = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  position: relative;
  width: 100%;
`;

const ViewLayer = styled.div<{ $visible: boolean; $row?: boolean }>`
  display: flex;
  flex-direction: ${({ $row }) => ($row ? 'row' : 'column')};
  inset: 0;
  justify-content: ${({ $row }) => ($row ? 'flex-start' : 'flex-end')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  position: absolute;
  transition: opacity 220ms ease;
`;

const ChatColumn = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  min-width: 0;
`;

const DiffSlide = styled.div<{ $open: boolean }>`
  display: flex;
  flex: 0 0 ${({ $open }) => ($open ? '55%' : '0')};
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  transition: flex-basis 320ms cubic-bezier(0.22, 1, 0.36, 1);
  width: ${({ $open }) => ($open ? '55%' : '0')};
`;

const ResizeCornerBase = styled.div`
  height: 16px;
  position: absolute;
  width: 16px;
  z-index: 5;

  &::after {
    border-radius: 1px;
    content: '';
    height: 8px;
    opacity: 0;
    position: absolute;
    transition: opacity 0.18s ease;
    width: 8px;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const ResizeCornerTopLeft = styled(ResizeCornerBase)`
  cursor: nwse-resize;
  left: -4px;
  top: -4px;

  &::after {
    border-left: 2px solid rgba(0, 0, 0, 0.18);
    border-top: 2px solid rgba(0, 0, 0, 0.18);
    left: 6px;
    top: 6px;
  }
`;

const ResizeCornerTopRight = styled(ResizeCornerBase)`
  cursor: nesw-resize;
  right: -4px;
  top: -4px;

  &::after {
    border-right: 2px solid rgba(0, 0, 0, 0.18);
    border-top: 2px solid rgba(0, 0, 0, 0.18);
    right: 6px;
    top: 6px;
  }
`;

const ResizeCornerBottomLeft = styled(ResizeCornerBase)`
  bottom: -4px;
  cursor: nesw-resize;
  left: -4px;

  &::after {
    border-bottom: 2px solid rgba(0, 0, 0, 0.18);
    border-left: 2px solid rgba(0, 0, 0, 0.18);
    bottom: 6px;
    left: 6px;
  }
`;

const ResizeCornerBottomRight = styled(ResizeCornerBase)`
  bottom: -4px;
  cursor: nwse-resize;
  right: -4px;

  &::after {
    border-bottom: 2px solid rgba(0, 0, 0, 0.18);
    border-right: 2px solid rgba(0, 0, 0, 0.18);
    bottom: 6px;
    right: 6px;
  }
`;

const ResizeEdgeBase = styled.div`
  position: absolute;
  z-index: 4;
`;

const ResizeEdgeTop = styled(ResizeEdgeBase)`
  cursor: ns-resize;
  height: 6px;
  left: 12px;
  right: 12px;
  top: -3px;
`;

const ResizeEdgeBottom = styled(ResizeEdgeBase)`
  bottom: -3px;
  cursor: ns-resize;
  height: 6px;
  left: 12px;
  right: 12px;
`;

const ResizeEdgeLeft = styled(ResizeEdgeBase)`
  bottom: 12px;
  cursor: ew-resize;
  left: -3px;
  top: 12px;
  width: 6px;
`;

const ResizeEdgeRight = styled(ResizeEdgeBase)`
  bottom: 12px;
  cursor: ew-resize;
  right: -3px;
  top: 12px;
  width: 6px;
`;

type DraggableTerminalProps = {
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
  onChatReset?: () => void;
  onJumpToConversationEnd?: () => void;
};

export const DraggableTerminal = ({
  onObjectCreated,
  onChatFinished,
  onChatReset,
  onJumpToConversationEnd,
}: DraggableTerminalProps) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const hasAnnouncedChatFinishedRef = useRef(false);

  const [position, setPosition] = useState<TerminalPosition | null>(null);
  const [size, setSize] = useState<TerminalSize>({
    width: TERMINAL_INITIAL_WIDTH,
    height: TERMINAL_INITIAL_HEIGHT,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [view, setView] = useState<TerminalToggleValue>('ai-chat');
  const [isChatFinished, setIsChatFinished] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const [instantComplete, setInstantComplete] = useState(false);

  useEffect(() => {
    // Defer enabling grow animations until after the initial fade-in so the
    // first paint positions the window without animating from translate(0,0).
    const timeoutId = window.setTimeout(() => {
      setAnimationsEnabled(true);
    }, 150);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const { activate, zIndex } = useWindowOrder(WINDOW_ID);

  const hasStartedConversation = messages.length > 0;

  const resizeAnchored = useCallback(
    (targetWidth: number, targetHeight: number) => {
      if (size.height === targetHeight && size.width === targetWidth) {
        return;
      }
      const deltaX = size.width - targetWidth;
      const deltaY = size.height - targetHeight;
      const parentRect =
        shellRef.current?.parentElement?.getBoundingClientRect() ?? null;
      setSize({ width: targetWidth, height: targetHeight });
      // Keep whichever corner is closest to the parent edges anchored so the
      // window grows outward from the corner nearest the page boundary.
      setPosition((pos) => {
        if (!pos) {
          return pos;
        }
        const parentWidth = parentRect?.width ?? size.width;
        const parentHeight = parentRect?.height ?? size.height;
        const centerX = pos.left + size.width / 2;
        const centerY = pos.top + size.height / 2;
        const anchorRight = centerX > parentWidth / 2;
        const anchorBottom = centerY > parentHeight / 2;
        return {
          left: anchorRight ? pos.left + deltaX : pos.left,
          top: anchorBottom ? pos.top + deltaY : pos.top,
        };
      });
    },
    [size],
  );

  const getTargetDimensions = useCallback(
    (nextView: TerminalToggleValue, chatStarted: boolean) => {
      const parentRect =
        shellRef.current?.parentElement?.getBoundingClientRect() ?? null;
      const isMobileParent =
        parentRect !== null && parentRect.width < MOBILE_PARENT_BREAKPOINT;
      const maxWidth = parentRect
        ? parentRect.width - (isMobileParent ? MOBILE_OFFSET_X : 0)
        : Infinity;
      const maxHeight = parentRect
        ? parentRect.height - (isMobileParent ? MOBILE_OFFSET_Y : 0)
        : Infinity;
      if (nextView === 'editor') {
        return {
          width: Math.min(TERMINAL_EDITOR_WIDTH, maxWidth),
          height: Math.min(TERMINAL_EDITOR_HEIGHT, maxHeight),
        };
      }
      return {
        width: Math.min(TERMINAL_INITIAL_WIDTH, maxWidth),
        height: Math.min(
          chatStarted ? TERMINAL_CHAT_EXPANDED_HEIGHT : TERMINAL_INITIAL_HEIGHT,
          maxHeight,
        ),
      };
    },
    [],
  );

  const handleSendPrompt = useCallback(() => {
    if (hasStartedConversation) {
      return;
    }
    setInstantComplete(false);
    const sendAt = Date.now();
    setMessages([
      { id: `u-${sendAt}`, role: 'user', text: INITIAL_PROMPT_TEXT },
      { id: `a-${sendAt}`, role: 'assistant' },
    ]);
    if (view === 'ai-chat') {
      const { width, height } = getTargetDimensions('ai-chat', true);
      resizeAnchored(width, height);
    }
  }, [getTargetDimensions, hasStartedConversation, resizeAnchored, view]);

  const handleViewChange = useCallback(
    (next: TerminalToggleValue) => {
      setView(next);
      const { width, height } = getTargetDimensions(
        next,
        hasStartedConversation,
      );
      resizeAnchored(width, height);
    },
    [getTargetDimensions, hasStartedConversation, resizeAnchored],
  );

  const handleResetConversation = useCallback(() => {
    hasAnnouncedChatFinishedRef.current = false;
    setMessages([]);
    setIsChatFinished(false);
    setIsDiffOpen(false);
    setInstantComplete(false);
    setView('ai-chat');
    const { width, height } = getTargetDimensions('ai-chat', false);
    resizeAnchored(width, height);
    onChatReset?.();
  }, [getTargetDimensions, onChatReset, resizeAnchored]);

  const handleToggleDiff = useCallback(() => {
    setIsDiffOpen((current) => !current);
  }, []);

  const handleChatFinishedInternal = useCallback(() => {
    setIsChatFinished(true);
    if (hasAnnouncedChatFinishedRef.current) {
      return;
    }
    hasAnnouncedChatFinishedRef.current = true;
    onChatFinished?.();
  }, [onChatFinished]);

  const handleJumpToConversationEnd = useCallback(() => {
    if (!hasStartedConversation) {
      const sendAt = Date.now();
      setMessages([
        { id: `u-${sendAt}`, role: 'user', text: INITIAL_PROMPT_TEXT },
        { id: `a-${sendAt}`, role: 'assistant' },
      ]);
    }
    setInstantComplete(true);
    setIsDiffOpen(false);
    setView('ai-chat');
    const { width, height } = getTargetDimensions('ai-chat', true);
    resizeAnchored(width, height);
    onJumpToConversationEnd?.();
    handleChatFinishedInternal();
  }, [
    getTargetDimensions,
    handleChatFinishedInternal,
    hasStartedConversation,
    onJumpToConversationEnd,
    resizeAnchored,
  ]);

  // On mount, measure the hero scene and anchor the window to the
  // bottom-right corner. Done in a layout effect so we paint into position
  // without a visible flicker (Shell starts with opacity 0 until ready).
  useLayoutEffect(() => {
    const shell = shellRef.current;
    const parent = shell?.parentElement as HTMLElement | null;
    if (!shell || !parent) {
      return;
    }

    const parentRect = parent.getBoundingClientRect();

    if (parentRect.width < MOBILE_PARENT_BREAKPOINT) {
      // Mobile: stack Terminal on top of App Window with a small diagonal
      // offset so the App Window corner stays peeking out and tappable.
      const mobileWidth = Math.min(
        TERMINAL_INITIAL_WIDTH,
        parentRect.width - MOBILE_OFFSET_X,
      );
      const mobileHeight = Math.min(
        TERMINAL_INITIAL_HEIGHT,
        parentRect.height - MOBILE_OFFSET_Y,
      );
      setSize({ width: mobileWidth, height: mobileHeight });
      setPosition({
        left: MOBILE_OFFSET_X,
        top: MOBILE_OFFSET_Y,
      });
      return;
    }

    const initialWidth = Math.min(TERMINAL_INITIAL_WIDTH, parentRect.width);
    const initialHeight = Math.min(TERMINAL_INITIAL_HEIGHT, parentRect.height);

    setSize({ width: initialWidth, height: initialHeight });
    setPosition({
      left: Math.max(0, parentRect.width - initialWidth),
      top: Math.max(
        0,
        parentRect.height - initialHeight - TERMINAL_INITIAL_BOTTOM_OFFSET,
      ),
    });
  }, []);

  const getParentRect = useCallback(() => {
    const shell = shellRef.current;
    const parent = shell?.parentElement as HTMLElement | null;
    return parent?.getBoundingClientRect() ?? null;
  }, []);

  const clampPosition = useCallback(
    (
      candidateLeft: number,
      candidateTop: number,
      currentSize: TerminalSize,
    ) => {
      const parentRect = getParentRect();
      if (!parentRect) {
        return { left: candidateLeft, top: candidateTop };
      }

      const maxLeft = parentRect.width - currentSize.width - MIN_EDGE_GAP;
      const maxTop = parentRect.height - currentSize.height - MIN_EDGE_GAP;

      return {
        left: Math.min(Math.max(candidateLeft, MIN_EDGE_GAP), maxLeft),
        top: Math.min(Math.max(candidateTop, MIN_EDGE_GAP), maxTop),
      };
    },
    [getParentRect],
  );

  // Drag handling.
  const handleDragStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && target.closest('button')) {
        return;
      }

      event.preventDefault();
      activate();

      const shell = shellRef.current;
      if (!shell || !position) {
        return;
      }

      shell.setPointerCapture?.(event.pointerId);
      dragStateRef.current = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        startLeft: position.left,
        startTop: position.top,
      };
      setIsDragging(true);
    },
    [activate, position],
  );

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    const handleMove = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }

      const nextLeft = state.startLeft + (event.clientX - state.originX);
      const nextTop = state.startTop + (event.clientY - state.originY);
      setPosition(clampPosition(nextLeft, nextTop, size));
    };

    const stopDragging = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      dragStateRef.current = null;
      setIsDragging(false);
      shellRef.current?.releasePointerCapture?.(event.pointerId);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [clampPosition, isDragging, size]);

  // Resize handling.
  const startResize = useCallback(
    (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }
      if (!position) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      activate();

      const shell = shellRef.current;
      if (!shell) {
        return;
      }

      shell.setPointerCapture?.(event.pointerId);
      resizeStateRef.current = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        startWidth: size.width,
        startHeight: size.height,
        startLeft: position.left,
        startTop: position.top,
        handle,
      };
      setIsResizing(true);
    },
    [activate, position, size],
  );

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    const handleMove = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }

      const parentRect = getParentRect();
      if (!parentRect) {
        return;
      }

      const deltaX = event.clientX - state.originX;
      const deltaY = event.clientY - state.originY;

      const affectsWidth = HORIZONTAL_HANDLES.has(state.handle);
      const affectsHeight = VERTICAL_HANDLES.has(state.handle);
      const growsFromLeft = LEFT_HANDLES.has(state.handle);
      const growsFromTop = TOP_HANDLES.has(state.handle);

      const effectiveMinWidth = Math.min(
        TERMINAL_MIN_WIDTH,
        Math.max(parentRect.width - MIN_EDGE_GAP * 2, 0),
      );
      const effectiveMinHeight = Math.min(
        TERMINAL_MIN_HEIGHT,
        Math.max(parentRect.height - MIN_EDGE_GAP * 2, 0),
      );

      let nextWidth = state.startWidth;
      let nextLeft = state.startLeft;
      if (affectsWidth) {
        if (growsFromLeft) {
          const maxWidth = state.startWidth + state.startLeft - MIN_EDGE_GAP;
          nextWidth = Math.min(
            Math.max(state.startWidth - deltaX, effectiveMinWidth),
            Math.max(maxWidth, effectiveMinWidth),
          );
          nextLeft = state.startLeft + state.startWidth - nextWidth;
        } else {
          const maxWidth = parentRect.width - state.startLeft - MIN_EDGE_GAP;
          nextWidth = Math.min(
            Math.max(state.startWidth + deltaX, effectiveMinWidth),
            Math.max(maxWidth, effectiveMinWidth),
          );
        }
      }

      let nextHeight = state.startHeight;
      let nextTop = state.startTop;
      if (affectsHeight) {
        if (growsFromTop) {
          const maxHeight = state.startHeight + state.startTop - MIN_EDGE_GAP;
          nextHeight = Math.min(
            Math.max(state.startHeight - deltaY, effectiveMinHeight),
            Math.max(maxHeight, effectiveMinHeight),
          );
          nextTop = state.startTop + state.startHeight - nextHeight;
        } else {
          const maxHeight = parentRect.height - state.startTop - MIN_EDGE_GAP;
          nextHeight = Math.min(
            Math.max(state.startHeight + deltaY, effectiveMinHeight),
            Math.max(maxHeight, effectiveMinHeight),
          );
        }
      }

      setSize({ width: nextWidth, height: nextHeight });
      setPosition({ left: nextLeft, top: nextTop });
    };

    const stopResizing = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      resizeStateRef.current = null;
      setIsResizing(false);
      shellRef.current?.releasePointerCapture?.(event.pointerId);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResizing);
    window.addEventListener('pointercancel', stopResizing);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResizing);
      window.removeEventListener('pointercancel', stopResizing);
    };
  }, [getParentRect, isResizing]);

  return (
    <Shell
      $animationsEnabled={animationsEnabled}
      $dark={view === 'editor'}
      $isDragging={isDragging}
      $isResizing={isResizing}
      $isReady={position !== null}
      onPointerDown={activate}
      ref={shellRef}
      style={{
        height: `${size.height}px`,
        transform: position
          ? `translate(${position.left}px, ${position.top}px)`
          : 'translate(0, 0)',
        width: `${size.width}px`,
        zIndex,
      }}
    >
      <ResizeEdgeTop onPointerDown={startResize('top')} />
      <ResizeEdgeRight onPointerDown={startResize('right')} />
      <ResizeEdgeBottom onPointerDown={startResize('bottom')} />
      <ResizeEdgeLeft onPointerDown={startResize('left')} />
      <ResizeCornerTopLeft
        aria-hidden
        onPointerDown={startResize('top-left')}
      />
      <ResizeCornerTopRight
        aria-hidden
        onPointerDown={startResize('top-right')}
      />
      <ResizeCornerBottomLeft
        aria-hidden
        onPointerDown={startResize('bottom-left')}
      />
      <ResizeCornerBottomRight
        aria-hidden
        onPointerDown={startResize('bottom-right')}
      />
      <TerminalTopBar
        diffOpen={isDiffOpen}
        diffVisible={isChatFinished}
        isDragging={isDragging}
        onDragStart={handleDragStart}
        onToggleDiff={handleToggleDiff}
        onViewChange={handleViewChange}
        onZoomTripleClick={handleJumpToConversationEnd}
        view={view}
      />
      <Body>
        <ViewLayer $row $visible={view === 'ai-chat'}>
          <ChatColumn>
            {hasStartedConversation ? (
              <ConversationPanel
                instantComplete={instantComplete}
                messages={messages}
                onUndo={handleResetConversation}
                onObjectCreated={onObjectCreated}
                onChatFinished={handleChatFinishedInternal}
              />
            ) : null}
            <TerminalPromptBox
              isChatFinished={isChatFinished}
              onReset={handleResetConversation}
              onSend={handleSendPrompt}
              promptIsPlaceholder={hasStartedConversation}
              promptText={
                hasStartedConversation
                  ? CLEARED_PROMPT_TEXT
                  : INITIAL_PROMPT_TEXT
              }
              sendDisabled={hasStartedConversation}
            />
          </ChatColumn>
          <DiffSlide $open={isChatFinished && isDiffOpen}>
            <TerminalDiff />
          </DiffSlide>
        </ViewLayer>
        <ViewLayer $visible={view === 'editor'}>
          <TerminalEditor showGeneratedFiles={isChatFinished} />
        </ViewLayer>
      </Body>
    </Shell>
  );
};
