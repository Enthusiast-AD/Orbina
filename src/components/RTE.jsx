import React, { useState, useRef, useCallback } from 'react'
import { Controller } from 'react-hook-form'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit3
} from 'lucide-react'

export default function RTE({ name, control, label, defaultValue = "", className = "" }) {
  const [mode, setMode] = useState('edit') 
  const textareaRef = useRef(null)

  const insertAtCursor = useCallback((before, after = '', currentContent, setContent) => {
    const textarea = textareaRef.current
    if (!textarea) return currentContent

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = currentContent.substring(start, end)

    const newContent =
      currentContent.substring(0, start) +
      before +
      selectedText +
      after +
      currentContent.substring(end)

    setContent(newContent)

    
    setTimeout(() => {
      const newPosition = start + before.length + selectedText.length
      textarea.focus()
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)

    return newContent
  }, [])

  const formatText = useCallback((type, currentContent, setContent) => {
    switch (type) {
      case 'bold':
        return insertAtCursor('**', '**', currentContent, setContent)
      case 'italic':
        return insertAtCursor('*', '*', currentContent, setContent)
      case 'underline':
        return insertAtCursor('<u>', '</u>', currentContent, setContent)
      case 'strikethrough':
        return insertAtCursor('~~', '~~', currentContent, setContent)
      case 'h1':
        return insertAtCursor('\n# ', '\n', currentContent, setContent)
      case 'h2':
        return insertAtCursor('\n## ', '\n', currentContent, setContent)
      case 'h3':
        return insertAtCursor('\n### ', '\n', currentContent, setContent)
      case 'quote':
        return insertAtCursor('\n> ', '\n', currentContent, setContent)
      case 'code':
        return insertAtCursor('\n```\n', '\n```\n', currentContent, setContent)
      case 'ul':
        return insertAtCursor('\n- ', '\n', currentContent, setContent)
      case 'ol':
        return insertAtCursor('\n1. ', '\n', currentContent, setContent)
      case 'link':
        const url = prompt('Enter URL:')
        if (url) return insertAtCursor(`[`, `](${url})`, currentContent, setContent)
        return currentContent
      default:
        return currentContent
    }
  }, [insertAtCursor])

  
  const convertToHTML = useCallback((text) => {
    if (!text) return ''

    return text
      
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')

      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>')

      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')

      // Quotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

      // Lists
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^1\. (.*$)/gm, '<li>$1</li>')

      // Line breaks
      .replace(/\n/g, '<br>')
  }, [])

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className='inline-block mb-3 pl-1 text-xl font-semibold text-foreground'>
          {label}
        </label>
      )}

      <Controller
        name={name || "content"}
        control={control}
        render={({ field: { onChange, value } }) => {
          const currentValue = value || defaultValue || ''

          const handleContentChange = (newContent) => {
            // Convert markdown to HTML and store
            const htmlContent = convertToHTML(newContent)
            onChange(htmlContent)
          }

          const handleTextareaChange = (e) => {
            handleContentChange(e.target.value)
          }

          return (
            <div className="border border-border overflow-hidden bg-card/50 backdrop-blur-sm shadow-xl">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-3 border-b border-border bg-muted/50">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 border-r border-border pr-3 mr-3">
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className={`p-2 transition-colors ${mode === 'edit'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    title="Edit Mode"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('preview')}
                    className={`p-2 transition-colors ${mode === 'preview'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    title="Preview Mode"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Text Formatting */}
                <div className="flex items-center gap-1 border-r border-border pr-3 mr-3">
                  <button
                    type="button"
                    onClick={() => formatText('bold', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('italic', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('underline', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('strikethrough', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Strikethrough (~~text~~)"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-1 border-r border-border pr-3 mr-3">
                  <button
                    type="button"
                    onClick={() => formatText('h1', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Heading 1 (# text)"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('h2', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Heading 2 (## text)"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('h3', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Heading 3 (### text)"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Lists and Elements */}
                <div className="flex items-center gap-1 border-r border-border pr-3 mr-3">
                  <button
                    type="button"
                    onClick={() => formatText('ul', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Bullet List (- item)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('ol', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Numbered List (1. item)"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('quote', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Quote (> text)"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('code', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Code Block (```code```)"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>

                {/* Insert Elements */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => formatText('link', currentValue, handleContentChange)}
                    className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Insert Link ([text](url))"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor/Preview Area */}
              <div className="relative">
                {mode === 'edit' ? (
                  <textarea
                    ref={textareaRef}
                    value={currentValue}
                    onChange={handleTextareaChange}
                    className="w-full min-h-[450px] max-h-[600px] p-6 text-foreground bg-transparent border-none outline-none resize-none text-lg leading-relaxed font-mono"
                    style={{
                      caretColor: 'var(--primary)',
                      direction: 'ltr',
                      textAlign: 'left'
                    }}
                    dir="ltr"
                    placeholder="Start writing your amazing content...

You can use markdown syntax:
**bold** *italic* ~~strikethrough~~
# Heading 1
## Heading 2
### Heading 3
> Quote
- List item
1. Numbered item
```code block```
[link text](url)"
                  />
                ) : (
                  <div
                    className="min-h-[450px] max-h-[600px] overflow-y-auto p-6 text-foreground"
                    dangerouslySetInnerHTML={{ __html: convertToHTML(currentValue) }}
                  />
                )}
              </div>

              {/* Custom Styles */}
              <style jsx>{`
                textarea {
                  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                }
                
                textarea::-webkit-scrollbar {
                  width: 8px;
                }
                
                textarea::-webkit-scrollbar-track {
                  background: var(--muted);
                }
                
                textarea::-webkit-scrollbar-thumb {
                  background: var(--muted-foreground);
                }
                
                textarea::-webkit-scrollbar-thumb:hover {
                  background: var(--foreground);
                }
                
                /* Preview Styles */
                .min-h-\\[450px\\] h1 {
                  font-size: 2.5rem;
                  font-weight: bold;
                  color: var(--foreground);
                  margin: 1.5rem 0 1rem 0;
                  line-height: 1.2;
                }
                
                .min-h-\\[450px\\] h2 {
                  font-size: 2rem;
                  font-weight: bold;
                  color: var(--foreground);
                  margin: 1.25rem 0 0.75rem 0;
                  line-height: 1.3;
                  border-bottom: 2px solid var(--border);
                  padding-bottom: 0.5rem;
                }
                
                .min-h-\\[450px\\] h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: var(--foreground);
                  margin: 1rem 0 0.5rem 0;
                  line-height: 1.4;
                }
                
                .min-h-\\[450px\\] p {
                  margin: 0.75rem 0;
                  line-height: 1.6;
                  color: var(--muted-foreground);
                }
                
                .min-h-\\[450px\\] blockquote {
                  border-left: 4px solid var(--primary);
                  background: var(--accent);
                  padding: 1rem 1.5rem;
                  margin: 1.5rem 0;
                  font-style: italic;
                  color: var(--muted-foreground);
                }
                
                .min-h-\\[450px\\] pre {
                  background: var(--card);
                  color: var(--foreground);
                  padding: 1rem;
                  border: 1px solid var(--border);
                  overflow-x: auto;
                  margin: 1rem 0;
                }
                
                .min-h-\\[450px\\] code {
                  background: var(--accent);
                  color: var(--primary);
                  padding: 0.125rem 0.375rem;
                  font-size: 0.875rem;
                }
                
                .min-h-\\[450px\\] strong {
                  font-weight: bold;
                  color: var(--foreground);
                }
                
                .min-h-\\[450px\\] em {
                  font-style: italic;
                  color: var(--muted-foreground);
                }
                
                .min-h-\\[450px\\] del {
                  text-decoration: line-through;
                  color: var(--muted-foreground);
                }
                
                .min-h-\\[450px\\] a {
                  color: var(--primary);
                  text-decoration: underline;
                }
                
                .min-h-\\[450px\\] a:hover {
                  color: var(--primary);
                  opacity: 0.8;
                }
                
                .min-h-\\[450px\\] li {
                  margin: 0.5rem 0;
                  line-height: 1.5;
                  color: var(--muted-foreground);
                  margin-left: 1.5rem;
                }
                
                .min-h-\\[450px\\] li:before {
                  content: "• ";
                  color: var(--primary);
                  font-weight: bold;
                  margin-right: 0.5rem;
                }
              `}</style>
            </div>
          )
        }}
      />
    </div>
  )
}