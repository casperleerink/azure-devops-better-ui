import { motion } from "motion/react";
import { cn } from "~/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeVariants = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-3",
};

const sizeVariantsGap = {
  sm: "gap-1",
  md: "gap-1",
  lg: "gap-2",
};

export function Loader({ className, size = "md", ...props }: LoaderProps) {
  return (
    <div className={cn("flex items-center", sizeVariantsGap[size], className)} {...props}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(sizeVariants[size])}
          animate={{
            backgroundColor: ["var(--color-alpha)", "var(--color-gray-950)", "var(--color-alpha)"],
            opacity: [0.05, 1, 0.05, 0.05],
          }}
          transition={{
            duration: 1,
            delay: i * 0.25,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.2, 0.4, 1],
          }}
        />
      ))}
    </div>
  );
}
