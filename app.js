// =========================================================
// YAPCITY - SISTEMA DE SEGURIDAD Y CONTROL DE ROLES
// Roles: 'cliente' | 'proveedor' | 'admin'
// =========================================================

const SUPABASE_URL = 'https://rvowmjsxuqjbflybkfpq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LcNkCL02cQqE5em5kp6fjA_fe5VoSBW';

// Inicializar cliente Supabase seguro
let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn('Supabase init warning:', err);
  }
}

// 🛡️ Sanitización de entradas (Prevención XSS)
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Cuentas de demostración para probar cada rol
const DEMO_USERS = {
  cliente: {
    id: 'usr-cliente-01',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@yapcity.bo',
    role: 'cliente',
    location: 'Santa Cruz, Bolivia',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '+591 71234567'
  },
  proveedor: {
    id: 'usr-prov-01',
    name: 'Ana López',
    email: 'ana.lopez@yapcity.bo',
    role: 'proveedor',
    location: 'Santa Cruz, Bolivia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '+591 78945612',
    verified: true,
    specialty: 'Diseño Gráfico & Identidad'
  },
  admin: {
    id: 'usr-admin-01',
    name: 'Alejandro Ramos',
    email: 'admin@yapcity.bo',
    role: 'admin',
    location: 'Bolivia',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    phone: '+591 79998877'
  }
};

// 📦 Almacenamiento Seguro con Fallback (Evita caídas en modo incógnito o sandboxes)
const SafeStorage = {
  _mem: {},
  get(key, fallback = null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      }
    } catch (e) {}
    return this._mem[key] !== undefined ? this._mem[key] : fallback;
  },
  set(key, val) {
    this._mem[key] = val;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(val));
      }
    } catch (e) {}
  },
  remove(key) {
    delete this._mem[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  }
};

