import { Routes } from '@angular/router';
import { UsersComponent } from './administrador/users/users.component';
import { AuthGuard } from '../guards/auth.guard';
import { EstatusComponent } from './administrador/estatus/estatus.component';
import { ProcesosComponent } from './administrador/procesos/procesos.component';
import { ResultadosComponent } from './administrador/resultados/resultados.component';
import { MaestroComponent } from './maestro/maestro.component';
import { InicioalumnoComponent } from './alumno/inicioalumno/inicioalumno.component';
import { PreguntasComponent } from './alumno/preguntas/preguntas.component';
import { InstrumentosComponent } from './administrador/instrumentos/instrumentos.component';
import { CategoriasComponent } from './administrador/categorias/categorias.component';
import { PreguntasAdminComponent } from './administrador/preguntas-admin/preguntas-admin.component';
import { OpcionesComponent } from './administrador/opciones/opciones.component';
import { MaestrosAlumnoComponent } from './alumno/maestros-alumno/maestros-alumno.component';

export const ComponentsRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: 'users',
				component: UsersComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin'] }
			},
			{
				path: 'estatus',
				component: EstatusComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin'] }
			},
			{
				path: 'procesos',
				component: ProcesosComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin'] }
			},
			{
				path: 'resultados',
				component: ResultadosComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin'] }
			},
			{
				path: 'instrumentos',
				component: InstrumentosComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin'] }
			},
			{
				path: 'categorias',
				component: CategoriasComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin'] }
			},
			{
				path: 'preguntasAdmin',
				component: PreguntasAdminComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin'] }
			},
			{
				path: 'opciones',
				component: OpcionesComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin'] }
			},
			{
				path: 'maestro',
				component: MaestroComponent,
				canActivate: [AuthGuard],
				data: { roles: ['TEACHER'] }
			},
			
		
			{
				path: 'inicioalumno',
				component: InicioalumnoComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin','Alumno']}
			},
			{
				path: 'maestros-alumno',
				component: MaestrosAlumnoComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin','Alumno']}
			},
			{
				path: 'preguntas', 
				component: PreguntasComponent,
				canActivate: [AuthGuard],
				data: { roles: ['Admin', 'Alumno'] }
			}
		]
	}
];
