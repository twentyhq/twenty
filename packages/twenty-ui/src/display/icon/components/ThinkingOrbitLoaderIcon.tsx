import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type ThinkingOrbitLoaderIconProps = Pick<
  IconComponentProps,
  'className' | 'size'
>;

export const ThinkingOrbitLoaderIcon = ({
  className,
  size = 14,
}: ThinkingOrbitLoaderIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M3.1 7 C3.1 4.4 6.0 4.4 7.0 7 C8.0 9.6 10.9 9.6 10.9 7 C10.9 4.4 8.0 4.4 7.0 7 C6.0 9.6 3.1 9.6 3.1 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        pathLength={100}
        strokeDasharray="14 86"
        strokeDashoffset="0"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-100"
          dur="1.05s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="10 90;16 84;10 90"
          dur="1.05s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};
