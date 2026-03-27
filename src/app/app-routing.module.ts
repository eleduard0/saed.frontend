import { Routes } from '@angular/router';
import { FullComponent } from './pages/layouts/full/full.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { LogoutComponent } from './pages/auth/logout/logout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';

import { PreguntasComponent } from './component/alumno/preguntas/preguntas.component';

export const Approutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '404',
    component: NotFoundComponent,
  },

  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],  
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        data: { roles: ['Admin'] },
      },

      {
        path: 'component',
        loadChildren: () =>
          import('./component/component.module').then((m) => m.ComponentsModule),
        data: { roles: ['Admin', 'Alumno'] },
      },

      {
        path: 'preguntas/:grupo/:materia',
        component: PreguntasComponent,
        data: { roles: ['Admin', 'Alumno'] },
      },
    ],
  },

  {
    path: 'logout',
    component: LogoutComponent,
    canActivate: [AuthGuard],
  },

  {
    path: '**',
    component: NotFoundComponent,
  },
];