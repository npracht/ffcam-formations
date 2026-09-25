"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoTooltipProps = {
  /** Texte de l'info-bulle. */
  text: string;
  /** Nom accessible du bouton. */
  label?: string;
  className?: string;
};

/**
 * Icône « i » qui affiche une info-bulle au survol, au focus clavier et au toucher.
 */
export function InfoTooltip({ text, label = "Plus d'informations", className }: InfoTooltipProps) {
  const tooltipId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={tooltipId}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        onKeyDown={e => e.key === "Escape" && setVisible(false)}
        className="rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Info aria-hidden="true" className="h-4 w-4" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "absolute right-0 top-full z-30 mt-2 w-64 rounded-md bg-gray-900 px-3 py-2 text-xs leading-snug text-white shadow-lg",
          visible ? "block" : "sr-only"
        )}
      >
        {text}
      </span>
    </span>
  );
}
