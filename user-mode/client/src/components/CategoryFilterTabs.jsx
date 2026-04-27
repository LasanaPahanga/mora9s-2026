/**
 * Horizontal category filter: scrolls on narrow viewports so tabs never clip off-screen.
 */
function CategoryFilterTabs({ value, onChange, items, ariaLabel = "Category filter" }) {
  return (
    <div className="mb-5 sm:mb-6 w-full min-w-0" role="tablist" aria-label={ariaLabel}>
      <div
        className="flex flex-nowrap gap-1.5 sm:gap-2 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600"
        style={{ WebkitOverflowScrolling: "touch" }}
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
                "inline-flex shrink-0 snap-start items-center gap-1 sm:gap-2",
                "rounded-lg font-medium text-xs sm:text-sm",
                "px-2.5 py-1.5 sm:px-3.5 sm:py-2",
                "transition-all",
                active
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white",
              ].join(" ")}
            >
              <span className="text-sm sm:text-lg leading-none flex-shrink-0" aria-hidden>
                {icon}
              </span>
              <span className="whitespace-nowrap">{label}</span>
              <span className="text-[10px] sm:text-xs bg-black/25 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full tabular-nums flex-shrink-0">
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
