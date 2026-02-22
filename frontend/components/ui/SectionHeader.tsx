interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export default function SectionHeader({
  badge,
  title,
  subtitle,
  className = "",
  titleClassName = "text-4xl md:text-5xl font-bold text-gray-900 mb-4",
  subtitleClassName = "text-lg text-gray-600 max-w-2xl mx-auto",
}: SectionHeaderProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      {badge && (
        <span className="inline-block uppercase text-sm font-semibold text-emerald-700 tracking-wide mb-3">
          {badge}
        </span>
      )}
      <h2
        className={titleClassName}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
    </div>
  );
}
