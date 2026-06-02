interface LiveDataIconProps {
  size?: number;
  strokeColor: string;
}

export function LiveDataIcon({
  size = 14.667,
  strokeColor,
}: LiveDataIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size * (11.1079 / 14.0366)}
      viewBox="0 0 14.0366 11.1079"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.31766 4.90883C8.31766 5.77895 7.61229 6.48433 6.74217 6.48433C5.87204 6.48433 5.16667 5.77895 5.16667 4.90883C5.16667 4.03871 5.87204 3.33333 6.74217 3.33333C7.61229 3.33333 8.31766 4.03871 8.31766 4.90883Z"
        stroke={strokeColor}
        strokeWidth="1.83333"
      />
      <path
        d="M10.5028 2.16583C9.51489 1.45043 8.31376 0.916667 7.01835 0.916667C3.64848 0.916667 0.916667 4.52877 0.916667 5.55394C0.916667 6.20643 2.02328 7.90684 3.6967 9.05693"
        stroke={strokeColor}
        strokeWidth="1.83333"
      />
      <path
        d="M12.1895 3.77217C12.779 4.50673 13.12 5.19175 13.12 5.55392C13.12 6.5791 10.3881 10.1912 7.01828 10.1912C6.59043 10.1912 6.17286 10.133 5.76987 10.0292"
        stroke={strokeColor}
        strokeWidth="1.83333"
      />
    </svg>
  );
}
