// =========================================================
// YAPCITY - CORE APPLICATION LOGIC & SUPABASE INTEGRATION
// =========================================================

const SUPABASE_URL = 'https://rvowmjsxuqjbflybkfpq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LcNkCL02cQqE5em5kp6fjA_fe5VoSBW';

// Inicializar cliente Supabase si la librería está cargada
let supabase = null;
if (window.supabase) {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn('Supabase init warning:', err);
  }
}

// Estado global de la aplicación
const AppState = {
  currentView: 'home', // home, login, register, explore, post-job, post-service, detail, profile, admin
  currentUser: {
    id: 'user-001',
    name: 'María González',
    email: 'maria@gmail.com',
    role: 'usuario', // 'usuario', 'proveedor', 'admin'
    location: 'Santa Cruz, Bolivia',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    phone: '+591 78945612'
  },
  selectedItem: null,
  exploreTab: 'trabajos', // 'trabajos' o 'servicios'
  exploreFilter: {
    query: '',
    category: '',
    location: '',
    status: ''
  },
  favorites: ['item-1', 'item-4'],
  
  // Datos iniciales idénticos a los del plano de arquitectura (Nexoria / Yapcity)
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
        id: 'prov-1',
        name: 'Ana López',
        verified: true,
        rating: 4.8,
        reviewsCount: 12,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        phone: '+591 71234567'
      },
      images: [
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      id: 'item-2',
      type: 'trabajo',
      title: 'Carpintería a medida y acabados',
      description: 'Fabricación y reparación de muebles de cocina, roperos empotrados y escritorios de madera de primera calidad con acabados finos y resistentes.',
      category: 'Carpintería',
      location: 'La Paz',
      price: 500,
      currency: 'Bs',
      status: 'Disponible',
      date: '12 may. 2025',
      author: {
        id: 'prov-2',
        name: 'Carlos Mamani',
        verified: true,
        rating: 4.9,
        reviewsCount: 24,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phone: '+591 72345678'
      },
      images: [
        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'item-3',
      type: 'trabajo',
      title: 'Edición de video para redes y YouTube',
      description: 'Edición profesional de Reels, TikToks y videos de YouTube. Efectos de sonido, subtítulos animados y corrección de color profesional.',
      category: 'Edición de video',
      location: 'Cochabamba',
      price: 300,
      currency: 'Bs',
      status: 'En proceso',
      date: '10 may. 2025',
      author: {
        id: 'prov-3',
        name: 'Javier Rocha',
        verified: false,
        rating: 4.6,
        reviewsCount: 8,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        phone: '+591 73456789'
      },
      images: [
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'item-4',
      type: 'trabajo',
      title: 'Pintura de interiores y empastado',
      description: 'Servicio de pintura para departamentos, oficinas y casas. Trabajo limpio, rápido y con materiales lavables de alta durabilidad.',
      category: 'Pintura de interiores',
      location: 'Santa Cruz',
      price: 450,
      currency: 'Bs',
      status: 'Disponible',
      date: '08 may. 2025',
      author: {
        id: 'prov-4',
        name: 'Roberto Soliz',
        verified: true,
        rating: 4.7,
        reviewsCount: 19,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        phone: '+591 74567890'
      },
      images: [
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'item-5',
      type: 'servicio',
      title: 'Construcción y remodelación de casas',
      description: 'Obras de albañilería general, refacción de fachadas, pisos de porcelanato e instalaciones sanitarias garantizadas.',
      category: 'Construcción',
      location: 'La Paz',
      price: 1500,
      currency: 'Bs',
      status: 'Disponible',
      date: '05 may. 2025',
      author: {
        id: 'prov-5',
        name: 'Constructora Altiplano',
        verified: true,
        rating: 5.0,
        reviewsCount: 31,
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
        phone: '+591 75678901'
      },
      images: [
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'item-6',
      type: 'servicio',
      title: 'Clases particulares de inglés intensivo',
      description: 'Preparación para exámenes TOEFL/IELTS, inglés conversacional de negocios para profesionales y reforzamiento escolar personalizado.',
      category: 'Clases particulares',
      location: 'Santa Cruz',
      price: 150,
      currency: 'Bs',
      status: 'Disponible',
      date: '02 may. 2025',
      author: {
        id: 'prov-6',
        name: 'Sara Mendoza',
        verified: true,
        rating: 4.9,
        reviewsCount: 15,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        phone: '+591 76789012'
      },
      images: [
        'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  ]
};

// =========================================================
// ROUTER & VIEW SWITCHING
// =========================================================

function navigateTo(viewName, param = null) {
  AppState.currentView = viewName;
  if (param) {
    if (viewName === 'detail') {
      AppState.selectedItem = AppState.items.find(i => i.id === param) || AppState.items[0];
    } else if (viewName === 'explore') {
      AppState.exploreTab = param;
    }
  }
  
  // Ocultar todas las vistas
  document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
  
  // Mostrar la vista seleccionada
  const activeView = document.getElementById('view-' + viewName);
  if (activeView) {
    activeView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Renderizadores específicos de cada vista
  if (viewName === 'home') renderHomeFeatured();
  if (viewName === 'explore') renderExploreView();
  if (viewName === 'detail') renderDetailView();
  if (viewName === 'profile') renderProfileView();
  if (viewName === 'admin') renderAdminView();
}

// Alternar favoritos (❤️)
function toggleFavorite(itemId, event) {
  if (event) event.stopPropagation();
  const idx = AppState.favorites.indexOf(itemId);
  if (idx > -1) {
    AppState.favorites.splice(idx, 1);
  } else {
    AppState.favorites.push(itemId);
  }
  // Re-render
  if (AppState.currentView === 'explore') renderExploreView();
  if (AppState.currentView === 'home') renderHomeFeatured();
  if (AppState.currentView === 'profile') renderProfileView();
  if (AppState.currentView === 'detail') renderDetailView();
}

// 1. Render Inicio / Trabajos Destacados
function renderHomeFeatured() {
  const container = document.getElementById('home-featured-grid');
  if (!container) return;

  const featured = AppState.items.slice(0, 4);
  container.innerHTML = featured.map(item => `
    <div onclick="navigateTo('detail', '${item.id}')" class="group cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div class="relative h-44 w-full bg-slate-950 overflow-hidden">
        <img src="${item.images[0]}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute top-3 right-3">
          <button onclick="toggleFavorite('${item.id}', event)" class="p-2 rounded-full bg-slate-900/80 backdrop-blur text-slate-300 hover:text-rose-500 transition-colors">
            <svg class="w-4 h-4 ${AppState.favorites.includes(item.id) ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 class="font-bold text-white text-base group-hover:text-emerald-400 transition-colors line-clamp-1">${item.title}</h3>
          <div class="flex items-center text-xs text-slate-400 mt-1 space-x-1">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${item.location}</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.status === 'Disponible' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
            ${item.status}
          </span>
          <span class="text-sm font-extrabold text-white">Bs ${item.price}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 4. Render Explorador (Filtros + Lista)
function renderExploreView() {
  const container = document.getElementById('explore-results-grid');
  if (!container) return;

  const filtered = AppState.items.filter(item => {
    const matchesType = (AppState.exploreTab === 'trabajos' && item.type === 'trabajo') ||
                        (AppState.exploreTab === 'servicios' && item.type === 'servicio');
    const matchesQuery = !AppState.exploreFilter.query || 
      item.title.toLowerCase().includes(AppState.exploreFilter.query.toLowerCase()) ||
      item.description.toLowerCase().includes(AppState.exploreFilter.query.toLowerCase());
    const matchesCategory = !AppState.exploreFilter.category || item.category === AppState.exploreFilter.category;
    const matchesLocation = !AppState.exploreFilter.location || item.location.toLowerCase().includes(AppState.exploreFilter.location.toLowerCase());
    const matchesStatus = !AppState.exploreFilter.status || item.status === AppState.exploreFilter.status;

    return matchesType && matchesQuery && matchesCategory && matchesLocation && matchesStatus;
  });

  const tabTrabajos = document.getElementById('tab-trabajos');
  const tabServicios = document.getElementById('tab-servicios');
  if (tabTrabajos && tabServicios) {
    if (AppState.exploreTab === 'trabajos') {
      tabTrabajos.className = 'px-5 py-2 font-semibold text-sm rounded-lg bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20';
      tabServicios.className = 'px-5 py-2 font-semibold text-sm rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors';
    } else {
      tabServicios.className = 'px-5 py-2 font-semibold text-sm rounded-lg bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20';
      tabTrabajos.className = 'px-5 py-2 font-semibold text-sm rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors';
    }
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <p class="text-slate-300 font-semibold">No se encontraron resultados</p>
        <p class="text-xs text-slate-500">Intenta con otros filtros o términos de búsqueda</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div onclick="navigateTo('detail', '${item.id}')" class="group cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div class="relative h-44 w-full bg-slate-950 overflow-hidden">
        <img src="${item.images[0]}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute top-3 right-3">
          <button onclick="toggleFavorite('${item.id}', event)" class="p-2 rounded-full bg-slate-900/80 backdrop-blur text-slate-300 hover:text-rose-500 transition-colors">
            <svg class="w-4 h-4 ${AppState.favorites.includes(item.id) ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span class="text-emerald-400 font-medium">${item.category}</span>
            <span>${item.location}</span>
          </div>
          <h3 class="font-bold text-white text-base group-hover:text-emerald-400 transition-colors line-clamp-1">${item.title}</h3>
          <p class="text-xs text-slate-400 line-clamp-2 mt-1">${item.description}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.status === 'Disponible' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
            ${item.status}
          </span>
          <span class="text-sm font-extrabold text-white">Bs ${item.price}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 7. Render Detalle de Publicación
function renderDetailView() {
  const item = AppState.selectedItem || AppState.items[0];
  const container = document.getElementById('detail-container');
  if (!container) return;

  const isFav = AppState.favorites.includes(item.id);

  container.innerHTML = `
    <!-- Top Bar -->
    <div class="flex items-center justify-between pb-6 border-b border-slate-800">
      <button onclick="navigateTo('explore')" class="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span>Volver al explorador</span>
      </button>
      <span class="px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Disponible' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
        ● ${item.status}
      </span>
    </div>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
      <!-- Left 2 Cols: Images & Description -->
      <div class="lg:col-span-2 space-y-6">
        <div class="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
          <img id="detail-main-img" src="${item.images[0]}" alt="${item.title}" class="w-full h-full object-cover">
        </div>

        <!-- Miniaturas -->
        <div class="flex space-x-3 overflow-x-auto pb-2">
          ${item.images.map((img) => `
            <button onclick="document.getElementById('detail-main-img').src = '${img}'" class="h-20 w-24 rounded-xl overflow-hidden border-2 border-slate-800 hover:border-emerald-500 transition-colors flex-shrink-0">
              <img src="${img}" class="w-full h-full object-cover">
            </button>
          `).join('')}
        </div>

        <!-- Info -->
        <div class="space-y-4 pt-4">
          <div class="flex items-center space-x-3 text-xs text-slate-400">
            <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">${item.category}</span>
            <span>📍 ${item.location}</span>
            <span>📅 ${item.date}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white">${item.title}</h1>
          <div class="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            ${item.description}
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Author & Actions -->
      <div class="space-y-6">
        <!-- Pricing Card -->
        <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
          <div>
            <span class="text-xs text-slate-400 font-medium">Precio estimado</span>
            <p class="text-3xl font-black text-emerald-400">Bs ${item.price}</p>
          </div>

          <!-- Author Info -->
          <div class="pt-4 border-t border-slate-800 flex items-center space-x-3">
            <img src="${item.author.avatar}" alt="${item.author.name}" class="w-12 h-12 rounded-full object-cover border border-slate-700">
            <div>
              <div class="flex items-center space-x-1.5">
                <h4 class="font-bold text-white text-sm">${item.author.name}</h4>
                ${item.author.verified ? '<span title="Verificado" class="text-xs text-emerald-400">✓</span>' : ''}
              </div>
              <div class="flex items-center space-x-1 text-xs text-amber-400">
                <span>★ ${item.author.rating}</span>
                <span class="text-slate-500">(${item.author.reviewsCount} reseñas)</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2 pt-2">
            <button onclick="openContactModal('${item.author.name}', '${item.author.phone}', '${item.title}')" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              <span>Contactar ahora</span>
            </button>
            <button onclick="toggleFavorite('${item.id}', event)" class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center space-x-2">
              <svg class="w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <span>${isFav ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 8. Render Mi Perfil
function renderProfileView() {
  const container = document.getElementById('profile-items-container');
  if (!container) return;

  const myPosts = AppState.items.filter(i => i.author && i.author.name === 'Ana López');
  const myFavorites = AppState.items.filter(i => AppState.favorites.includes(i.id));

  container.innerHTML = myPosts.map(item => `
    <div class="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
      <div class="flex items-center space-x-4">
        <img src="${item.images[0]}" class="w-14 h-14 rounded-lg object-cover">
        <div>
          <h4 class="font-bold text-white text-sm">${item.title}</h4>
          <div class="flex items-center space-x-2 text-xs text-slate-400 mt-1">
            <span class="text-emerald-400">● ${item.status}</span>
            <span>&bull;</span>
            <span>Bs ${item.price}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="navigateTo('detail', '${item.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700">Ver</button>
      </div>
    </div>
  `).join('');

  const favContainer = document.getElementById('profile-favorites-container');
  if (favContainer) {
    if (myFavorites.length === 0) {
      favContainer.innerHTML = '<p class="text-xs text-slate-500 py-4">Aún no tienes favoritos guardados.</p>';
    } else {
      favContainer.innerHTML = myFavorites.map(item => `
        <div onclick="navigateTo('detail', '${item.id}')" class="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700">
          <div class="flex items-center space-x-3">
            <img src="${item.images[0]}" class="w-10 h-10 rounded-lg object-cover">
            <div>
              <p class="text-xs font-bold text-white truncate max-w-[180px]">${item.title}</p>
              <p class="text-[11px] text-emerald-400">Bs ${item.price}</p>
            </div>
          </div>
          <button onclick="toggleFavorite('${item.id}', event)" class="text-rose-500 hover:text-rose-400">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
      `).join('');
    }
  }
}

// 9. Render Panel Administrador
function renderAdminView() {
  const container = document.getElementById('admin-table-body');
  if (!container) return;

  container.innerHTML = AppState.items.map(item => `
    <tr class="border-b border-slate-800/80 hover:bg-slate-900/40 text-xs">
      <td class="py-3 px-4 flex items-center space-x-3">
        <img src="${item.images[0]}" class="w-8 h-8 rounded-md object-cover">
        <span class="font-medium text-white truncate max-w-xs">${item.title}</span>
      </td>
      <td class="py-3 px-4 text-slate-300">${item.type === 'trabajo' ? 'Trabajo' : 'Servicio'}</td>
      <td class="py-3 px-4 text-slate-400">${item.location}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.status === 'Disponible' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}">
          ${item.status}
        </span>
      </td>
      <td class="py-3 px-4 text-right space-x-2">
        <button onclick="navigateTo('detail', '${item.id}')" class="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">Ver</button>
        <button onclick="deleteAdminItem('${item.id}')" class="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function deleteAdminItem(id) {
  if (confirm('¿Seguro que deseas eliminar esta publicación?')) {
    AppState.items = AppState.items.filter(i => i.id !== id);
    renderAdminView();
    renderExploreView();
    renderHomeFeatured();
  }
}

// =========================================================
// GESTIÓN DE PUBLICACIÓN DE TRABAJOS Y SERVICIOS
// =========================================================

function handleJobSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('job-title').value;
  const description = document.getElementById('job-desc').value;
  const category = document.getElementById('job-category').value;
  const location = document.getElementById('job-location').value;
  const price = parseFloat(document.getElementById('job-price').value) || 0;
  const status = document.getElementById('job-status').value;

  const newItem = {
    id: 'item-' + Date.now(),
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
      verified: false,
      rating: 5.0,
      reviewsCount: 1,
      avatar: AppState.currentUser.avatar,
      phone: AppState.currentUser.phone
    },
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
    ]
  };

  AppState.items.unshift(newItem);
  alert('¡Trabajo publicado con éxito!');
  e.target.reset();
  navigateTo('detail', newItem.id);
}

function handleServiceSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('service-title').value;
  const description = document.getElementById('service-desc').value;
  const category = document.getElementById('service-category').value;
  const location = document.getElementById('service-location').value;
  const price = parseFloat(document.getElementById('service-price').value) || 0;

  const newItem = {
    id: 'item-' + Date.now(),
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
      verified: true,
      rating: 5.0,
      reviewsCount: 1,
      avatar: AppState.currentUser.avatar,
      phone: AppState.currentUser.phone
    },
    images: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ]
  };

  AppState.items.unshift(newItem);
  alert('¡Servicio publicado con éxito!');
  e.target.reset();
  navigateTo('detail', newItem.id);
}

// =========================================================
// CONTACT MODAL
// =========================================================

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

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  renderHomeFeatured();
  
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
