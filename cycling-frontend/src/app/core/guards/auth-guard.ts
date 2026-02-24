import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    // Si hay token, dejamos pasar
    if (token) {
      return true;
    }

    // Si no hay token, redirigimos al login
    this.router.navigate(['/login']);
    return false;
  }
}
