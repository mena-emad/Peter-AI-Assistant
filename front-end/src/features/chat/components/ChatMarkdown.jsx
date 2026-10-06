import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function ChatMarkdown({ content }) {
  return <div className="markdown-content" dir="rtl">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
        code: ({ node, className, ...props }) => <code {...props} className={className} dir="ltr" />,
        pre: ({ node, ...props }) => <pre {...props} dir="ltr" />,
        table: ({ node, ...props }) => <div className="markdown-table-wrap"><table {...props} /></div>,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
}

export default ChatMarkdown
