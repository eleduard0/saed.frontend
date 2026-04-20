import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [

  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: 'bi bi-speedometer2',
    role: ['Admin'],
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '',
    title: 'Instrumentos',
    icon: 'bi bi-clipboard-check',
    role: ['Admin'],
    class: '',
    extralink: false,
    submenu: [
      {
        path: '/instrumentos',
        title: 'Lista de instrumentos',
        icon: 'bi bi-list-ul',
        role: ['Admin'],
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/nuevoinstrumento',
        title: 'Nuevo instrumento',
        icon: 'bi bi-plus-circle',
        role: ['Admin'],
        class: '',
        extralink: false,
        submenu: []
      }
    ]
  },
  {
    path: '/procesos',
    title: 'Procesos',
    icon: 'bi bi-calendar-check',
    role: ['Admin'],
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/reportes',
    title: 'Reportes',
    icon: 'bi bi-bar-chart-line',
    role: ['Admin'],
    class: '',
    extralink: false,
    submenu: []
  },

  // ── Alumno — sin sidebar, se omite aquí ───────────────────────────────────
  // La vista del alumno tiene su propio layout sin sidebar
];