export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const base = 'btn';
  const v =
    variant === 'primary' ? 'btn-primary'
    : variant === 'danger' ? 'btn-danger'
    : variant === 'ghost' ? 'btn-ghost'
    : '';
  const s = size === 'sm' ? 'btn-sm' : '';
  return (
    <button className={`${base} ${v} ${s} ${className}`} {...rest}>
      {children}
    </button>
  );
}
