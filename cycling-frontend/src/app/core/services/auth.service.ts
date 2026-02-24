import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // URL base del backend
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Llamada al endpoint de login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  // Llamada al endpoint de registro
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data);
  }

  // Guarda el token y datos del usuario en localStorage
  saveSession(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('userId', response.userId.toString());
    localStorage.setItem('username', response.username);
  }

  // Borra todo al cerrar sesión
  logout(): void {
    localStorage.clear();
  }

  // Comprueba si hay token guardado
  isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }

  // Devuelve el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Devuelve el username
  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}
