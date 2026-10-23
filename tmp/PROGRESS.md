# Progress — History Learning Platform

## Goal
Build an online learning platform focused on history courses, driven entirely by the
data in `project-assets/` (12 courses, ~144 classes, 4 instructors, and Silk Roads
course materials). Documents the work done so far.

## What was explored
- `project-assets/` holds four CSVs (`history_courses.csv`, `history_classes.csv`,
  `history_instructors.csv`, `course_materials.csv`) plus a `materials/` folder with a
  PDF lecture, an MP4 lecture video, and a Markdown assignment — all for The Silk Roads
  course (HIST111).
- `course_materials.csv` lists four materials across the first two HIST111 classes:
  - Class 1: Lecture Notes (PDF), Lecture Video (MP4)
  - Class 2: Crash Course YouTube link, Assignment (Markdown)
- The starter app is a plain Vite + React 18 project with an empty `App.jsx`.

## Implementation

### Data layer — `src/data.js`
- Imports the four CSVs as raw text (`?raw`) and parses them with a small RFC-4180-style
  CSV parser (handles quoted commas and escaped quotes).
- Imports the three material files so Vite bundles them as hashed asset URLs:
  the PDF and MP4 via normal asset imports, the Markdown via `?raw`.
- Exports typed helpers: `getInstructor`, `getCourse`, `getClassesForCourse`,
  `getMaterialsForClass`, and `formatDate`.
- No course/class/instructor/material data is duplicated in app code — it all comes from
  the immutable CSVs, per the requirements.

### Components
- `src/App.jsx` — top-level state routing between the catalog and a selected course.
- `src/components/Catalog.jsx` — hero header, a search box (matches course id, title,
  descriptions, and instructor name), an instructor filter dropdown, and a responsive
  grid of 12 course cards (image, code, title, blurb, class/week counts, instructor).
- `src/components/CoursePage.jsx` — two-pane layout: a collapsible left sidebar (course
  info + syllabus table with week / date / class content columns) and a persistent right
  material-viewing pane that shows the course image by default and swaps in a selected
  material without leaving the page.
- `src/components/MaterialViewer.jsx` — renders each material type: PDF (iframe), MP4
  (HTML5 video), YouTube (iframe embed with parsed video id), and Markdown (a small
  in-house renderer producing headings, emphasis, lists, tables, links, blockquotes).

### Styling — `src/styles.css`
- Warm, "modern digital history library" palette: parchment background, sepia/ink text,
  terracotta accent, gold highlights, serif display type (Iowan Old Style / Palatino)
  over a clean sans body. Gradient hero, card hover elevation, and a collapsed-state
  sidebar transition. Responsive down to mobile (sidebar stacks under the viewer).

## Verification
- `npm run build` succeeds and emits the PDF (190 kB) and MP4 (4.2 MB) as hashed assets.
- Manual browser checks confirmed: 12 courses listed; search ("silk" → 1 course, "Mehta"
  → 3 courses, clear → 12); instructor filter options present; course page shows syllabus
  with Class 1 (2 materials) and Class 2 (2 materials); selecting PDF / MP4 / YouTube /
  Markdown swaps the right pane correctly; the sidebar collapses to a narrow strip.

## Remaining
- Finalize by stopping the dev server, running the project lint/typecheck, and committing
  via `commit_and_merge`.