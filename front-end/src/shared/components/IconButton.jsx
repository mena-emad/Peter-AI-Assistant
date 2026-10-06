function IconButton({ label, icon: Icon, className = '', ...props }) {
  return <button className={`icon-button ${className}`.trim()} aria-label={label} title={label} {...props}><Icon size={18} strokeWidth={2} aria-hidden="true" /></button>
}
export default IconButton
