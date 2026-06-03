export default function SkeletonGrid() {
  return (
    <>
      {/* Skeleton hero banner */}
      <div style={{
        marginBottom: '1.25rem', borderRadius: '16px', overflow: 'hidden',
        minHeight: '170px', background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        animation: 'shimmer 1.8s ease-in-out infinite',
        backgroundImage: 'linear-gradient(90deg, var(--card-bg) 25%, var(--bg-hover) 50%, var(--card-bg) 75%)',
        backgroundSize: '200% 100%',
      }} />

      {/* Skeleton sections */}
      {[...Array(2)].map((_, sectionIdx) => (
        <div key={`section-${sectionIdx}`} style={{ marginBottom: '1.15rem' }}>
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '.5rem',
            padding: '.5rem .15rem .35rem', marginBottom: '.15rem',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'var(--card-border)', flexShrink: 0,
              animation: 'shimmer 1.8s ease-in-out infinite',
              backgroundImage: 'linear-gradient(90deg, var(--card-bg) 25%, var(--bg-hover) 50%, var(--card-bg) 75%)',
              backgroundSize: '200% 100%',
            }} />
            <div style={{
              height: 12, width: '40%', borderRadius: 4,
              background: 'var(--card-border)',
              animation: 'shimmer 1.8s ease-in-out infinite',
              backgroundImage: 'linear-gradient(90deg, var(--card-bg) 25%, var(--bg-hover) 50%, var(--card-bg) 75%)',
              backgroundSize: '200% 100%',
            }} />
          </div>
          {/* Horizontal scroll skeletons */}
          <div style={{ display: 'flex', gap: '.65rem', overflow: 'hidden' }}>
            {[...Array(4)].map((_, cardIdx) => (
              <div
                key={`scroll-card-${sectionIdx}-${cardIdx}`}
                style={{
                  minWidth: 180, maxWidth: 200, flexShrink: 0,
                  background: 'var(--card-bg)', borderRadius: 12,
                  border: '1px solid var(--card-border)', overflow: 'hidden',
                }}
              >
                <div style={{
                  width: '100%', paddingBottom: '56.25%', height: 0,
                  background: 'linear-gradient(90deg, var(--card-border) 25%, var(--bg-hover) 50%, var(--card-border) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.8s ease-in-out infinite',
                }} />
                <div style={{ padding: '.5rem .65rem .6rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                  <div style={{
                    height: 9, width: '85%', borderRadius: 3,
                    background: 'var(--card-border)',
                    animation: 'shimmer 1.8s ease-in-out infinite',
                    backgroundImage: 'linear-gradient(90deg, var(--card-bg) 25%, var(--bg-hover) 50%, var(--card-bg) 75%)',
                    backgroundSize: '200% 100%',
                  }} />
                  <div style={{
                    height: 9, width: '50%', borderRadius: 3,
                    background: 'var(--card-border)',
                    animation: 'shimmer 1.8s ease-in-out infinite',
                    backgroundImage: 'linear-gradient(90deg, var(--card-bg) 25%, var(--bg-hover) 50%, var(--card-bg) 75%)',
                    backgroundSize: '200% 100%',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Main grid skeleton */}
      <div className="skeleton-grid">
        {[...Array(6)].map((_, i) => (
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
