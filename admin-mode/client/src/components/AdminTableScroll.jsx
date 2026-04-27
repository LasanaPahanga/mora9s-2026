/**
 * Horizontal scroll for wide data tables on mobile (Action columns stay reachable).
 */
function AdminTableScroll({ children, className = "" }) {
  return (
    <div
      className={[
        "w-full min-w-0 max-w-full touch-pan-x overflow-x-auto overflow-y-visible",
        "-mx-1 px-1 [scrollbar-width:thin] sm:mx-0 sm:px-0",
        "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600",
        className,
      ].join(" ")}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}

export default AdminTableScroll;
