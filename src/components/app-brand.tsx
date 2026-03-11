type AppBrandProps = {
  className?: string
  iconClassName?: string
  textClassName?: string
}

export default function AppBrand({
  className = '',
  iconClassName = 'w-6 h-6',
  textClassName = 'text-2xl font-bold text-[#5BC5A7]',
}: AppBrandProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/logo/divideai-icon.png" alt="DivideAI" className={`${iconClassName} object-contain`} />
      <span className={textClassName}>DivideAI</span>
    </div>
  )
}
