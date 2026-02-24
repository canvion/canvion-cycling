import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { JwtInterceptor } from './core/interceptors/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Rutas de la aplicación
    provideRouter(routes),

    // HttpClient con soporte para interceptores
    provideHttpClient(withInterceptorsFromDi()),

    // Registramos el interceptor JWT
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },

    // Animaciones para Angular Material
    provideAnimations()
  ]
};
