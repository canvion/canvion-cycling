import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  // Evita que múltiples peticiones fallen a la vez y lancen varios refresh simultáneos
  private isRefreshing = false;
  private refreshDone$ = new BehaviorSubject<string | null>(null);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Añadimos el token a la petición
    const token = localStorage.getItem('token');
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        // Si no es 401, o es la propia llamada al refresh, no hacemos nada especial
        if (error.status !== 401 || request.url.includes('/auth/refresh')) {
          return throwError(() => error);
        }

        // Intentamos renovar el token
        return this.handleRefresh(request, next);
      })
    );
  }

  private handleRefresh(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = localStorage.getItem('refreshToken');

    // Si no hay refreshToken, vamos al login directamente
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    // Si ya hay un refresh en curso, esperamos a que termine
    if (this.isRefreshing) {
      return this.refreshDone$.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token!)))
      );
    }

    // Lanzamos el refresh
    this.isRefreshing = true;
    this.refreshDone$.next(null);

    return this.http.post<any>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      switchMap((response: any) => {
        // Guardamos los tokens nuevos
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);

        this.isRefreshing = false;
        this.refreshDone$.next(response.token);

        // Reintentamos la petición original con el token nuevo
        return next.handle(this.addToken(request, response.token));
      }),
      catchError((error) => {
        // Si el refresh falla, cerramos sesión
        this.isRefreshing = false;
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
