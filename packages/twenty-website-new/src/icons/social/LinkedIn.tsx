const LINKEDIN_PATH =
  "M.386 2.375A1.35 1.35 0 0 1 0 1.394c0-.39.129-.732.386-.997Q.772.001 1.38 0c.406 0 .725.133.982.397q.386.397.386.997c0 .399-.13.716-.386.98q-.386.398-.982.398c-.397 0-.738-.133-.995-.397m2.146 1.517V12H.216V3.892zm7.712.801Q11 5.602 11 7.19v4.667H8.8V7.519q0-.802-.375-1.245t-1.01-.444q-.633 0-1.009.444T6.031 7.52v4.338H3.818V3.869h2.213v1.06q.336-.53.906-.838t1.28-.307q1.27 0 2.026.908";

interface LinkedInIconProps {
  size: number;
  fillColor: string;
}

export function LinkedInIcon({ size, fillColor }: LinkedInIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={LINKEDIN_PATH} fill={fillColor} />
    </svg>
  );
}
