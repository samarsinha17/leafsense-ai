import logoUrl from "../assets/leafsense-logo.png";
import { cn } from "../utils/cn";

interface LogoProps {
  showText?: boolean;
  className?: string;
  imageClassName?: string;
}

export function Logo({ showText = true, className, imageClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logoUrl}
        alt="LeafSense AI logo"
        className={cn("h-11 w-11 rounded-2xl object-cover shadow-glow dark:ring-1 dark:ring-primary/40", imageClassName)}
      />
      {showText ? (
        <span className="font-heading text-xl font-bold tracking-tight text-foreground">
          LeafSense <span className="text-primary">AI</span>
        </span>
      ) : null}
    </div>
  );
}
