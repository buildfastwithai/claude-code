import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        secondary:
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        success:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        warning:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        danger:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        outline:
          "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
