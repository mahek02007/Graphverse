import './PresentationBar.css'

/**
 * Reusable Classroom Presentation HUD component.
 * Displays guided classroom slides with talking points, key takeaways,
 * and slide progression controls.
 */
export default function PresentationBar({
  slides = [],
  currentIndex = 0,
  onNext,
  onPrev,
  onSelectSlide,
  onExit,
  themeColor = '#00d4ff',
}) {
  const currentSlide = slides[currentIndex] || slides[0]
  if (!currentSlide) return null

  const total = slides.length
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < total - 1

  return (
    <div className="pres-bar-container" style={{ '--pres-theme': themeColor }}>
      <div className="container">
        <div className="pres-bar-card">
          {/* Header Row */}
          <div className="pres-bar-header">
            <div className="pres-bar-badge-group">
              <span className="pres-bar-badge">
                <span className="glow-dot" style={{ background: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                Classroom Presentation Mode
              </span>
              <span className="pres-bar-counter">
                Slide <strong>{currentIndex + 1}</strong> of {total}
              </span>
            </div>

            <div className="pres-bar-actions">
              <button
                type="button"
                className="pres-nav-btn"
                onClick={onPrev}
                disabled={!hasPrev}
                title="Previous Slide"
              >
                ⏮ Prev Slide
              </button>
              <button
                type="button"
                className="pres-nav-btn pres-nav-btn--primary"
                onClick={onNext}
                disabled={!hasNext}
                title="Next Slide"
              >
                Next Slide ⏭
              </button>
              <button
                type="button"
                className="pres-exit-btn"
                onClick={onExit}
                title="Exit Presentation Mode"
              >
                ✕ Exit
              </button>
            </div>
          </div>

          {/* Slide Content */}
          <div className="pres-content-layout">
            <div className="pres-main-column">
              <h2 className="pres-slide-title">{currentSlide.title}</h2>
              <p className="pres-concept-text">{currentSlide.mainConcept}</p>
              {currentSlide.highlightSummary && (
                <div className="pres-highlight-box">
                  <span className="pres-highlight-tag">🔍 On Screen Demonstration</span>
                  <p>{currentSlide.highlightSummary}</p>
                </div>
              )}
            </div>

            {/* Teacher Talking Points for Classroom Presentation */}
            {currentSlide.talkingPoints && currentSlide.talkingPoints.length > 0 && (
              <div className="pres-notes-column">
                <div className="pres-notes-header">
                  <span>🗣️ Instructor Talking Points</span>
                </div>
                <ul className="pres-notes-list">
                  {currentSlide.talkingPoints.map((point, idx) => (
                    <li key={idx} className="pres-note-item">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Slide Indicator Dots */}
          <div className="pres-dots-row">
            {slides.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className={`pres-dot-btn ${idx === currentIndex ? 'pres-dot-btn--active' : ''}`}
                onClick={() => onSelectSlide(idx)}
                title={`Jump to: ${s.title}`}
              >
                <span className="pres-dot-num">{idx + 1}</span>
                <span className="pres-dot-label">{s.title.split('—')[1] || s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
