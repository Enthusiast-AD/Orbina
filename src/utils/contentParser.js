
export const parseContent = (content) => {
  if (!content) return ''
  
  let html = content.toString()
  
  
  if (html.includes('<') && html.includes('>')) {
    
    html = html
      
      .replace(/<(\w+)><\/\1>/g, '')
      .replace(/<(\w+)\s*><\/\1>/g, '')
      
      
      .replace(/<br\s*\/?>/g, '<br>')
      .replace(/\n/g, '<br>')
      
      
      .replace(/(<br>\s*){2,}/g, '</p><p>')
      
      .replace(/\s+/g, ' ')
      .trim()
    
   
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`
    }
    
    return html
  }
  
  
  return convertMarkdownToHTML(html)
}


function convertMarkdownToHTML(text) {
  let html = text
  

  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  

  html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>')
  html = html.replace(/`([^`\n]+?)`/g, '<code>$1</code>')
  

  html = html.replace(/(^|\n)### ([^\n]+)/g, '$1<h3>$2</h3>')
  html = html.replace(/(^|\n)## ([^\n]+)/g, '$1<h2>$2</h2>')
  html = html.replace(/(^|\n)# ([^\n]+)/g, '$1<h1>$2</h1>')
  

  html = html.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>')
  html = html.replace(/<u>([^<]+?)<\/u>/g, '<u>$1</u>')

  html = html.replace(/(^|\n)> ([^\n]+)/g, '$1<blockquote>$2</blockquote>')
  

  const lines = html.split('\n')
  const processedLines = []
  let inOrderedList = false
  let inUnorderedList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (/^\d+\.\s+(.+)/.test(line)) {
      const match = line.match(/^\d+\.\s+(.+)/)
      if (!inOrderedList) {
        if (inUnorderedList) {
          processedLines.push('</ul>')
          inUnorderedList = false
        }
        processedLines.push('<ol>')
        inOrderedList = true
      }
      processedLines.push(`<li>${match[1]}</li>`)
    }
    else if (/^-\s+(.+)/.test(line)) {
      const match = line.match(/^-\s+(.+)/)
      if (!inUnorderedList) {
        if (inOrderedList) {
          processedLines.push('</ol>')
          inOrderedList = false
        }
        processedLines.push('<ul>')
        inUnorderedList = true
      }
      processedLines.push(`<li>${match[1]}</li>`)
    }
    else {
      if (inOrderedList) {
        processedLines.push('</ol>')
        inOrderedList = false
      }
      if (inUnorderedList) {
        processedLines.push('</ul>')
        inUnorderedList = false
      }
      
      if (line.length > 0) {
        if (line.match(/^<(h[1-6]|blockquote|pre)/)) {
          processedLines.push(line)
        } else {
          processedLines.push(`<p>${line}</p>`)
        }
      }
    }
  }
  
  if (inOrderedList) processedLines.push('</ol>')
  if (inUnorderedList) processedLines.push('</ul>')
  
  return processedLines.join('\n')
}

export const cleanDisplayContent = (content) => {
  if (!content) return ''
  
  return parseContent(content)
    
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    
    .replace(/\s+/g, ' ')
    .trim()
}