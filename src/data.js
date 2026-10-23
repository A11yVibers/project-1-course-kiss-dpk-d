// Data loading layer: imports the immutable source data from project-assets/
// and parses it into structures the UI can consume. The application does not
// hard-code course, class, instructor, or material details.
import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'

import lecturePdf from '../project-assets/materials/silk_roads_class_01_lecture.pdf'
import lectureVideo from '../project-assets/materials/silk_roads_class_01_lecture.mp4'
import assignmentMd from '../project-assets/materials/silk_roads_class_02_assignment.md?raw'

// --- CSV parsing -----------------------------------------------------------
function parseCsv(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '')
  const header = parseRow(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseRow(line)
    const record = {}
    header.forEach((key, i) => {
      record[key.trim()] = values[i] !== undefined ? values[i].trim() : ''
    })
    return record
  })
}

function parseRow(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

// --- Source data -----------------------------------------------------------
export const courses = parseCsv(coursesCsv)
export const classes = parseCsv(classesCsv)
export const instructors = parseCsv(instructorsCsv)
export const materials = parseCsv(materialsCsv)

// Material files referenced from course_materials.csv, mapped by file_path so
// the app can resolve a record's `file_path` back to its bundled asset URL.
export const materialAssets = {
  'materials/silk_roads_class_01_lecture.pdf': lecturePdf,
  'materials/silk_roads_class_01_lecture.mp4': lectureVideo,
}

export const materialMarkdown = {
  'materials/silk_roads_class_02_assignment.md': assignmentMd,
}

// --- Derived indexes -------------------------------------------------------
const instructorsById = Object.fromEntries(instructors.map((i) => [i.instructor_id, i]))
const coursesById = Object.fromEntries(courses.map((c) => [c.course_id, c]))

export function getInstructor(instructorId) {
  return instructorsById[instructorId] || null
}

export function getCourse(courseId) {
  return coursesById[courseId] || null
}

// Classes for a course, sorted by week then date.
export function getClassesForCourse(courseId) {
  return classes
    .filter((c) => c.course_id === courseId)
    .sort((a, b) => {
      const weekDiff = Number(a.week_number) - Number(b.week_number)
      if (weekDiff !== 0) return weekDiff
      return new Date(a.date) - new Date(b.date)
    })
}

// Materials for a specific class, sorted by display order.
export function getMaterialsForClass(classId) {
  return materials
    .filter((m) => m.class_id === classId)
    .sort((a, b) => Number(a.display_order) - Number(b.display_order))
}

// Resolve which classes have materials populated (for richer content displays).
export function getClassesWithMaterials(courseId) {
  const courseClasses = getClassesForCourse(courseId)
  const classIds = new Set(materials.map((m) => m.class_id))
  return courseClasses.filter((c) => classIds.has(c.class_id))
}

// Format a date like "2026-09-21" into a readable label.
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}