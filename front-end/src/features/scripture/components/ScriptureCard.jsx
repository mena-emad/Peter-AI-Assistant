import { Cross } from 'lucide-react'
function ScriptureCard({ reference, text }) { return <figure className="scripture-card"><div className="scripture-card__mark" aria-hidden="true"><Cross size={14} strokeWidth={1.8} /></div><blockquote>{text}</blockquote><figcaption dir="auto">{reference}</figcaption></figure> }
export default ScriptureCard
