interface SvgIconProps {
  name: string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
}

export function SvgIcon({ name, width = 24, height = 24, color, className }: SvgIconProps) {
  const symbolId = `#icon-${name}`;

  return (
    <svg className={className} width={width} height={height} aria-hidden="true">
      <use href={symbolId} fill={color} />
    </svg>
  );
}

export default SvgIcon;
