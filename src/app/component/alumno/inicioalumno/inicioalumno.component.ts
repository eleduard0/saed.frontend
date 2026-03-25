import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-inicioalumno',
  standalone: false,
  templateUrl: './inicioalumno.component.html',
  styleUrl: './inicioalumno.component.scss'
})

export class InicioalumnoComponent {

  constructor(    private router: Router
  ){};
  
  Entrar(){
    this.router.navigate(['/component/maestros-alumno']);

  }
}
