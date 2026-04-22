'use client';

import { IconArrowBackUp, IconArrowUp } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TERMINAL_TOKENS } from './terminalTokens';

type TerminalSendButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  mode?: 'send' | 'reset';
};

const FINGER_OFFSET_RIGHT = -22;
const FINGER_OFFSET_BOTTOM = -18;
const FINGER_ROTATION = -21;
const FINGER_SIZE = 51;

const SendButtonWrapper = styled.span`
  display: inline-flex;
  position: relative;
`;

const SendButtonRoot = styled.button<{ $isReset: boolean }>`
  align-items: center;
  background: ${({ $isReset }) =>
    $isReset ? '#5a5a5a' : TERMINAL_TOKENS.accent.brand};
  border: none;
  border-radius: 999px;
  box-shadow: ${({ $isReset }) =>
    $isReset
      ? 'none'
      : '0 0 0 1px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.12)'};
  color: #ffffff;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: 32px;
  justify-content: center;
  padding: 0 4px;
  transition:
    background-color 0.14s ease,
    transform 0.12s ease;
  width: 32px;

  &:hover:not(:disabled) {
    background: ${({ $isReset }) =>
      $isReset ? '#4c4c4c' : TERMINAL_TOKENS.accent.brandHover};
  }

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const FingerHint = styled.span`
  pointer-events: none;
  position: fixed;
  z-index: 20;
`;

const FingerTapAnim = styled.span`
  animation: fingerTap 1.4s ease-in-out infinite;
  display: block;

  @keyframes fingerTap {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }
