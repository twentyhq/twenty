import { type IconComponentProps } from '@ui/icon/types/IconComponent';

type IconSparkle2Props = Pick<
  IconComponentProps,
  'aria-hidden' | 'className' | 'color' | 'size' | 'stroke'
>;

export const IconSparkle2 = ({
  className,
  color = 'currentColor',
  size = 24,
  stroke = 2,
  'aria-hidden': ariaHidden,
}: IconSparkle2Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={['tabler-icon', 'tabler-icon-sparkle-2', className]
      .filter(Boolean)
      .join(' ')}
    aria-hidden={ariaHidden}
  >
    <path d="M12 3c.375 0 .711 .231 .846 .581l1.65 4.29a2.85 2.85 0 0 0 1.632 1.633l4.291 1.65a.906 .906 0 0 1 0 1.692l-4.29 1.65a2.84 2.84 0 0 0 -1.633 1.632l-1.65 4.291a.906 .906 0 0 1 -1.692 0l-1.65 -4.29a2.84 2.84 0 0 0 -1.632 -1.633l-4.291 -1.65a.906 .906 0 0 1 0 -1.692l4.29 -1.65a2.84 2.84 0 0 0 1.633 -1.632l1.65 -4.291a.91 .91 0 0 1 .846 -.581" />
  </svg>
);
