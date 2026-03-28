const FOOTER_SHAPE_PATH =
  "M0 4a4 4 0 0 1 4-4h344.32c4.197 0 8.369.66 12.361 1.958l49.5 16.084A40 40 0 0 0 422.542 20h517.7c4.293 0 8.559-.691 12.633-2.047l47.785-15.906A40 40 0 0 1 1013.29 0H1356a4 4 0 0 1 4 4v16H0z";

interface FooterShapeProps {
  fillColor: string;
}

export function FooterShape({ fillColor }: FooterShapeProps) {
  return (
    <div
      aria-hidden
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <svg
        width="100%"
        height="20"
        viewBox="0 0 1360 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <path d={FOOTER_SHAPE_PATH} fill={fillColor} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 19, // 1px overlap to prevent visual subpixel gaps
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: fillColor,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />
    </div>
  );
}
