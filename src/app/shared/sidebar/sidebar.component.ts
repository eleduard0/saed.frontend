import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ROUTES } from './menu-items';
import { RouteInfo } from './sidebar.metadata';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  sidebarnavItems: RouteInfo[] = [];
  showMenu    = '';
  sidebarOpen = false; // false = cerrado en mobile

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const sesion = this.authService.getSesion();
    const rol    = sesion?.rol ?? '';
    this.sidebarnavItems = ROUTES.filter(item =>
      !item.role || item.role.length === 0 || item.role.includes(rol)
    );
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleSubmenu(title: string): void {
    this.showMenu = this.showMenu === title ? '' : title;
  }

  logout(): void {
    this.authService.logout();
    this.closeSidebar();
  }

  // Cerrar sidebar al redimensionar a desktop
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if ((event.target as Window).innerWidth > 768) {
      this.sidebarOpen = false;
    }
  }
}