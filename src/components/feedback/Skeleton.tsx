import * as React from 'react'

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: string
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'rounded',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  }

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`bg-[#e8e6e1] fox-skeleton-pulse ${rounded} ${className}`}
    />
  )
}

export function SkeletonText({
  lines = 2,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div aria-hidden="true" className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="group min-w-0"
    >
      {/* 3:4 aspect image skeleton */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#eeeae3] rounded-none">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <div className="mt-3.5 space-y-1.5 sm:mt-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="pdp-container py-8 sm:py-12"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
        {/* Gallery Column (60%) */}
        <div className="lg:col-span-7">
          <div className="aspect-[3/4] w-full bg-[#eeeae3]">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-20 w-16 rounded-none" />
            <Skeleton className="h-20 w-16 rounded-none" />
            <Skeleton className="h-20 w-16 rounded-none" />
          </div>
        </div>

        {/* Info Column (40%) */}
        <div className="lg:col-span-5 space-y-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-6 w-32" />
          <SkeletonText lines={3} className="pt-2" />

          {/* Color options skeleton */}
          <div className="pt-4 border-t border-line space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Size options skeleton */}
          <div className="pt-4 border-t border-line space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-12" />
            </div>
          </div>

          {/* Add to bag button skeleton */}
          <Skeleton className="h-13 w-full rounded-full mt-6" />
        </div>
      </div>
    </div>
  )
}

export function SearchResultSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3.5 border-b border-line p-3"
    >
      <Skeleton className="h-20 w-16 shrink-0 rounded-none" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-16" />
      </div>
    </div>
  )
}

export function OrderSummarySkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4 p-5 border border-line bg-white">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-3 pt-3 border-t border-line">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t border-line">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-12 w-full rounded-full mt-4" />
    </div>
  )
}

export default Skeleton

