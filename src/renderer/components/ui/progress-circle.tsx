interface Props {
  percentage: number;
  size?: number;
  variant?: "default";
}

export const ProgressCircle = ({
  percentage,
  size = 16,
  variant = "default",
}: Props) => {
  const strokeWidth = size * 0.1875;
  const radius = size / 2 - strokeWidth;
  const circumference = radius * 2 * Math.PI;
  const dashOffset = circumference * (1 - percentage);
  const variants = {
    default: {
      svg: "rotate-90 -scale-x-100 -scale-y-100 transition-all duration-500 text-orange-100 shrink-0",
      circle: "stroke-orange-500",
    },
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={variants[variant].svg}
    >
      <circle
        cx={size * 0.5}
        cy={size * 0.5}
        r={radius}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        className="transition-all duration-500"
      />
      <circle
        cx={size * 0.5}
        cy={size * 0.5}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        className={variants[variant].circle}
      />
    </svg>
  );
};
