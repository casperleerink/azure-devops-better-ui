import { motion } from "motion/react";

export const Bullet = () => {
  return (
    <div className={`relative mr-4 flex min-h-8 min-w-4`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 16 16"
        className={`absolute top-1/2 left-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-gray-500`}
      >
        <motion.circle
          cx="8"
          cy="8"
          r="7.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{
            delay: 0.5,
            duration: 0.75,
            ease: [0.77, 0, 0.175, 1],
          }}
          className={"stroke-gray-500"}
        />
        <motion.circle
          cx="8"
          cy="8"
          r="3"
          fill="currentColor"
          whileInView={{ scale: 1 }}
          initial={{ scale: 0 }}
          transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
          className={`stroke-gray-500`}
        />
      </svg>
    </div>
  );
};
