import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="content">
        <div class="code">404</div>
        <h1>Página no encontrada</h1>
        <p>La página que buscas no existe.</p>
        <a routerLink="/dashboard">Volver al dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }

    .content {
      text-align: center;
      color: white;
    }

    .code {
      font-size: 120px;
      font-weight: 700;
      color: #fc4c02;
      line-height: 1;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 28px;
      margin: 0 0 12px 0;
    }

    p {
      color: #aaa;
      margin: 0 0 32px 0;
    }

    a {
      background: #0f3460;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.2s;
    }

    a:hover {
      background: #1a4a7a;
    }
  `]
})
export class NotFoundComponent {}
