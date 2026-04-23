// Thin wrappers around lucide icons -> React components, exposed globally.
const { createElement: h } = React;

function makeIcon(name) {
  return function Icon({ size = 20, className = '', strokeWidth = 2, ...rest }) {
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (!ref.current) return;
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      ref.current.appendChild(el);
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons({
          attrs: { 'stroke-width': strokeWidth, width: size, height: size },
          nameAttr: 'data-lucide',
          // scoped
          icons: window.lucide.icons,
        });
      }
    }, [name, size, strokeWidth]);
    return h('span', {
      ref,
      className: 'inline-flex items-center justify-center ' + className,
      style: { width: size, height: size, lineHeight: 0 },
      ...rest,
    });
  };
}

const Icons = {
  AlertTriangle: makeIcon('alert-triangle'),
  Megaphone:     makeIcon('megaphone'),
  MapPin:        makeIcon('map-pin'),
  Camera:        makeIcon('camera'),
  Locate:        makeIcon('locate-fixed'),
  X:             makeIcon('x'),
  ChevronDown:   makeIcon('chevron-down'),
  ChevronRight:  makeIcon('chevron-right'),
  List:          makeIcon('list'),
  Check:         makeIcon('check'),
  CheckCircle2:  makeIcon('check-circle-2'),
  Plus:          makeIcon('plus'),
  Snowflake:     makeIcon('snowflake'),
  Construction:  makeIcon('construction'),
  Signpost:      makeIcon('signpost'),
  Droplets:      makeIcon('droplets'),
  Trash2:        makeIcon('trash-2'),
  LightbulbOff:  makeIcon('lightbulb-off'),
  Search:        makeIcon('search'),
  Navigation:    makeIcon('navigation-2'),
  Bell:          makeIcon('bell'),
  Radio:         makeIcon('radio'),
  Clock:         makeIcon('clock'),
  ImagePlus:     makeIcon('image-plus'),
  Send:          makeIcon('send-horizontal'),
  Layers:        makeIcon('layers'),
  Menu:          makeIcon('menu'),
  User:          makeIcon('user'),
  Shield:        makeIcon('shield-check'),
  Route:         makeIcon('route'),
  Loader:        makeIcon('loader'),
  ArrowUpRight:  makeIcon('arrow-up-right'),
  Sparkles:      makeIcon('sparkles'),
};

window.Icons = Icons;
