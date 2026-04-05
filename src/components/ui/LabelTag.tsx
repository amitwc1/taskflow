"use client";

interface LabelTagProps {
  color: string;
  name?: string;
  /** compact = small pill (card face), full = wider pill with text (modal) */
  variant?: "compact" | "full";
  onClick?: () => void;
  className?: string;
}

export default function LabelTag({ color, name, variant = "compact", onClick, className = "" }: LabelTagProps) {
  if (variant === "compact") {
    return (
      <span
        className={`inline-block max-w-full h-1.5 min-w-10 rounded-full cursor-default transition-all hover:h-5 hover:px-2 hover:leading-5 hover:text-[10px] hover:text-white hover:font-medium overflow-hidden text-ellipsis whitespace-nowrap group ${className}`}
        style={{ background: color }}
        title={name}
        onClick={onClick}
      >
        <span className="hidden group-hover:inline truncate">{name}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs text-white font-medium cursor-default ${className}`}
      style={{ background: color }}
      onClick={onClick}
    >
      {name || "\u00A0"}
    </span>
  );
}
