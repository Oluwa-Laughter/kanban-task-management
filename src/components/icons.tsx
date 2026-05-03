import Image from "next/image";

type IconProps = {
  name: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

const SIZES: Record<string, [number, number]> = {
  "icon-board": [16, 16],
  "icon-add-task-mobile": [12, 12],
  "icon-check": [10, 8],
  "icon-chevron-down": [10, 7],
  "icon-chevron-up": [10, 7],
  "icon-cross": [15, 15],
  "icon-dark-theme": [19, 19],
  "icon-light-theme": [19, 19],
  "icon-hide-sidebar": [18, 16],
  "icon-show-sidebar": [16, 11],
  "icon-vertical-ellipsis": [5, 20],
};

export function Icon({ name, alt = "", width, height, className }: IconProps) {
  const [w, h] = SIZES[name] ?? [16, 16];
  return (
    <Image
      src={`/assets/${name}.svg`}
      alt={alt}
      width={width ?? w}
      height={height ?? h}
      className={className}
    />
  );
}
