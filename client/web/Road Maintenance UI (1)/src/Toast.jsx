// Toast.jsx — lightweight success/info toast.

function Toast({ toast, onDone }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;
  return (
    <div className="fixed inset-x-0 z-50 flex justify-center pointer-events-none"
         style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)' }}>
      <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-full
                      bg-ink-900/92 backdrop-blur-md text-white shadow-lift
                      animate-[slideUp_260ms_cubic-bezier(.2,.8,.2,1)_both]">
        <span className="h-7 w-7 rounded-full bg-signal-green/20 text-signal-green grid place-items-center">
          <Icons.CheckCircle2 size={16} />
        </span>
        <div className="text-[13.5px] font-semibold">{toast}</div>
      </div>
    </div>
  );
}

window.Toast = Toast;