`;

const FingerIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <g filter="url(#finger_shadow)">
      <path
        d="M8.26999 16.2799C7.98999 15.9199 7.63999 15.1899 7.02999 14.2799C6.67999 13.7799 5.81999 12.8299 5.55999 12.3399C5.37257 12.0422 5.31818 11.6796 5.40999 11.3399C5.56695 10.6941 6.17956 10.2657 6.83999 10.3399C7.3508 10.4425 7.82022 10.6929 8.18999 11.0599C8.44817 11.3031 8.68566 11.5673 8.89999 11.8499C9.05999 12.0499 9.09999 12.1299 9.27999 12.3599C9.45999 12.5899 9.57999 12.8199 9.48999 12.4799C9.41999 11.9799 9.29999 11.1399 9.12999 10.3899C8.99999 9.81993 8.96999 9.72993 8.84999 9.29993C8.72999 8.86993 8.65999 8.50993 8.52999 8.01993C8.41116 7.5385 8.3177 7.05116 8.24999 6.55993C8.12395 5.93163 8.21565 5.27914 8.50999 4.70993C8.85939 4.3813 9.37192 4.29456 9.80999 4.48993C10.2506 4.81526 10.5791 5.26958 10.75 5.78993C11.0121 6.43032 11.187 7.10299 11.27 7.78993C11.43 8.78993 11.74 10.2499 11.75 10.5499C11.75 10.1799 11.68 9.39993 11.75 9.04993C11.8193 8.68505 12.073 8.38224 12.42 8.24993C12.7178 8.15855 13.0328 8.13801 13.34 8.18993C13.65 8.25474 13.9247 8.43307 14.11 8.68993C14.3417 9.27332 14.4703 9.89253 14.49 10.5199C14.5168 9.97051 14.6108 9.42646 14.77 8.89993C14.9371 8.66448 15.1811 8.49472 15.46 8.41993C15.7906 8.35948 16.1294 8.35948 16.46 8.41993C16.7311 8.51056 16.9682 8.68144 17.14 8.90993C17.3518 9.44027 17.48 10.0003 17.52 10.5699C17.52 10.7099 17.59 10.1799 17.81 9.82993C17.9243 9.49053 18.211 9.2379 18.5621 9.1672C18.9132 9.09651 19.2754 9.21849 19.5121 9.4872C19.7489 9.75591 19.8243 10.1305 19.71 10.4699C19.71 11.1199 19.71 11.0899 19.71 11.5299C19.71 11.9699 19.71 12.3599 19.71 12.7299C19.6736 13.3151 19.5933 13.8967 19.47 14.4699C19.296 14.977 19.0537 15.4581 18.75 15.8999C18.2644 16.4399 17.8632 17.0501 17.56 17.7099C17.4848 18.0377 17.4512 18.3737 17.46 18.7099C17.459 19.0206 17.4993 19.3299 17.58 19.6299C17.1711 19.6732 16.7589 19.6732 16.35 19.6299C15.96 19.5699 15.48 18.7899 15.35 18.5499C15.2857 18.4211 15.154 18.3396 15.01 18.3396C14.866 18.3396 14.7343 18.4211 14.67 18.5499C14.45 18.9299 13.96 19.6199 13.62 19.6599C12.95 19.7399 11.57 19.6599 10.48 19.6599C10.48 19.6599 10.66 18.6599 10.25 18.2999C9.83999 17.9399 9.41999 17.5199 9.10999 17.2399L8.26999 16.2799Z"
        fill="white"
        stroke="#202125"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.75 16.8259V13.3741C16.75 13.1675 16.5821 13 16.375 13C16.1679 13 16 13.1675 16 13.3741V16.8259C16 17.0325 16.1679 17.2 16.375 17.2C16.5821 17.2 16.75 17.0325 16.75 16.8259Z"
        fill="#202125"
      />
      <path
        d="M14.77 16.8246L14.75 13.3711C14.7488 13.1649 14.5799 12.9988 14.3728 13C14.1657 13.0012 13.9988 13.1693 14 13.3754L14.02 16.8289C14.0212 17.035 14.1901 17.2012 14.3972 17.2C14.6043 17.1988 14.7712 17.0307 14.77 16.8246Z"
        fill="#202125"
      />
      <path
        d="M12 13.379L12.02 16.8254C12.0212 17.0335 12.1901 17.2012 12.3972 17.2C12.6043 17.1988 12.7712 17.0291 12.77 16.821L12.75 13.3746C12.7488 13.1665 12.5799 12.9988 12.3728 13C12.1657 13.0012 11.9988 13.1709 12 13.379Z"
        fill="#202125"
      />
    </g>
    <defs>
      <filter
        id="finger_shadow"
        x="4.19133"
        y="4.01172"
        width="16.7461"
        height="17.8588"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="0.4" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

export const TerminalSendButton = ({
  onClick,
  disabled,
  mode = 'send',
}: TerminalSendButtonProps) => {
  const isReset = mode === 'reset';
  const [hintDismissed, setHintDismissed] = useState(false);
  const [hintPos, setHintPos] = useState<{ left: number; top: number } | null>(
    null,
  );
  const [hintReady, setHintReady] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dismissHint = () => setHintDismissed(true);
  const showHint = !hintDismissed && !isReset && !disabled;

  useLayoutEffect(() => {
    if (!showHint) {
      setHintPos(null);
      setHintReady(false);
      return;
    }
    let rafId = 0;
    let lastLeft = Number.NaN;
    let lastTop = Number.NaN;
    const readyTimer = window.setTimeout(() => setHintReady(true), 400);

    const tick = () => {
      rafId = 0;
      const el = buttonRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0) {
          const nextLeft = rect.right + FINGER_OFFSET_RIGHT;
          const nextTop = rect.bottom + FINGER_OFFSET_BOTTOM;
          if (nextLeft !== lastLeft || nextTop !== lastTop) {
            lastLeft = nextLeft;
            lastTop = nextTop;
            setHintPos({ left: nextLeft, top: nextTop });
          }
        }
      }
      if (!document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (rafId === 0 && !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafId !== 0) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else {
        start();
      }
    };
    start();
    document.addEventListener('visibilitychange', handleVisibility);

    const handleTerminalInteraction = (event: PointerEvent) => {
      const btnEl = buttonRef.current;
      if (!btnEl) return;
      const shell = btnEl.closest('[class*="Shell"]');
      if (shell && event.target instanceof Node && shell.contains(event.target)) {
        setHintDismissed(true);
      }
    };
    window.addEventListener('pointerdown', handleTerminalInteraction, true);

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.clearTimeout(readyTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener(
        'pointerdown',
        handleTerminalInteraction,
        true,
      );
    };
  }, [showHint]);

  return (
    <SendButtonWrapper>
      <SendButtonRoot
        $isReset={isReset}
        aria-label={isReset ? 'Reset conversation' : 'Send message'}
        disabled={disabled}
        onClick={() => {
          dismissHint();
          onClick?.();
        }}
        onMouseEnter={dismissHint}
        ref={buttonRef}
        type="button"
      >
        {isReset ? (
          <IconArrowBackUp size={16} stroke={2.2} />
        ) : (
          <IconArrowUp size={16} stroke={2.2} />
        )}
      </SendButtonRoot>
      {showHint && hintPos && typeof document !== 'undefined'
        ? createPortal(
            <FingerHint
              style={{
                left: `${hintPos.left}px`,
                top: `${hintPos.top}px`,
                opacity: hintReady ? 1 : 0,
                pointerEvents: 'none',
                transform: `rotate(${FINGER_ROTATION}deg)`,
                transformOrigin: 'center',
              }}
            >
              <FingerTapAnim>
                <FingerIcon size={FINGER_SIZE} />
              </FingerTapAnim>
            </FingerHint>,
            document.body,
          )
        : null}
    </SendButtonWrapper>
  );
};
