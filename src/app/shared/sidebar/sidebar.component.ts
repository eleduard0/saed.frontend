import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ROUTES } from './menu-items';
import { RouteInfo } from './sidebar.metadata';
import { AuthService } from 'src/app/core/services/auth.service'; // ajusta la ruta

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  sidebarnavItems: RouteInfo[] = [];
  showMenu = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sesion = this.authService.getSesion();
    const rol    = sesion?.rol ?? '';

    // Filtrar rutas según rol del usuario logueado
    this.sidebarnavItems = ROUTES.filter(item =>
      !item.role || item.role.length === 0 || item.role.includes(rol)
    );
  }

  toggleSubmenu(title: string): void {
    this.showMenu = this.showMenu === title ? '' : title;
  }

  logout(): void {
    this.authService.logout();
  }
}