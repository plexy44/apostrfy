import { cn } from "@/lib/utils";

const ApostrfyLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 200 40"
    className={cn("fill-current", className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="Space Grotesk, sans-serif"
      fontSize="36"
      fontWeight="bold"
      letterSpacing="1"
    >
      Apostrfy
    </text>
  </svg>
);

export default ApostrfyLogo;
