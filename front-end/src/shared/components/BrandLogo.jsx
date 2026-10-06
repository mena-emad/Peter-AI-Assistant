function BrandLogo({ compact = false }) {
  return <div className={`brand-logo ${compact ? 'brand-logo--compact' : ''}`} aria-label="رفيق الكتاب المقدس">
    <span className="brand-logo__mark" aria-hidden="true"><i className="brand-logo__vertical" /><i className="brand-logo__horizontal" /></span>
    {!compact && <span className="brand-logo__copy"><strong>بطرس</strong><small>رفيق الكتاب المقدس</small></span>}
  </div>
}
export default BrandLogo
