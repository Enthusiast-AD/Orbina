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
        <label className='inline-block mb-3 pl-1 text-xl font-semibold text-gray-200'>
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
            <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-900/50 backdrop-blur-sm shadow-xl">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-3 border-b border-slate-600 bg-slate-800/50">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 border-r border-slate-600 pr-3 mr-3">
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className={`p-2 rounded transition-colors ${mode === 'edit'
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                      }`}
                    title="Edit Mode"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('preview')}
                    className={`p-2 rounded transition-colors ${mode === 'preview'
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                      }`}
                    title="Preview Mode"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Text Formatting */}
                <div className="flex items-center gap-1 border-r border-slate-600 pr-3 mr-3">
                  <button
                    type="button"
                    onClick={() => formatText('bold', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('italic', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('underline', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('strikethrough', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Strikethrough (~~text~~)"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-1 border-r border-slate-600 pr-3 mr-3">
                  <button
                    type="button"
                    onClick={() => formatText('h1', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Heading 1 (# text)"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('h2', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Heading 2 (## text)"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('h3', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Heading 3 (### text)"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Lists and Elements */}
                <div className="flex items-center gap-1 border-r border-slate-600 pr-3 mr-3">
                  <button
                    type="button"
                    onClick={() => formatText('ul', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Bullet List (- item)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('ol', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Numbered List (1. item)"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('quote', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                    title="Quote (> text)"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('code', currentValue, handleContentChange)}
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
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
                    className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
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
                    className="w-full min-h-[450px] max-h-[600px] p-6 text-slate-200 bg-transparent border-none outline-none resize-none text-lg leading-relaxed font-mono"
                    style={{
                      caretColor: '#8b5cf6',
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
                    className="min-h-[450px] max-h-[600px] overflow-y-auto p-6 text-slate-200"
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
                  background: #1f2937;
                  border-radius: 4px;
                }
                
                textarea::-webkit-scrollbar-thumb {
                  background: #4b5563;
                  border-radius: 4px;
                }
                
                textarea::-webkit-scrollbar-thumb:hover {
                  background: #6b7280;
                }
                
                /* Preview Styles */
                .min-h-\\[450px\\] h1 {
                  font-size: 2.5rem;
                  font-weight: bold;
                  color: white;
                  margin: 1.5rem 0 1rem 0;
                  line-height: 1.2;
                }
                
                .min-h-\\[450px\\] h2 {
                  font-size: 2rem;
                  font-weight: bold;
                  color: white;
                  margin: 1.25rem 0 0.75rem 0;
                  line-height: 1.3;
                  border-bottom: 2px solid #374151;
                  padding-bottom: 0.5rem;
                }
                
                .min-h-\\[450px\\] h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: white;
                  margin: 1rem 0 0.5rem 0;
                  line-height: 1.4;
                }
                
                .min-h-\\[450px\\] p {
                  margin: 0.75rem 0;
                  line-height: 1.6;
                  color: #e2e8f0;
                }
                
                .min-h-\\[450px\\] blockquote {
                  border-left: 4px solid #8b5cf6;
                  background: rgba(139, 92, 246, 0.1);
                  padding: 1rem 1.5rem;
                  margin: 1.5rem 0;
                  border-radius: 0 0.5rem 0.5rem 0;
                  font-style: italic;
                  color: #cbd5e1;
                }
                
                .min-h-\\[450px\\] pre {
                  background: #000000;
                  color: #00ff00;
                  padding: 1rem;
                  border-radius: 0.5rem;
                  border: 1px solid #374151;
                  overflow-x: auto;
                  margin: 1rem 0;
                }
                
                .min-h-\\[450px\\] code {
                  background: rgba(139, 92, 246, 0.2);
                  color: #c084fc;
                  padding: 0.125rem 0.375rem;
                  border-radius: 0.25rem;
                  font-size: 0.875rem;
                }
                
                .min-h-\\[450px\\] strong {
                  font-weight: bold;
                  color: white;
                }
                
                .min-h-\\[450px\\] em {
                  font-style: italic;
                  color: #cbd5e1;
                }
                
                .min-h-\\[450px\\] del {
                  text-decoration: line-through;
                  color: #94a3b8;
                }
                
                .min-h-\\[450px\\] a {
                  color: #8b5cf6;
                  text-decoration: underline;
                }
                
                .min-h-\\[450px\\] a:hover {
                  color: #a78bfa;
                }
                
                .min-h-\\[450px\\] li {
                  margin: 0.5rem 0;
                  line-height: 1.5;
                  color: #e2e8f0;
                  margin-left: 1.5rem;
                }
                
                .min-h-\\[450px\\] li:before {
                  content: "• ";
                  color: #8b5cf6;
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