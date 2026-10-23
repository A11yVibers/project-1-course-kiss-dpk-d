import { useState } from 'react'
import Catalog from './components/Catalog.jsx'
import CoursePage from './components/CoursePage.jsx'

export default function App() {
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  if (selectedCourseId) {
    return <CoursePage courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />
  }

  return <Catalog onSelectCourse={setSelectedCourseId} />
}