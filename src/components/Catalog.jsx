import { useMemo, useState } from 'react'
import { courses, getInstructor } from '../data.js'

export default function Catalog({ onSelectCourse }) {
  const [query, setQuery] = useState('')
  const [instructorFilter, setInstructorFilter] = useState('all')

  const instructorIds = useMemo(
    () => Array.from(new Set(courses.map((c) => c.instructor_id))),
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter((course) => {
      const instructor = getInstructor(course.instructor_id)
      const matchesInstructor =
        instructorFilter === 'all' || course.instructor_id === instructorFilter
      if (!matchesInstructor) return false

      if (!q) return true
      const haystack = [
        course.course_id,
        course.name,
        course.short_description,
        course.long_description,
        instructor ? instructor.name : '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query, instructorFilter])

  return (
    <div className="catalog">
      <header className="catalog-hero">
        <div className="catalog-hero-inner">
          <p className="eyebrow">The History Platform</p>
          <h1>Explore the Past, One Course at a Time</h1>
          <p className="hero-sub">
            A collection of historian-led courses spanning antiquity to the modern era.
          </p>
        </div>
      </header>

      <div className="catalog-body">
        <div className="catalog-toolbar">
          <div className="search-field">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M10 4a6 6 0 1 0 3.9 10.4l4.1 4.1 1.4-1.4-4.1-4.1A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
                fill="currentColor"
              />
            </svg>
            <input
              type="search"
              placeholder="Search courses, topics, or instructors…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search courses"
            />
            {query && (
              <button className="clear-btn" onClick={() => setQuery('')} aria-label="Clear search">
                ✕
              </button>
            )}
          </div>

          <select
            className="filter-select"
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
            aria-label="Filter by instructor"
          >
            <option value="all">All instructors</option>
            {instructorIds.map((id) => {
              const inst = getInstructor(id)
              return (
                <option key={id} value={id}>
                  {inst ? inst.name : id}
                </option>
              )
            })}
          </select>
        </div>

        <p className="result-count" aria-live="polite">
          {filtered.length} course{filtered.length === 1 ? '' : 's'}
        </p>

        <div className="course-grid">
          {filtered.map((course) => (
            <CourseCard key={course.course_id} course={course} onSelect={onSelectCourse} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No courses match your search.</p>
            <button onClick={() => { setQuery(''); setInstructorFilter('all') }}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course, onSelect }) {
  const instructor = getInstructor(course.instructor_id)
  return (
    <button className="course-card" onClick={() => onSelect(course.course_id)}>
      <div className="course-card-image">
        <img
          src={course.image_url}
          alt={course.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling.style.display = 'flex'
          }}
        />
        <div className="course-card-fallback" style={{ display: 'none' }}>
          <span>{course.course_id}</span>
        </div>
      </div>
      <div className="course-card-body">
        <span className="course-code">{course.course_id}</span>
        <h3 className="course-title">{course.name}</h3>
        <p className="course-blurb">{course.short_description}</p>
        <div className="course-meta">
          <span className="meta-item">
            {course.number_of_classes} classes · {course.number_of_weeks} weeks
          </span>
          {instructor && (
            <span className="meta-instructor">
              <img
                src={instructor.photo_url}
                alt=""
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              {instructor.name}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}