import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  isCollapsed: boolean = false;
  username: string = '';

  isMobileOpen: boolean = false;

  toggleMobile(): void {
    this.isMobileOpen = !this.isMobileOpen;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.username = this.authService.getUsername() || '';
    // Recuperamos el estado guardado
    this.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (this.isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    }
  }

  toggle(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
    if (this.isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
