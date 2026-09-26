'use client'

import React from 'react'

interface SimulatorSkeletonProps {
  theme?: 'dark' | 'light'
}

export default function SimulatorSkeleton({ theme = 'dark' }: SimulatorSkeletonProps) {
  const isDark = theme === 'dark'

  const bgBase = isDark ? '#141413' : '#ffffff'
  const bgCard = isDark ? '#1a1918' : '#f6f5f2'
  const shimmerBg = isDark
    ? 'linear-gradient(90deg, #1c1c1b 0%, #282826 50%, #1c1c1b 100%)'
    : 'linear-gradient(90deg, #eae8e1 0%, #f6f5f2 50%, #eae8e1 100%)'
  const borderSubtle = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e0d8'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isDark ? '#0e0e0d' : '#f6f5f2',
        color: isDark ? '#f4f4f5' : '#141413',
        fontFamily: "var(--font-sans), 'Geist', sans-serif",
        padding: '0 20px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <style>{`
        @keyframes shimmerPulse {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background-size: 200% 100% !important;
          animation: shimmerPulse 1.6s infinite linear !important;
        }
      `}</style>

      {/* Floating TopBar Skeleton */}
      <header
        style={{
          position: 'relative',
          zIndex: 100,
          maxWidth: '1080px',
          margin: '14px auto 24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            background: bgBase,
            border: borderSubtle,
            borderRadius: '9999px',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: isDark
              ? '0 8px 32px -4px rgba(0, 0, 0, 0.5)'
              : '0 4px 20px -4px rgba(20, 20, 20, 0.06)',
          }}
        >
          {/* Logo skeleton */}
          <div
            className="skeleton-shimmer"
            style={{
              width: '64px',
              height: '18px',
              borderRadius: '6px',
              background: shimmerBg,
            }}
          />

          {/* Nav links skeleton */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              className="skeleton-shimmer"
              style={{ width: '42px', height: '14px', borderRadius: '4px', background: shimmerBg }}
            />
            <div
              className="skeleton-shimmer"
              style={{ width: '42px', height: '14px', borderRadius: '4px', background: shimmerBg }}
            />
            <div
              className="skeleton-shimmer"
              style={{ width: '74px', height: '14px', borderRadius: '4px', background: shimmerBg }}
            />
            <div
              className="skeleton-shimmer"
              style={{ width: '50px', height: '14px', borderRadius: '4px', background: shimmerBg }}
            />
            <div
              className="skeleton-shimmer"
              style={{ width: '32px', height: '32px', borderRadius: '9999px', background: shimmerBg }}
            />
          </div>
        </div>
      </header>

      {/* Main Command Center Skeleton Card */}
      <main
        style={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '780px',
          margin: '0 auto 40px',
          width: '100%',
          boxSizing: 'border-box',
          padding: '36px 28px 48px',
        }}
      >
        <div
          style={{
            width: '100%',
            background: bgBase,
            border: borderSubtle,
            borderRadius: '16px',
            padding: '36px 36px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            boxShadow: isDark
              ? '0 12px 32px rgba(0,0,0,0.45)'
              : '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Input & Button Skeleton */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              className="skeleton-shimmer"
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '8px',
                background: shimmerBg,
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '160px',
                height: '46px',
                borderRadius: '8px',
                background: shimmerBg,
              }}
            />
          </div>

          {/* Sample Chips Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              className="skeleton-shimmer"
              style={{
                width: '180px',
                height: '14px',
                borderRadius: '4px',
                background: shimmerBg,
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[80, 130, 70, 65, 140].map((width, i) => (
                <div
                  key={i}
                  className="skeleton-shimmer"
                  style={{
                    width: `${width}px`,
                    height: '28px',
                    borderRadius: '6px',
                    background: shimmerBg,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e5e3dc',
              margin: '4px 0',
            }}
          />

          {/* Dropzone Skeleton */}
          <div
            style={{
              height: '150px',
              border: isDark ? '2px dashed rgba(255, 255, 255, 0.12)' : '2px dashed #dedad1',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: bgCard,
            }}
          >
            <div
              className="skeleton-shimmer"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '9999px',
                background: shimmerBg,
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '260px',
                height: '16px',
                borderRadius: '4px',
                background: shimmerBg,
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '340px',
                height: '12px',
                borderRadius: '4px',
                background: shimmerBg,
              }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              className="skeleton-shimmer"
              style={{
                flex: 1,
                height: '40px',
                borderRadius: '8px',
                background: shimmerBg,
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                flex: 1,
                height: '40px',
                borderRadius: '8px',
                background: shimmerBg,
              }}
            />
          </div>

          {/* Bottom Scenario Cards Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <div
              className="skeleton-shimmer"
              style={{
                width: '200px',
                height: '12px',
                borderRadius: '4px',
                background: shimmerBg,
              }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
              }}
            >
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  style={{
                    background: bgCard,
                    border: borderSubtle,
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div
                      className="skeleton-shimmer"
                      style={{ width: '70px', height: '14px', borderRadius: '4px', background: shimmerBg }}
                    />
                    <div
                      className="skeleton-shimmer"
                      style={{ width: '48px', height: '14px', borderRadius: '4px', background: shimmerBg }}
                    />
                  </div>
                  <div
                    className="skeleton-shimmer"
                    style={{ width: '120px', height: '16px', borderRadius: '4px', background: shimmerBg }}
                  />
                  <div
                    className="skeleton-shimmer"
                    style={{ width: '100%', height: '10px', borderRadius: '4px', background: shimmerBg }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
