const RATING_STAR_PATH =
  'M4.76186 0.60019C5.05804 -0.200134 6.19001 -0.200133 6.48619 0.600191L7.46388 3.24205C7.557 3.49365 7.75537 3.69203 8.00698 3.78514L10.6488 4.76284C11.4492 5.05902 11.4492 6.19098 10.6488 6.48717L8.00698 7.46486C7.75537 7.55797 7.557 7.75635 7.46388 8.00796L6.48619 10.6498C6.19001 11.4501 5.05804 11.4501 4.76186 10.6498L3.78417 8.00796C3.69105 7.75635 3.49267 7.55797 3.24107 7.46486L0.599213 6.48717C-0.201111 6.19098 -0.20111 5.05902 0.599214 4.76284L3.24107 3.78514C3.49267 3.69203 3.69105 3.49365 3.78417 3.24205L4.76186 0.60019Z';

interface RatingStarIconProps {
  fillColor: string;
  size?: number;
}

export function RatingStarIcon({
  fillColor,
  size = 12,
}: RatingStarIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={RATING_STAR_PATH} fill={fillColor} />
    </svg>
  );
}
