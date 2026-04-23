// TopBar.jsx — compact right-side stack of floating controls.

function TopBar({ onOpenReports, onLocate, onLayers, locating, badge = 0 }) {
  return (
    <div className="absolute right-3 z-30 flex flex-col gap-2" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 108px)' }}>
      <IconBtn onClick={onOpenReports} aria-label="My reports" badge={badge > 0 ? badge : null}>
        <Icons.List size={20} />
      </IconBtn>
      <IconBtn onClick={onLocate} aria-label="Center on my location" active={locating}>
        {locating
          ? <Icons.Loader size={20} className="animate-spin" />
          : <Icons.Navigation size={20} />}
      </IconBtn>
      <IconBtn onClick={onLayers} aria-label="Map layers">
        <Icons.Layers size={20} />
      </IconBtn>
    </div>
  );
}

function IconBtn({ children, badge, active, ...rest }) {
  return (
    <button
      {...rest}
      className={`relative h-11 w-11 rounded-full grid place-items-center
                  bg-white/85 backdrop-blur-xl ring-1 ring-black/5 shadow-soft
                  text-ink-800 transition-all hover:bg-white active:scale-95
                  ${active ? 'text-brand-500' : ''}`}
    >
      {children}
      {badge ? (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold grid place-items-center ring-2 ring-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

window.TopBar = TopBar;
