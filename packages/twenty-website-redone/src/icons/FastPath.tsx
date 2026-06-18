const FAST_PATH_D =
  'M12.2843 7.75532C12.2843 10.6142 9.94478 12.9318 7.05882 12.9318C4.17287 12.9318 1.83333 10.6142 1.83333 7.75532C1.83333 4.89643 4.17287 2.57885 7.05882 2.57885M9.67157 7.75532C9.67157 9.18476 8.5018 10.3436 7.05882 10.3436C5.61584 10.3436 4.44608 9.18476 4.44608 7.75532C4.44608 6.32587 5.61584 5.16708 7.05882 5.16708M9.36819 5.36328L7.05882 7.65098M12.8333 3.76195L10.7549 5.82087L9.36929 5.36334L8.90742 3.99072L10.9858 1.93179L11.2168 3.53318L12.8333 3.76195Z';

export type FastPathIconProps = {
  sizePx?: number;
};

// Authored feature glyph (target with a dart), on currentColor.
export function FastPathIcon({ sizePx = 14.667 }: FastPathIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={sizePx * (14.7651 / 14.7908)}
      viewBox="0 0 14.7908 14.7651"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={FAST_PATH_D} stroke="currentColor" strokeWidth="1.83333" />
    </svg>
  );
}
