const shimmerStyle: React.CSSProperties = {
  backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.8s ease-in-out infinite',
};

export default function SkeletonGrid() {
  return (
    <>
      {/* Skeleton hero banner */}
      <div style={{
        marginBottom: '1.25rem',
        borderRadius: '22px',
        minHeight: '180px',
        ...shimmerStyle,
        backgroundColor: 'var(--card-bg)',
        border: '0.5px solid var(--card-border)',
      }} />

      {/* Skeleton horizontal section */}
      {[0, 1].map(sectionIdx => (
        <div key={sectionIdx} style={{ marginBottom: '1.15rem' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .1rem .35rem' }}>
            <div style={{
              width: 24, height: 24, borderRadius: 8, flexShrink: 0,
              backgroundColor: 'var(--card-border)', ...shimmerStyle,
            }} />
            <div style={{
              height: 11, width: '35%', borderRadius: 4,
              backgroundColor: 'var(--card-border)', ...shimmerStyle,
            }} />
          </div>
          {/* Horizontal scroll row */}
          <div style={{ display: 'flex', gap: '.65rem', overflow: 'hidden', paddingBottom: '.3rem' }}>
            {[0, 1, 2, 3].map(cardIdx => (
              <div key={cardIdx} style={{
                minWidth: 180, flexShrink: 0,
                backgroundColor: 'var(--card-bg)',
                border: '0.5px solid var(--card-border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{ width: '100%', paddingBottom: '56.25%', height: 0, ...shimmerStyle, backgroundColor: 'var(--card-border)' }} />
                <div style={{ padding: '.5rem .6rem .6rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                  <div style={{ height: 9, width: '80%', borderRadius: 3, ...shimmerStyle, backgroundColor: 'var(--card-border)' }} />
                  <div style={{ height: 9, width: '50%', borderRadius: 3, ...shimmerStyle, backgroundColor: 'var(--card-border)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Main grid skeleton */}
      <div className="skeleton-grid">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="skeleton-img" />
            <div className="skeleton-body">
              <div className="skeleton-line" style={{ width: '75%' }} />
              <div className="skeleton-line" style={{ width: '55%' }} />
              <div className="skeleton-line short" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
