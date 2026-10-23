import { useState } from 'react'
import {
  getCourse,
  getInstructor,
  getClassesForCourse,
  getMaterialsForClass,
  formatDate,
} from '../data.js'
import MaterialViewer from './MaterialViewer.jsx'

export default function CoursePage({ courseId, onBack }) {
  const course = getCourse(courseId)
  const instructor = getInstructor(course.instructor_id)
  const courseClasses = getClassesForCourse(courseId)

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [activeClassId, setActiveClassId] = useState(null)

  if (!course) {
    return (
      <div className="course-page">
        <p className="not-found">Course not found.</p>
        <button onClick={onBack}>Back to catalog</button>
      </div>
    )
  }

  return (
    <div className={`course-page ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <header className="course-header">
        <button className="back-btn" onClick={onBack} aria-label="Back to catalog">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12Z" fill="currentColor" />
          </svg>
          Catalog
        </button>
        <span className="course-code-pill">{course.course_id}</span>
        <h1>{course.name}</h1>
        {instructor && (
          <div className="course-instructor">
            <img
              src={instructor.photo_url}
              alt={instructor.name}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <span>Instructor: {instructor.name}</span>
          </div>
        )}
      </header>

      <div className="course-layout">
        <aside className={`sidebar ${sidebarOpen ? '' : 'is-collapsed'}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Collapse syllabus' : 'Expand syllabus'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? '◀ Collapse' : '▶'}
          </button>

          {sidebarOpen && (
            <div className="sidebar-content">
              <section className="course-info">
                <h2>About this course</h2>
                <p>{course.long_description}</p>
                <dl className="course-facts">
                  <div><dt>Length</dt><dd>{course.number_of_weeks} weeks</dd></div>
                  <div><dt>Classes</dt><dd>{course.number_of_classes}</dd></div>
                  <div><dt>Instructor</dt><dd>{instructor ? instructor.name : '—'}</dd></div>
                </dl>
              </section>

              <section className="syllabus">
                <h2>Syllabus</h2>
                <table className="syllabus-table">
                  <thead>
                    <tr>
                      <th>Week</th>
                      <th>Date</th>
                      <th>Class content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseClasses.map((cls) => (
                      <SyllabusRow
                        key={cls.class_id}
                        cls={cls}
                        isActive={activeClassId === cls.class_id}
                        onSelectMaterial={(mat) => {
                          setActiveClassId(cls.class_id)
                          setSelectedMaterial(mat)
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          )}
        </aside>

        <main className="material-pane">
          {selectedMaterial ? (
            <MaterialViewer material={selectedMaterial} />
          ) : (
            <div className="course-splash">
              <img
                src={course.image_url}
                alt={course.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextSibling.style.display = 'flex'
                }}
              />
              <div className="course-splash-fallback" style={{ display: 'none' }}>
                <span>{course.course_id}</span>
              </div>
              <div className="splash-overlay">
                <h2>{course.name}</h2>
                <p>{course.short_description}</p>
                <span className="splash-hint">Select a material from the syllabus to begin.</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function SyllabusRow({ cls, isActive, onSelectMaterial }) {
  const materials = getMaterialsForClass(cls.class_id)
  const hasViewer = materials.length > 0

  return (
    <tr className={isActive ? 'active' : ''}>
      <td className="week-cell">Week {cls.week_number}</td>
      <td className="date-cell">{formatDate(cls.date)}</td>
      <td className="content-cell">
        <span className="class-title">{cls.class_name}</span>
        {hasViewer ? (
          <ul className="material-list">
            {materials.map((m) => (
              <li key={m.material_id}>
                <button
                  className="material-link"
                  onClick={() => onSelectMaterial(m)}
                >
                  <MaterialIcon type={m.material_type} />
                  {m.material_title}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <span className="no-materials">Materials coming soon</span>
        )}
      </td>
    </tr>
  )
}

function MaterialIcon({ type }) {
  switch (type) {
    case 'pdf': return <span className="icon-pdf">PDF</span>
    case 'video': return <span className="icon-video">▶</span>
    case 'youtube': return <span className="icon-video">▶</span>
    case 'md': return <span className="icon-md">MD</span>
    default: return <span className="icon-other">•</span>
  }
}