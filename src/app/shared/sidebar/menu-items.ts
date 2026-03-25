import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [
  {
    path: '/dashboard',
    title: 'Panel de control',
    icon: 'bi bi-speedometer2',
    role: ['ADMIN'], 
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/component/users',
    title: 'Usuarios',
    icon: 'bi bi-person',
    role: ['ADMIN'],
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/component/estatus',
    title: 'Estatus',
    icon: 'bi bi-bar-chart',
    role: ['ADMIN'],
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/component/resultados',
    title: 'Resultados',
    icon: 'bi bi-graph-up-arrow',
    role: ['ADMIN'],
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '',
    title: 'Evaluaciones',
    icon: 'bi bi-clipboard',
    role: ['ADMIN'],
    class: '',
    extralink: false,
    submenu: [ 
    {
      path: '/component/instrumentos',
      title: 'Instrumentos',
      icon: 'bi bi-briefcase',
      role: ['ADMIN'],
      class: '',
      extralink: false,
      submenu: []
    },
    {
      path: '/component/categorias',
      title: 'Categorias',
      icon: 'bi bi-collection',
      role: ['ADMIN'],
      class: '',
      extralink: false,
      submenu: []
    },
    {
      path: '/component/preguntasAdmin',
      title: 'Preguntas',
      icon: 'bi bi-text-left',
      role: ['ADMIN'],
      class: '',
      extralink: false,
      submenu: []
    },
    {
      path: '/component/opciones',
      title: 'Opciones',
      icon: 'bi bi-123',
      role: ['ADMIN'],
      class: '',
      extralink: false,
      submenu: []
    },
  ]},
  
  {
    path: '/component/maestro',
    title: 'Maestro',
    icon: 'bi bi-graph-up-arrow',
    role: ['TEACHER'],
    class: '',
    extralink: false,
    submenu: []
  },
 
 
  {
    path: '/component/inicio',
    title: 'Inicio',
    icon: 'bi bi-graph-up-arrow',
    role: ['MAESTRO'],
    class: '',
    extralink: false,
    submenu: []
  },
  
  {
    path: '/component/procesos',
    title: 'Procesos',
    icon: 'bi bi-archive',
    role: ['ADMIN'],
    class: '',
    extralink: false,
    submenu: []
  },
  // {
  //   path: '/component/clave',
  //   title: 'Avances',
  //   icon: 'bi bi-inboxes',
  //   role: ['ADMIN'],
  //   class: '',
  //   extralink: false,
  //   submenu: []
  // },

  /* Esta será para la parte de Alumnos */
  {
    path: '/component/inicioalumno',
    title: 'Inicio',
    icon: 'bi bi-person',
    role: ['STUDENT'],
    class: '',
    extralink: false,
    submenu: []
  },
  // {
  //   path: '/component/maestros-alumno',
  //   title: 'Maestros',
  //   icon: 'bi bi-person',
  //   role: ['STUDENT'],
  //   class: '',
  //   extralink: false,
  //   submenu: []
  // }
  // {
  //   path: '/component/extracurricular',
  //   title: 'Extracurricular',
  //   icon: 'bi bi-trophy',
  //   role: ['ADMIN'],
  //   class: '',
  //   extralink: false,
  //   submenu: []
  // },
  // {
  //   path: '/component/clave',
  //   title: 'Preguntas-Alumnos',
  //   icon: 'bi bi-inboxes',
  //   role: ['ADMIN'],
  //   class: '',
  //   extralink: false,
  //   submenu: []
  // },
  
  /* {
    path: '',
    title: 'Control',
    icon: 'bi bi-ui-radios-grid',
    role: ['ADMIN'],
    class: '',
    extralink: false,
    submenu: [
      {
        path: '/component/careers',
        title: 'Carreras',
        icon: 'bi bi-bookmark',
        role: ['ADMIN'],
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/component/buildings',
        title: 'Edificios',
        icon: 'bi bi-building',
        role: ['ADMIN'],
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/component/classrooms',
        title: 'Aulas',
        icon: 'bi bi-house-door-fill',
        role: ['ADMIN'],
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/component/groups',
        title: 'Grupos',
        icon: 'bi bi-people-fill',
        role: ['ADMIN'],
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/component/subjects',
        title: 'Materias',
        icon: 'bi bi-list',
        role: ['ADMIN'],
        class: '',
        extralink: false,
        submenu: []
      },

      {
        path: '/component/teachers',
        title: 'Docentes',
        icon: 'bi bi-person-badge',
        role: ['ADMIN'],
        class: '',
        extralink: false,
        submenu: []
      }
    ]
  }, */
  /* {
    path: '/component/settings',
    title: 'Configuración',
    icon: 'bi bi-gear',
    role: ['ADMIN'],
    class: '',
    extralink: false,
    submenu: []
  } */
];
