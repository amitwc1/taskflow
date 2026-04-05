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
        className={`inline-flex items-center max-w-full h-5 min-w-10 rounded-full px-2 leading-5 text-[10px] text-white font-medium overflow-hidden text-ellipsis whitespace-nowrap ${className}`}
        style={{ background: color }}
        title={name}
        onClick={onClick}
      >
        {name}
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
