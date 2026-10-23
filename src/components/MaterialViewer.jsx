import { materialAssets, materialMarkdown } from '../data.js'

// Renders a single material. `material` is a record from course_materials.csv
// with fields: material_type, file_path, material_title.
export default function MaterialViewer({ material }) {
  if (!material) return null

  const { material_type: type, file_path: path, material_title: title } = material

  return (
    <div className="material-viewer">
      <div className="material-viewer-header">
        <span className="material-badge">{labelForType(type)}</span>
        <h3>{title}</h3>
      </div>

      <div className="material-viewer-body">
        {renderMaterial(type, path, title)}
      </div>
    </div>
  )
}

function labelForType(type) {
  switch (type) {
    case 'pdf': return 'Lecture PDF'
    case 'video': return 'Lecture Video'
    case 'md': return 'Assignment'
    case 'youtube': return 'Video'
    default: return type
  }
}

function renderMaterial(type, path, title) {
  if (type === 'pdf') {
    const url = materialAssets[path]
    if (!url) return <Unavailable title={title} reason="This file could not be located." />
    return <iframe className="pdf-frame" src={url} title={title} />
  }

  if (type === 'video') {
    const url = materialAssets[path]
    if (!url) return <Unavailable title={title} reason="This file could not be located." />
    return (
      <video className="video-frame" src={url} controls title={title}>
        Your browser does not support the video tag.
      </video>
    )
  }

  if (type === 'youtube') {
    const videoId = extractYouTubeId(path)
    if (!videoId) return <Unavailable title={title} reason="This video link is not available." />
    return (
      <iframe
        className="video-frame youtube-frame"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (type === 'md') {
    const markdown = materialMarkdown[path]
    if (markdown === undefined) return <Unavailable title={title} reason="This document could not be located." />
    return (
      <article className="markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} />
    )
  }

  return <Unavailable title={title} reason="This material type is not yet supported." />
}

function Unavailable({ title, reason }) {
  return (
    <div className="material-unavailable">
      <p className="unavailable-title">{title}</p>
      <p className="unavailable-reason">{reason}</p>
    </div>
  )
}

function extractYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([\w-]{6,})/,
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

// A small, safe Markdown renderer sufficient for the assignment files:
// headings, emphasis, lists, tables, links, and paragraphs.
function renderMarkdown(md) {
  const escapeHtml = (s) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const lines = md.split('\n')
  const out = []
  let list = null // 'ul' | 'ol'
  let table = null
  let inCode = false

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }
  const closeTable = () => {
    if (table) {
      out.push('</tbody></table>')
      table = null
    }
  }

  const inline = (text) => {
    let s = escapeHtml(text)
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
    s = s.replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    return s
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '')

    if (line.trim().startsWith('```')) {
      closeList()
      closeTable()
      if (inCode) {
        out.push('</code></pre>')
        inCode = false
      } else {
        out.push('<pre><code>')
        inCode = true
      }
      continue
    }
    if (inCode) {
      out.push(escapeHtml(line))
      continue
    }

    // Table row
    if (table && line.trim().startsWith('|')) {
      const cells = splitTableRow(line)
      if (cells.every((c) => /^:?-{3,}:?$/.test(c.trim()))) continue // separator
      out.push('<tr>' + cells.map((c) => `<td>${inline(c.trim())}</td>`).join('') + '</tr>')
      continue
    }
    if (table && line.trim() === '') {
      closeTable()
      continue
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      closeList()
      closeTable()
      const level = heading[1].length
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }

    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      closeList()
      closeTable()
      out.push('<hr/>')
      continue
    }

    // Unordered list
    const ul = line.match(/^\s*[-*+]\s+(.*)$/)
    if (ul) {
      closeTable()
      if (list !== 'ul') {
        closeList()
        out.push('<ul>')
        list = 'ul'
      }
      out.push(`<li>${inline(ul[1])}</li>`)
      continue
    }

    // Ordered list
    const ol = line.match(/^\s*\d+\.\s+(.*)$/)
    if (ol) {
      closeTable()
      if (list !== 'ol') {
        closeList()
        out.push('<ol>')
        list = 'ol'
      }
      out.push(`<li>${inline(ol[1])}</li>`)
      continue
    }

    // Table header
    if (line.trim().startsWith('|')) {
      closeList()
      const cells = splitTableRow(line)
      out.push('<table><thead><tr>' + cells.map((c) => `<th>${inline(c.trim())}</th>`).join('') + '</tr></thead><tbody>')
      table = true
      continue
    }

    // Blockquote
    const quote = line.match(/^\s*>\s?(.*)$/)
    if (quote) {
      closeList()
      closeTable()
      out.push(`<blockquote>${inline(quote[1])}</blockquote>`)
      continue
    }

    // Blank line
    if (line.trim() === '') {
      closeList()
      closeTable()
      continue
    }

    // Paragraph
    closeList()
    closeTable()
    out.push(`<p>${inline(line)}</p>`)
  }

  closeList()
  closeTable()
  if (inCode) out.push('</code></pre>')
  return out.join('')
}

function splitTableRow(line) {
  let s = line.trim()
  if (s.startsWith('|')) s = s.slice(1)
  if (s.endsWith('|')) s = s.slice(0, -1)
  const cells = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '|' && !inQuotes) {
      cells.push(cur)
      cur = ''
    } else {
      cur += ch
      if (ch === '"') inQuotes = !inQuotes
    }
  }
  cells.push(cur)
  return cells
}