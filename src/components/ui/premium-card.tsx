import * as React from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "large" | "compact";
  hover?: boolean;
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant = "default", hover = true, ...props }, ref) => {
    const baseClasses = "bg-white/95 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-300";
    
    const variantClasses = {
      default: "rounded-2xl p-6 shadow-lg",
      large: "rounded-3xl p-8 shadow-xl min-h-[180px]",
      compact: "rounded-xl p-4 shadow-md"
    };

    const hoverClasses = hover 
      ? "hover:transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer" 
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          hoverClasses,
          className
        )}
        {...props}
      />
    );
  }
);

PremiumCard.displayName = "PremiumCard";

const PremiumCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-2 mb-4", className)} {...props} />
  )
);
PremiumCardHeader.displayName = "PremiumCardHeader";

const PremiumCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-bold text-gray-900 dark:text-white", className)} {...props} />
  )
);
PremiumCardTitle.displayName = "PremiumCardTitle";

const PremiumCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-gray-600 dark:text-gray-300", className)} {...props} />
  )
);
PremiumCardDescription.displayName = "PremiumCardDescription";

const PremiumCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} {...props} />
  )
);
PremiumCardContent.displayName = "PremiumCardContent";

export { 
  PremiumCard, 
  PremiumCardHeader, 
  PremiumCardTitle, 
  PremiumCardDescription, 
  PremiumCardContent 
};