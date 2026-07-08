import React from 'react';

/**
 * Skeleton component for an individual Article Card
 */
export const ArticleCardSkeleton: React.FC<{ isFeatured?: boolean }> = ({ isFeatured = false }) => {
  return (
    <div className={`index-card ${isFeatured ? 'featured-card' : ''} pointer-events-none select-none border border-[var(--border)] bg-[var(--card)] rounded-2xl overflow-hidden`}>
      {/* Thumbnail Skeleton */}
      <div className="ic-img relative bg-[var(--bg3)] overflow-hidden">
        <div className="w-full h-full skeleton-shimmer min-h-[160px] sm:min-h-[200px]" />
        {isFeatured && (
          <div className="absolute top-3 left-3 w-24 h-5 rounded-md bg-[var(--bg2)]/80 skeleton-shimmer" />
        )}
      </div>

      {/* Body Skeleton */}
      <div className="ic-body p-4 sm:p-5 flex flex-col justify-between space-y-3">
        <div>
          {/* Category Chip */}
          <div className="w-20 h-4 rounded-md skeleton-shimmer mb-3" />

          {/* Title Lines */}
          <div className="w-full h-4 rounded-md skeleton-shimmer mb-2" />
          <div className="w-3/4 h-4 rounded-md skeleton-shimmer mb-3" />

          {/* Summary Lines */}
          <div className="w-full h-3 rounded-md skeleton-shimmer mb-1.5 opacity-70 hidden sm:block" />
          <div className="w-5/6 h-3 rounded-md skeleton-shimmer mb-3 opacity-70 hidden sm:block" />
        </div>

        {/* Meta Info Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]/40">
          <div className="w-16 h-3 rounded-md skeleton-shimmer" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
          <div className="w-20 h-3 rounded-md skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Component for Article Grid (Hero + Grid list)
 */
export const ArticleGridSkeleton: React.FC<{ count?: number }> = ({ count = 7 }) => {
  return (
    <div className="index-post-grid">
      <ArticleCardSkeleton isFeatured={true} />
      {Array.from({ length: count - 1 }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton Component for Article Detail View
 */
export const ArticleDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 animate-fadeIn select-none pointer-events-none">
      {/* Breadcrumb / Back button skeleton */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-[var(--border)]">
        <div className="w-28 h-8 rounded-lg skeleton-shimmer" />
        <div className="w-20 h-6 rounded-lg skeleton-shimmer" />
      </div>

      {/* Article Header Box */}
      <div className="mb-6 space-y-3">
        {/* Category badge */}
        <div className="w-32 h-6 rounded-full skeleton-shimmer mb-3" />

        {/* Big Title */}
        <div className="w-full h-8 sm:h-10 rounded-xl skeleton-shimmer mb-2" />
        <div className="w-4/5 h-8 sm:h-10 rounded-xl skeleton-shimmer mb-4" />

        {/* Meta Row */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-24 h-4 rounded-md skeleton-shimmer" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
          <div className="w-28 h-4 rounded-md skeleton-shimmer" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
          <div className="w-20 h-4 rounded-md skeleton-shimmer" />
        </div>
      </div>

      {/* Featured Banner Image Skeleton */}
      <div className="w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl skeleton-shimmer mb-8 border border-[var(--border)] shadow-xl overflow-hidden" />

      {/* Content Summary Box Skeleton */}
      <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] mb-8 space-y-2">
        <div className="w-full h-3.5 rounded skeleton-shimmer" />
        <div className="w-11/12 h-3.5 rounded skeleton-shimmer" />
        <div className="w-4/5 h-3.5 rounded skeleton-shimmer" />
      </div>

      {/* Main Content Paragraphs Skeleton */}
      <div className="space-y-4 my-8">
        <div className="w-full h-4 rounded skeleton-shimmer" />
        <div className="w-full h-4 rounded skeleton-shimmer" />
        <div className="w-11/12 h-4 rounded skeleton-shimmer" />
        <div className="w-3/4 h-4 rounded skeleton-shimmer mb-6" />

        <div className="w-full h-4 rounded skeleton-shimmer" />
        <div className="w-full h-4 rounded skeleton-shimmer" />
        <div className="w-5/6 h-4 rounded skeleton-shimmer" />
      </div>

      {/* Author Bio Card Skeleton */}
      <div className="my-8 p-5 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl">
        <div className="w-36 h-4 rounded skeleton-shimmer mb-4" />
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl skeleton-shimmer flex-shrink-0" />
          <div className="flex-1 w-full space-y-2">
            <div className="w-40 h-5 rounded skeleton-shimmer" />
            <div className="w-full h-3.5 rounded skeleton-shimmer" />
            <div className="w-4/5 h-3.5 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Related Articles Carousel Skeleton */}
      <div className="mt-10 pt-6 border-t border-[var(--border)]">
        <div className="w-40 h-5 rounded skeleton-shimmer mb-4" />
        <div className="flex gap-3.5 overflow-hidden py-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex-shrink-0 w-[220px] p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
              <div className="w-full aspect-[16/10] rounded-lg skeleton-shimmer" />
              <div className="w-full h-3.5 rounded skeleton-shimmer" />
              <div className="w-2/3 h-3.5 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Comments Section Skeleton */}
      <div className="mt-10 pt-6 border-t border-[var(--border)] space-y-4">
        <div className="w-44 h-6 rounded skeleton-shimmer" />
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-3">
          <div className="w-full h-12 rounded-lg skeleton-shimmer" />
          <div className="w-full h-20 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};