// Estado reactivo global
const AppState = {
  currentView: 'home',
  currentUser: SafeStorage.get('yapcity_user', null),
  selectedItem: null,
  exploreTab: 'trabajos',
  exploreFilter: {
    query: '',
    category: '',
    location: '',
    status: ''
  },
  favorites: SafeStorage.get('yapcity_favs', ['item-1', 'item-4']),
  adminTab: 'publicaciones',
  
  // Lista de usuarios registrados (para panel de administración)
  users: [
    {
      id: 'usr-cliente-01',
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@yapcity.bo',
      role: 'cliente',
      location: 'Santa Cruz',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      joined: '12 Ene 2025'
    },
    {
      id: 'usr-prov-01',
      name: 'Ana López',
      email: 'ana.lopez@yapcity.bo',
      role: 'proveedor',
      location: 'Santa Cruz',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      joined: '18 Feb 2025'
    },
    {
      id: 'usr-prov-02',
      name: 'Roberto Gómez',
      email: 'roberto.gomez@yapcity.bo',
      role: 'proveedor',
      location: 'La Paz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      joined: '05 Mar 2025'
    },
    {
      id: 'usr-cliente-02',
      name: 'Laura Morales',
      email: 'laura.morales@yapcity.bo',
      role: 'cliente',
      location: 'Cochabamba',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      joined: '22 Mar 2025'
    },
    {
      id: 'usr-admin-01',
      name: 'Alejandro Ramos',
      email: 'admin@yapcity.bo',
      role: 'admin',
      location: 'Bolivia',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      joined: '01 Ene 2025'
    }
  ],

  items: [
    {
      id: 'item-1',
      type: 'trabajo',
      title: 'Diseño de logotipo profesional',
      description: 'Ofrezco diseño de logotipos personalizados para tu marca o negocio. Ideas creativas, modernas y con identidad de marca única.\n\nIncluye:\n- 3 propuestas iniciales\n- Archivos vectoriales (AI, SVG, PNG)\n- Manual básico de marca',
      category: 'Diseño gráfico',
      location: 'Santa Cruz',
      price: 250,
      currency: 'Bs',
      status: 'Disponible',
      date: '15 may. 2025',
      author: {
        id: 'usr-prov-01',
        name: 'Ana López',
        verified: true,
        rating: 4.8,
        reviewsCount: 12,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        phone: '+591 71234567'
      },
      images: [
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'item-2',
      type: 'trabajo',
      title: 'Fabricación de roperos empotrados a medida',
      description: 'Trabajos de carpintería fina con melamina y madera sólida. Presupuestos a domicilio sin compromiso en La Paz y El Alto.',
      category: 'Carpintería',
      location: 'La Paz',
      price: 1800,
      currency: 'Bs',
      status: 'Disponible',
      date: '14 may. 2025',
      author: {
        id: 'usr-prov-02',
        name: 'Roberto Gómez',
        verified: true,
        rating: 4.9,
        reviewsCount: 28,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phone: '+591 76543210'
      },
      images: [
        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'item-3',
      type: 'trabajo',
      title: 'Edición de video para TikTok & Reels',
      description: 'Edición dinámica con subtítulos animados, efectos de sonido y música en tendencia para potenciar tus ventas y marca personal.',
      category: 'Edición de video',
      location: 'Cochabamba',
      price: 80,
      currency: 'Bs',
      status: 'En proceso',
      date: '12 may. 2025',
      author: {
        id: 'usr-prov-03',
        name: 'Carlos Mendoza',
        verified: false,
        rating: 4.5,
        reviewsCount: 7,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        phone: '+591 78945612'
      },
      images: [
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'item-4',
      type: 'trabajo',
      title: 'Pintura y empastado de interiores',
      description: 'Servicio garantizado de pintura para departamentos, oficinas y casas. Trabajo limpio, rápido y con materiales de primera calidad.',
      category: 'Pintura de interiores',
      location: 'Santa Cruz',
      price: 650,
      currency: 'Bs',
      status: 'Disponible',
      date: '10 may. 2025',
      author: {
        id: 'usr-prov-04',
        name: 'Javier Torrico',
        verified: true,
        rating: 5.0,
        reviewsCount: 19,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        phone: '+591 73322110'
      },
      images: [
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'item-5',
      type: 'servicio',
      title: 'Mantenimiento e Instalaciones Eléctricas',
      description: 'Instalación de iluminación LED, tableros eléctricos, tomas de corriente y detección de fugas eléctricas en toda la ciudad.',
      category: 'Construcción',
      location: 'Santa Cruz',
      price: 150,
      currency: 'Bs',
      status: 'Disponible',
      date: '08 may. 2025',
      author: {
        id: 'usr-prov-05',
        name: 'Marcos Vaca',
        verified: true,
        rating: 4.7,
        reviewsCount: 31,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        phone: '+591 74455667'
      },
      images: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'item-6',
      type: 'servicio',
      title: 'Clases Particulares de Matemáticas & Física',
      description: 'Nivel escolar, preuniversitario y universitario. Resolución práctica de ejercicios y preparación intensiva para exámenes.',
      category: 'Clases particulares',
      location: 'La Paz',
      price: 50,
      currency: 'Bs',
      status: 'Disponible',
      date: '05 may. 2025',
      author: {
        id: 'usr-prov-06',
        name: 'Prof. Claudia Vargas',
        verified: true,
        rating: 4.9,
        reviewsCount: 15,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        phone: '+591 75566778'
      },
      images: [
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  ]
};

// Badges visuales según el rol
function getRoleBadge(role) {
  if (role === 'admin') {
    return `<span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
      <span>🛡️</span><span>ADMIN</span>
    </span>`;
  }
  if (role === 'proveedor') {
    return `<span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-violet-50 text-violet-700 border border-violet-200">
      <span>🛠️</span><span>PROVEEDOR</span>
    </span>`;
  }
  return `<span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
    <span>👤</span><span>CLIENTE</span>
  </span>`;
}

function getRoleBadgeText(role) {
  if (role === 'admin') return 'Administrador';
  if (role === 'proveedor') return 'Proveedor Profesional';
  return 'Cliente';
}

// 🔔 Sistema de Notificaciones Toast
function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                  'bg-indigo-50 border-indigo-200 text-indigo-800';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  toast.className = `p-4 rounded-2xl border shadow-lg flex items-start space-x-3 transition-all duration-300 transform translate-y-2 ${bgClass}`;
  toast.innerHTML = `
    <span class="text-xl flex-shrink-0">${icon}</span>
    <div class="flex-1">
      <h4 class="font-bold text-xs uppercase tracking-wide">${escapeHTML(title)}</h4>
      <p class="text-xs mt-0.5 opacity-90">${escapeHTML(message)}</p>
    </div>
    <button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100 text-sm font-bold">&times;</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('translate-y-2'));

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 🛡️ CONTROL DE ACCESO Y SEGURIDAD POR ROL (ROUTE GUARDS)
function navigateTo(viewName, param = null) {
  // 1. Guardia de Vistas Protegidas (Requieren Sesión Activa)
  if (['profile', 'post-job', 'post-service'].includes(viewName) && !AppState.currentUser) {
    showToast('Acceso Requerido', 'Inicia sesión para acceder a tu perfil o realizar publicaciones', 'info');
    navigateTo('login');
    return;
  }

  // 2. Guardia de Administración (Exclusivo para rol 'admin')
  if (viewName === 'admin') {
    if (!AppState.currentUser || AppState.currentUser.role !== 'admin') {
      showToast('Acceso Restringido', 'El panel de administración requiere permisos de Administrador', 'error');
      openAdminAccessModal();
      return;
    }
  }

  // 3. Guardia para Publicar Servicio (Recomendado o Exclusivo para Proveedores)
  if (viewName === 'post-service') {
    if (AppState.currentUser && AppState.currentUser.role === 'cliente') {
      openRoleUpgradeModal();
      return;
    }
  }

  AppState.currentView = viewName;
  if (param) {
    if (viewName === 'detail') {
      AppState.selectedItem = AppState.items.find(i => i.id === param) || AppState.items[0];
    } else if (viewName === 'explore') {
      AppState.exploreTab = param;
    }
  }
  
  document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
  
  const activeView = document.getElementById('view-' + viewName);
  if (activeView) {
    activeView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (viewName === 'home') renderHomeFeatured();
  if (viewName === 'explore') renderExploreView();
  if (viewName === 'detail') renderDetailView();
  if (viewName === 'profile') renderProfileView();
  if (viewName === 'admin') renderAdminView();
}

function toggleFavorite(itemId, event) {
  if (event) event.stopPropagation();
  const idx = AppState.favorites.indexOf(itemId);
  if (idx > -1) {
    AppState.favorites.splice(idx, 1);
    showToast('Favoritos', 'Publicación eliminada de tus favoritos', 'info');
  } else {
    AppState.favorites.push(itemId);
    showToast('Favoritos', 'Publicación guardada en tus favoritos (❤️)', 'success');
  }
    SafeStorage.set('yapcity_favs', AppState.favorites);

  if (AppState.currentView === 'explore') renderExploreView();
  if (AppState.currentView === 'home') renderHomeFeatured();
  if (AppState.currentView === 'profile') renderProfileView();
  if (AppState.currentView === 'detail') renderDetailView();
}

// 1. Render Inicio
function renderHomeFeatured() {
  const container = document.getElementById('home-featured-grid');
  if (!container) return;

  const featured = AppState.items.slice(0, 4);
  container.innerHTML = featured.map(item => `
    <div onclick="navigateTo('detail', '${item.id}')" class="group cursor-pointer bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-indigo-300 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img src="${item.images[0]}" alt="${escapeHTML(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute top-3 right-3">
          <button onclick="toggleFavorite('${item.id}', event)" class="p-2.5 rounded-full bg-white/90 backdrop-blur text-slate-400 hover:text-rose-500 shadow-md transition-all">
            <svg class="w-4 h-4 ${AppState.favorites.includes(item.id) ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span class="text-xs font-bold tracking-wide uppercase text-indigo-600">${escapeHTML(item.category)}</span>
          <h3 class="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 mt-1">${escapeHTML(item.title)}</h3>
          <div class="flex items-center text-xs text-slate-500 mt-1 space-x-1">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${escapeHTML(item.location)}</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-slate-100">
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.status === 'Disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
            ● ${item.status}
          </span>
          <span class="text-base font-black text-slate-900">Bs ${item.price}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 4. Render Explorador
function renderExploreView() {
  const container = document.getElementById('explore-results-grid');
  if (!container) return;

  const filtered = AppState.items.filter(item => {
    const matchesType = (AppState.exploreTab === 'trabajos' && item.type === 'trabajo') ||
                        (AppState.exploreTab === 'servicios' && item.type === 'servicio');
    const matchesQuery = !AppState.exploreFilter.query || 
      item.title.toLowerCase().includes(AppState.exploreFilter.query.toLowerCase()) ||
      item.description.toLowerCase().includes(AppState.exploreFilter.query.toLowerCase());
    const matchesCat = !AppState.exploreFilter.category || item.category === AppState.exploreFilter.category;
    const matchesLoc = !AppState.exploreFilter.location || item.location === AppState.exploreFilter.location;
    const matchesStat = !AppState.exploreFilter.status || item.status === AppState.exploreFilter.status;

    return matchesType && matchesQuery && matchesCat && matchesLoc && matchesStat;
  });

  const tabTrabajos = document.getElementById('tab-trabajos');
  const tabServicios = document.getElementById('tab-servicios');

  if (tabTrabajos && tabServicios) {
    if (AppState.exploreTab === 'trabajos') {
      tabTrabajos.className = 'px-6 py-2.5 font-bold text-sm rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 transition-all';
      tabServicios.className = 'px-6 py-2.5 font-bold text-sm rounded-xl text-slate-600 hover:text-slate-900 transition-colors';
    } else {
      tabServicios.className = 'px-6 py-2.5 font-bold text-sm rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20 transition-all';
      tabTrabajos.className = 'px-6 py-2.5 font-bold text-sm rounded-xl text-slate-600 hover:text-slate-900 transition-colors';
    }
  }

  const countEl = document.getElementById('explore-count');
  if (countEl) countEl.textContent = `${filtered.length} publicaciones encontradas`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="text-base font-bold text-slate-700">No se encontraron publicaciones</h3>
        <p class="text-xs text-slate-500 mt-1">Prueba con otros términos de búsqueda o elimina los filtros aplicados.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div onclick="navigateTo('detail', '${item.id}')" class="group cursor-pointer bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-indigo-300 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img src="${item.images[0]}" alt="${escapeHTML(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute top-3 right-3">
          <button onclick="toggleFavorite('${item.id}', event)" class="p-2.5 rounded-full bg-white/90 backdrop-blur text-slate-400 hover:text-rose-500 shadow-md transition-all">
            <svg class="w-4 h-4 ${AppState.favorites.includes(item.id) ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span class="text-xs font-bold tracking-wide uppercase text-indigo-600">${escapeHTML(item.category)}</span>
          <h3 class="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 mt-1">${escapeHTML(item.title)}</h3>
          <div class="flex items-center text-xs text-slate-500 mt-1 space-x-1">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${escapeHTML(item.location)}</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-slate-100">
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.status === 'Disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
            ● ${item.status}
          </span>
          <span class="text-base font-black text-slate-900">Bs ${item.price}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 7. Render Detalle
function renderDetailView() {
  const container = document.getElementById('detail-container');
  if (!container || !AppState.selectedItem) return;

  const item = AppState.selectedItem;
  const isFav = AppState.favorites.includes(item.id);

  container.innerHTML = `
    <div class="space-y-6">
      <button onclick="navigateTo('explore')" class="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
        <span>&larr; Volver al explorador</span>
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            <div class="relative h-96 w-full bg-slate-100">
              <img id="detail-main-img" src="${item.images[0]}" class="w-full h-full object-cover">
            </div>
            ${item.images.length > 1 ? `
              <div class="p-4 flex space-x-3 overflow-x-auto bg-slate-50 border-t border-slate-100">
                ${item.images.map(img => `
                  <button onclick="document.getElementById('detail-main-img').src = '${img}'" class="h-20 w-24 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-indigo-500 transition-colors flex-shrink-0 shadow-sm">
                    <img src="${img}" class="w-full h-full object-cover">
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center space-x-3">
              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                ${escapeHTML(item.category)}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Disponible' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                ● ${item.status}
              </span>
            </div>

            <h1 class="text-3xl font-black text-slate-900">${escapeHTML(item.title)}</h1>

            <div class="flex items-center space-x-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
              <span>📍 ${escapeHTML(item.location)}, Bolivia</span>
              <span>&bull;</span>
              <span>Publicado: ${item.date}</span>
            </div>

            <div>
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Descripción detallada</h3>
              <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">${escapeHTML(item.description)}</p>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span class="text-xs text-slate-400 font-bold uppercase">Precio de referencia</span>
              <div class="text-3xl font-black text-slate-900 mt-1">
                Bs ${item.price}
                <span class="text-xs font-medium text-slate-500 font-normal">/ trabajo</span>
              </div>
            </div>

            <div class="space-y-3">
              <button onclick="openContactModal('${escapeHTML(item.author.name)}', '${escapeHTML(item.author.phone)}', '${escapeHTML(item.title)}')" class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2">
                <span>💬 Contactar por WhatsApp</span>
              </button>

              <button onclick="toggleFavorite('${item.id}', event)" class="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center justify-center space-x-2">
                <span>${isFav ? '❤️ Quitar de favoritos' : '🤍 Guardar en favoritos'}</span>
              </button>
            </div>

            <div class="pt-6 border-t border-slate-100">
              <span class="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-3">Información del autor</span>
              <div class="flex items-center space-x-3">
                <img src="${item.author.avatar}" class="w-12 h-12 rounded-2xl object-cover">
                <div>
                  <div class="flex items-center space-x-1.5">
                    <h4 class="text-sm font-bold text-slate-900">${escapeHTML(item.author.name)}</h4>
                    ${item.author.verified ? '<span class="text-indigo-600 text-xs font-bold" title="Verificado">✓</span>' : ''}
                  </div>
                  <div class="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    <span>⭐ ${item.author.rating || '5.0'}</span>
                    <span>&bull;</span>
                    <span>${item.author.reviewsCount || 1} opiniones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render permisos según el rol
function renderRolePermissions(role) {
  if (role === 'admin') {
    return `
      <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
        <p class="font-bold text-rose-800 flex items-center space-x-1.5">
          <span>🛡️ Permisos de Administrador General:</span>
        </p>
        <ul class="space-y-1 text-slate-600">
          <li>✅ Control total sobre la plataforma y políticas RLS</li>
          <li>✅ Moderar y eliminar cualquier publicación o servicio</li>
          <li>✅ Gestionar roles de usuarios (promover a Proveedor o Admin)</li>
          <li>✅ Acceso a métricas operativas del sistema</li>
        </ul>
      </div>
    `;
  }
  if (role === 'proveedor') {
    return `
      <div class="p-4 rounded-2xl bg-violet-50 border border-violet-200 text-xs space-y-2">
        <p class="font-bold text-violet-800 flex items-center space-x-1.5">
          <span>🛠️ Permisos de Proveedor Profesional:</span>
        </p>
        <ul class="space-y-1 text-slate-600">
          <li>✅ Publicar catálogo de servicios profesionales con precios en Bs</li>
          <li>✅ Publicar ofertas y solicitudes de trabajo</li>
          <li>✅ Insignia oficial de Proveedor Verificado</li>
          <li>✅ Enlace directo de WhatsApp para recibir contactos de clientes</li>
          <li>🔒 Panel de Administración general (Exclusivo Admin)</li>
        </ul>
      </div>
    `;
  }
  return `
    <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
      <p class="font-bold text-emerald-800 flex items-center space-x-1.5">
        <span>👤 Permisos de Cliente / Contratante:</span>
      </p>
      <ul class="space-y-1 text-slate-600">
        <li>✅ Explorar y buscar trabajos y servicios en Bolivia</li>
        <li>✅ Contactar directamente a proveedores vía WhatsApp</li>
        <li>✅ Guardar favoritos personales (❤️)</li>
        <li>✅ Publicar solicitudes de trabajo requeridas</li>
        <li>🔒 Ofrecer servicios profesionales en el catálogo (Requiere activar rol Proveedor)</li>
      </ul>
    </div>
  `;
}

// 8. Render Mi Perfil
function renderProfileView() {
  const user = AppState.currentUser;
  if (!user) {
    navigateTo('login');
    return;
  }

  const nameEl = document.getElementById('profile-name');
  const roleEl = document.getElementById('profile-role');
  const detailsEl = document.getElementById('profile-details');
  const avatarEl = document.getElementById('profile-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.innerHTML = getRoleBadge(user.role);
  if (detailsEl) detailsEl.textContent = `${user.email} • 📍 ${user.location || 'Bolivia'}`;
  if (avatarEl) avatarEl.src = user.avatar;

  // Insertar resumen de permisos en perfil
  const permissionsContainer = document.getElementById('profile-role-permissions');
  if (permissionsContainer) {
    permissionsContainer.innerHTML = renderRolePermissions(user.role);
  }

  // Renderizar publicaciones del usuario
  const container = document.getElementById('profile-items-container');
  if (container) {
    const myPosts = AppState.items.filter(i => (i.author && i.author.id === user.id) || (i.author && i.author.name === user.name));
    if (myPosts.length === 0) {
      container.innerHTML = `
        <div class="p-6 rounded-2xl bg-white border border-slate-200 text-center">
          <p class="text-xs text-slate-400">Aún no has creado publicaciones.</p>
          <button onclick="navigateTo('post-job')" class="mt-2 text-xs font-bold text-indigo-600 hover:underline">+ Crear mi primera publicación</button>
        </div>
      `;
    } else {
      container.innerHTML = myPosts.map(item => `
        <div class="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-sm transition-all">
          <div class="flex items-center space-x-4">
            <img src="${item.images[0]}" class="w-14 h-14 rounded-xl object-cover">
            <div>
              <h4 class="font-bold text-slate-800 text-sm">${escapeHTML(item.title)}</h4>
              <div class="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                <span class="text-emerald-600 font-semibold">● ${item.status}</span>
                <span>&bull;</span>
                <span class="font-bold text-slate-700">Bs ${item.price}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="navigateTo('detail', '${item.id}')" class="px-3.5 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200">Ver</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Renderizar favoritos
  const favContainer = document.getElementById('profile-favorites-container');
  if (favContainer) {
    const myFavorites = AppState.items.filter(i => AppState.favorites.includes(i.id));
    if (myFavorites.length === 0) {
      favContainer.innerHTML = '<p class="text-xs text-slate-400 py-4">Aún no tienes favoritos guardados.</p>';
    } else {
      favContainer.innerHTML = myFavorites.map(item => `
        <div onclick="navigateTo('detail', '${item.id}')" class="cursor-pointer flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 shadow-sm">
          <div class="flex items-center space-x-3">
            <img src="${item.images[0]}" class="w-11 h-11 rounded-xl object-cover">
            <div>
              <p class="text-xs font-bold text-slate-800 truncate max-w-[180px]">${escapeHTML(item.title)}</p>
              <p class="text-[11px] font-bold text-indigo-600">Bs ${item.price}</p>
            </div>
          </div>
          <button onclick="toggleFavorite('${item.id}', event)" class="text-rose-500 hover:text-rose-600 p-1">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
      `).join('');
    }
  }
}

// 9. Render Panel de Administración
function switchAdminTab(tabName) {
  AppState.adminTab = tabName;
  const btnPosts = document.getElementById('admin-tab-btn-posts');
  const btnUsers = document.getElementById('admin-tab-btn-users');
  const secPosts = document.getElementById('admin-section-posts');
  const secUsers = document.getElementById('admin-section-users');

  if (tabName === 'publicaciones') {
    if (btnPosts) btnPosts.className = 'px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs';
    if (btnUsers) btnUsers.className = 'px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200';
    if (secPosts) secPosts.classList.remove('hidden');
    if (secUsers) secUsers.classList.add('hidden');
  } else {
    if (btnUsers) btnUsers.className = 'px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs';
    if (btnPosts) btnPosts.className = 'px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200';
    if (secUsers) secUsers.classList.remove('hidden');
    if (secPosts) secPosts.classList.add('hidden');
  }
}

function renderAdminView() {
  const statUsers = document.getElementById('admin-stat-users');
  const statPosts = document.getElementById('admin-stat-posts');
  if (statUsers) statUsers.textContent = AppState.users.length;
  if (statPosts) statPosts.textContent = AppState.items.length;

  // 1. Tabla de Publicaciones
  const postsContainer = document.getElementById('admin-table-body');
  if (postsContainer) {
    postsContainer.innerHTML = AppState.items.map(item => `
      <tr class="border-b border-slate-100 hover:bg-indigo-50/40 text-xs transition-colors">
        <td class="py-3.5 px-4 flex items-center space-x-3">
          <img src="${item.images[0]}" class="w-9 h-9 rounded-lg object-cover">
          <div>
            <span class="font-bold text-slate-800 block truncate max-w-xs">${escapeHTML(item.title)}</span>
            <span class="text-[10px] text-slate-400">Por: ${escapeHTML(item.author?.name || 'Usuario')}</span>
          </div>
        </td>
        <td class="py-3.5 px-4">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${item.type === 'trabajo' ? 'bg-indigo-50 text-indigo-700' : 'bg-violet-50 text-violet-700'}">
            ${item.type === 'trabajo' ? '💼 Trabajo' : '🛠️ Servicio'}
          </span>
        </td>
        <td class="py-3.5 px-4 text-slate-500">${escapeHTML(item.location)}</td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${item.status === 'Disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
            ● ${item.status}
          </span>
        </td>
        <td class="py-3.5 px-4 text-right space-x-1.5">
          <button onclick="navigateTo('detail', '${item.id}')" class="px-2 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200">Ver</button>
          <button onclick="toggleItemStatus('${item.id}')" class="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold" title="Alternar Estado">Estado</button>
          <button onclick="deleteAdminItem('${item.id}')" class="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-semibold">Eliminar</button>
        </td>
      </tr>
    `).join('');
  }

  // 2. Tabla de Usuarios y Control de Roles
  const usersContainer = document.getElementById('admin-users-table-body');
  if (usersContainer) {
    usersContainer.innerHTML = AppState.users.map(u => `
      <tr class="border-b border-slate-100 hover:bg-indigo-50/40 text-xs transition-colors">
        <td class="py-3 px-4 flex items-center space-x-3">
          <img src="${u.avatar}" class="w-8 h-8 rounded-full object-cover">
          <div>
            <span class="font-bold text-slate-800 block">${escapeHTML(u.name)}</span>
            <span class="text-[10px] text-slate-400">${escapeHTML(u.email)}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-slate-500">${escapeHTML(u.location || 'Bolivia')}</td>
        <td class="py-3 px-4">
          ${getRoleBadge(u.role)}
        </td>
        <td class="py-3 px-4 text-right">
          <select onchange="changeUserRole('${u.id}', this.value)" class="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-indigo-500">
            <option value="cliente" ${u.role === 'cliente' ? 'selected' : ''}>👤 Cliente</option>
            <option value="proveedor" ${u.role === 'proveedor' ? 'selected' : ''}>🛠️ Proveedor</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>🛡️ Admin</option>
          </select>
        </td>
      </tr>
    `).join('');
  }
}

function deleteAdminItem(id) {
  if (confirm('¿Seguro que deseas eliminar esta publicación? (Acción de moderación de Admin)')) {
    AppState.items = AppState.items.filter(i => i.id !== id);
    renderAdminView();
    renderExploreView();
    renderHomeFeatured();
    showToast('Moderación', 'Publicación eliminada correctamente');
  }
}

function toggleItemStatus(id) {
  const item = AppState.items.find(i => i.id === id);
  if (!item) return;
  item.status = item.status === 'Disponible' ? 'En proceso' : 'Disponible';
  renderAdminView();
  renderExploreView();
  showToast('Estado Actualizado', `Publicación marcada como "${item.status}"`);
}

function changeUserRole(userId, newRole) {
  const user = AppState.users.find(u => u.id === userId);
  if (!user) return;
  user.role = newRole;

  // Si se modificó al usuario conectado actualmente
  if (AppState.currentUser && AppState.currentUser.id === userId) {
    AppState.currentUser.role = newRole;
    SafeStorage.set('yapcity_user', AppState.currentUser);
    updateAuthUI();
  }

  renderAdminView();
  showToast('Rol Actualizado', `El usuario ${user.name} ahora tiene rol: ${getRoleBadgeText(newRole)}`);
}

// 🛡️ MODAL DE ACCESO ADMINISTRADOR
function openAdminAccessModal() {
  const modal = document.getElementById('admin-access-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAdminAccessModal() {
  const modal = document.getElementById('admin-access-modal');
  if (modal) modal.classList.add('hidden');
}

function handleAdminKeySubmit(e) {
  e.preventDefault();
  const input = document.getElementById('admin-key-input');
  const key = input ? input.value.trim() : '';

  if (key === 'admin123' || key === 'yapcity2025') {
    loginAsDemoRole('admin');
    closeAdminAccessModal();
  } else {
    showToast('Clave incorrecta', 'La clave ingresada no es válida para administrador.', 'error');
  }
}

// 🛠️ MODAL DE ACTIVACIÓN ROL PROVEEDOR
function openRoleUpgradeModal() {
  const modal = document.getElementById('role-upgrade-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeRoleUpgradeModal() {
  const modal = document.getElementById('role-upgrade-modal');
  if (modal) modal.classList.add('hidden');
}

function upgradeCurrentUserToProvider() {
  if (!AppState.currentUser) {
    loginAsDemoRole('proveedor');
  } else {
    AppState.currentUser.role = 'proveedor';
    SafeStorage.set('yapcity_user', AppState.currentUser);
    const u = AppState.users.find(x => x.id === AppState.currentUser.id);
    if (u) u.role = 'proveedor';
    updateAuthUI();
  }
  closeRoleUpgradeModal();
  showToast('¡Perfil Actualizado!', 'Tu cuenta ahora es de tipo Proveedor Profesional. ¡Bienvenido!');
  navigateTo('post-service');
}

// Cambio rápido de rol desde perfil para pruebas
function switchCurrentUserRole(newRole) {
  if (!AppState.currentUser) return;
  AppState.currentUser.role = newRole;
  SafeStorage.set('yapcity_user', AppState.currentUser);
  const u = AppState.users.find(x => x.id === AppState.currentUser.id);
  if (u) u.role = newRole;
  updateAuthUI();
  renderProfileView();
  showToast('Rol Cambiado', `Ahora estás navegando como: ${getRoleBadgeText(newRole)}`);
}

// Acceso rápido con rol predefinido (Demo / Pruebas)
function loginAsDemoRole(roleKey) {
  const demoUser = DEMO_USERS[roleKey];
  if (!demoUser) return;

  AppState.currentUser = { ...demoUser };
  SafeStorage.set('yapcity_user', AppState.currentUser);
  
  // Asegurar que existe en la lista de usuarios
  if (!AppState.users.some(u => u.id === demoUser.id)) {
    AppState.users.push({ ...demoUser, joined: 'Hoy' });
  }

  updateAuthUI();
  showToast('Sesión Iniciada', `Has ingresado como ${demoUser.name} (${getRoleBadgeText(demoUser.role)})`);

  if (roleKey === 'admin') {
    navigateTo('admin');
  } else {
    navigateTo('home');
  }
}

// Handlers de Formulario
async function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;
  const btn = document.getElementById('reg-btn');

  if (password.length < 6) {
    showToast('Contraseña corta', 'La contraseña debe tener mínimo 6 caracteres.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Registrando...';

  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: name,
            tipo_usuario: role
          }
        }
      });

      if (error) throw error;
      showToast('¡Registro Exitoso!', 'Tu cuenta ha sido creada en Supabase.');
    } else {
      showToast('¡Registro Exitoso!', 'Bienvenido a Yapcity.');
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name,
      email,
      role,
      location: 'Santa Cruz, Bolivia',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      phone: '+591 70000000'
    };

    AppState.currentUser = newUser;
    AppState.users.push({ ...newUser, joined: 'Hoy' });
    SafeStorage.set('yapcity_user', AppState.currentUser);

    updateAuthUI();
    navigateTo('home');
  } catch (err) {
    showToast('Error al registrarse', err.message || 'No se pudo completar el registro', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Registrarse';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');

  btn.disabled = true;
  btn.textContent = 'Verificando...';

  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const user = data.user;
      AppState.currentUser = {
        id: user.id,
        name: user.user_metadata?.nombre || email.split('@')[0],
        email: user.email,
        role: user.user_metadata?.tipo_usuario || 'cliente',
        location: 'Santa Cruz, Bolivia',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        phone: '+591 78945612'
      };

      showToast('¡Bienvenido!', `Hola de nuevo, ${AppState.currentUser.name}`);
    } else {
      // Coincidencia con usuarios locales si no hay conexión en vivo
      const existingUser = AppState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      AppState.currentUser = existingUser ? { ...existingUser } : {
        id: 'usr-local',
        name: email.split('@')[0],
        email,
        role: 'cliente',
        location: 'Santa Cruz, Bolivia',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        phone: '+591 78945612'
      };
      showToast('Sesión Iniciada', 'Has ingresado correctamente');
    }

    SafeStorage.set('yapcity_user', AppState.currentUser);
    updateAuthUI();
    navigateTo('home');
  } catch (err) {
    showToast('Error de acceso', err.message || 'Correo o contraseña incorrectos', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Iniciar sesión';
  }
}

async function handleLogout() {
  try {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
  } catch (e) {
    console.warn(e);
  }
  AppState.currentUser = null;
  SafeStorage.remove('yapcity_user');
  updateAuthUI();
  showToast('Sesión cerrada', 'Has salido de tu cuenta');
  navigateTo('home');
}

function updateAuthUI() {
  const loggedOutNav = document.getElementById('nav-logged-out');
  const loggedInNav = document.getElementById('nav-logged-in');
  const userAvatar = document.getElementById('nav-user-avatar');
  const userName = document.getElementById('nav-user-name');
  const userBadge = document.getElementById('nav-user-badge');

  if (AppState.currentUser) {
    if (loggedOutNav) loggedOutNav.classList.add('hidden');
    if (loggedInNav) loggedInNav.classList.remove('hidden');
    if (userAvatar) userAvatar.src = AppState.currentUser.avatar;
    if (userName) userName.textContent = AppState.currentUser.name;
    if (userBadge) userBadge.innerHTML = getRoleBadge(AppState.currentUser.role);
  } else {
    if (loggedOutNav) loggedOutNav.classList.remove('hidden');
    if (loggedInNav) loggedInNav.classList.add('hidden');
  }
}

async function handleJobSubmit(e) {
  e.preventDefault();
  if (!AppState.currentUser) {
    showToast('Sesión Requerida', 'Debes iniciar sesión para publicar', 'error');
    navigateTo('login');
    return;
  }

  const title = document.getElementById('job-title').value.trim();
  const description = document.getElementById('job-desc').value.trim();
  const category = document.getElementById('job-category').value;
  const location = document.getElementById('job-location').value;
  const price = parseFloat(document.getElementById('job-price').value) || 0;
  const status = document.getElementById('job-status').value;

  const newItem = {
    id: 'job-' + Date.now(),
    type: 'trabajo',
    title,
    description,
    category,
    location,
    price,
    currency: 'Bs',
    status,
    date: 'Hoy',
    author: {
      id: AppState.currentUser.id,
      name: AppState.currentUser.name,
      avatar: AppState.currentUser.avatar,
      phone: AppState.currentUser.phone || '+591 70000000',
      verified: AppState.currentUser.role === 'proveedor' || AppState.currentUser.role === 'admin',
      rating: 5.0,
      reviewsCount: 1
    },
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
    ]
  };

  try {
    if (supabaseClient) {
      await supabaseClient.from('publicaciones').insert([{
        usuario_id: AppState.currentUser.id,
        titulo: title,
        descripcion: description,
        ubicacion: location,
        precio: price,
        estado: status
      }]);
    }
  } catch (err) {
    console.warn('Supabase DB push info:', err);
  }

  AppState.items.unshift(newItem);
  showToast('¡Trabajo Publicado!', 'Tu solicitud de trabajo ha sido publicada con éxito');
  e.target.reset();
  navigateTo('detail', newItem.id);
}

async function handleServiceSubmit(e) {
  e.preventDefault();
  if (!AppState.currentUser) {
    showToast('Sesión Requerida', 'Debes iniciar sesión para publicar', 'error');
    navigateTo('login');
    return;
  }

  if (AppState.currentUser.role === 'cliente') {
    openRoleUpgradeModal();
    return;
  }

  const title = document.getElementById('srv-title').value.trim();
  const description = document.getElementById('srv-desc').value.trim();
  const category = document.getElementById('srv-category').value;
  const location = document.getElementById('srv-location').value;
  const price = parseFloat(document.getElementById('srv-price').value) || 0;

  const newItem = {
    id: 'srv-' + Date.now(),
    type: 'servicio',
    title,
    description,
    category,
    location,
    price,
    currency: 'Bs',
    status: 'Disponible',
    date: 'Hoy',
    author: {
      id: AppState.currentUser.id,
      name: AppState.currentUser.name,
      avatar: AppState.currentUser.avatar,
      phone: AppState.currentUser.phone || '+591 70000000',
      verified: true,
      rating: 5.0,
      reviewsCount: 1
    },
    images: [
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80'
    ]
  };

  try {
    if (supabaseClient) {
      await supabaseClient.from('servicios').insert([{
        usuario_id: AppState.currentUser.id,
        nombre: title,
        descripcion: description,
        precio_desde: price,
        ubicacion: location,
        disponibilidad: 'Siempre disponible'
      }]);
    }
  } catch (err) {
    console.warn('Supabase DB push info:', err);
  }

  AppState.items.unshift(newItem);
  showToast('¡Servicio Publicado!', 'Tu servicio profesional ya está disponible para contratación');
  e.target.reset();
  navigateTo('detail', newItem.id);
}

function openContactModal(name, phone, title) {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  document.getElementById('modal-contact-name').textContent = name;
  document.getElementById('modal-contact-title').textContent = title;
  
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waMsg = encodeURIComponent('Hola ' + name + ', vi tu publicación "' + title + '" en Yapcity y quisiera más información.');
  document.getElementById('modal-btn-wa').href = 'https://wa.me/' + cleanPhone + '?text=' + waMsg;
  
  modal.classList.remove('hidden');
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) modal.classList.add('hidden');
}

function toggleMobileMenu(forceState) {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  if (typeof forceState === 'boolean') {
    if (forceState) menu.classList.remove('hidden');
    else menu.classList.add('hidden');
  } else {
    menu.classList.toggle('hidden');
  }
}

// Exponer explícitamente al objeto window para que los eventos inline funcionen siempre
window.AppState = AppState;
window.navigateTo = navigateTo;
window.toggleFavorite = toggleFavorite;
window.showToast = showToast;
window.handleRegisterSubmit = handleRegisterSubmit;
window.handleLoginSubmit = handleLoginSubmit;
window.handleLogout = handleLogout;
window.handleJobSubmit = handleJobSubmit;
window.handleServiceSubmit = handleServiceSubmit;
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.renderExploreView = renderExploreView;
window.renderAdminView = renderAdminView;
window.deleteAdminItem = deleteAdminItem;
window.toggleItemStatus = toggleItemStatus;
window.changeUserRole = changeUserRole;
window.switchAdminTab = switchAdminTab;
window.toggleMobileMenu = toggleMobileMenu;
window.loginAsDemoRole = loginAsDemoRole;
window.switchCurrentUserRole = switchCurrentUserRole;
window.openAdminAccessModal = openAdminAccessModal;
window.closeAdminAccessModal = closeAdminAccessModal;
window.handleAdminKeySubmit = handleAdminKeySubmit;
window.openRoleUpgradeModal = openRoleUpgradeModal;
window.closeRoleUpgradeModal = closeRoleUpgradeModal;
window.upgradeCurrentUserToProvider = upgradeCurrentUserToProvider;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  renderHomeFeatured();
  
  if (supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        const u = session.user;
        AppState.currentUser = {
          id: u.id,
          name: u.user_metadata?.nombre || u.email.split('@')[0],
          email: u.email,
          role: u.user_metadata?.tipo_usuario || 'cliente',
          location: 'Santa Cruz, Bolivia',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
          phone: '+591 78945612'
        };
        SafeStorage.set('yapcity_user', AppState.currentUser);
      }
    } catch (e) {
      console.warn('Session check:', e);
    }
  }
  
  updateAuthUI();

  const homeSearch = document.getElementById('home-search-input');
  if (homeSearch) {
    homeSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        AppState.exploreFilter.query = homeSearch.value;
        navigateTo('explore', 'trabajos');
      }
    });
  }
});
