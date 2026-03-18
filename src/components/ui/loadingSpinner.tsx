import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  )
}

export function LoadingPage({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full gap-4">
      <LoadingSpinner size="lg" />
      {label && (
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}
