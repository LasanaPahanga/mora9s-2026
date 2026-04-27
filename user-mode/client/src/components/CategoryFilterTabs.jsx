/**
 * Category filter: Men's / Women's. Two equal columns on all breakpoints (no "All" tab).
 * If more than two items are ever passed, falls back to a horizontal scroll row.
 */
function CategoryFilterTabs({ value, onChange, items, ariaLabel = "Category filter" }) {
  const twoUp = items.length === 2;

  return (
    <div className="mb-5 w-full min-w-0 sm:mb-6" role="tablist" aria-label={ariaLabel}>
      <div
        className={
          twoUp
            ? "grid w-full grid-cols-2 gap-2"
            : "flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1 snap-x snap-mandatory [scrollbar-width:thin] sm:mx-0 sm:gap-2 sm:px-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600"
        }
        style={twoUp ? undefined : { WebkitOverflowScrolling: "touch" }}
      >
        {items.map(({ key, label, icon, count }) => {
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(key)}
              title={label}
              className={[
                "inline-flex items-center justify-center gap-1.5 sm:gap-2",
                "min-w-0 rounded-lg font-medium text-xs sm:text-sm",
                "px-2 py-2 sm:px-3.5 sm:py-2.5",
                "transition-all",
                twoUp ? "w-full" : "inline-flex shrink-0 snap-start",
                active
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white",
              ].join(" ")}
            >
              <span className="text-sm leading-none sm:text-lg" aria-hidden>
                {icon}
              </span>
              <span className="truncate">{label}</span>
              <span className="shrink-0 text-[10px] tabular-nums sm:text-xs bg-black/25 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilterTabs;
