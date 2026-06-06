import React from 'react';

interface LoadingSkeletonProperties {
  skeletonWidth?: string;
  skeletonHeight?: string;
  skeletonBorderRadius?: string;
}

export default function LoadingSkeleton({
  skeletonWidth = '100%',
  skeletonHeight = '20px',
  skeletonBorderRadius = 'var(--radius-md)',
}: LoadingSkeletonProperties): React.JSX.Element {
  return (
    <div
      className="skeleton-block"
      style={{
        width: skeletonWidth,
        height: skeletonHeight,
        borderRadius: skeletonBorderRadius,
      }}
    />
  );
}
