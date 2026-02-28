import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ActivityService } from '../../core/services/activity.service';
import { StravaService } from '../../core/services/strava.service';
import { AuthService } from '../../core/services/auth.service';
import { Activity } from '../../models/activity.model';
import { SpinnerComponent } from '../../shared/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  activities: Activity[] = [];
  isLoading: boolean = true;
  isSyncing: boolean = false;
  syncMessage: string = '';
  username: string = '';

  // Estadísticas calculadas
  totalActivities: number = 0;
  totalKm: number = 0;
  totalHours: number = 0;

  // Últimas 5 actividades
  lastActivities: Activity[] = [];

  // Datos para el gráfico (por mes)
  chartLabels: string[] = [];
  chartData: number[] = [];

  constructor(
    private activityService: ActivityService,
    private stravaService: StravaService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.loadActivities();
  }

  loadActivities(): void {
    this.activityService.getActivities().subscribe({
      next: (data: Activity[]) => {
        this.activities = data;
        this.calculateStats();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando actividades', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalActivities = this.activities.length;

    // Suma de km totales
    this.totalKm = this.activities.reduce((sum, a) => sum + (a.distance / 1000), 0);

    // Suma de horas totales
    this.totalHours = this.activities.reduce((sum, a) => sum + (a.movingTime / 3600), 0);

    // Últimas 5 actividades ordenadas por fecha
    this.lastActivities = [...this.activities]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);

    // Datos para el gráfico por mes
    this.buildChartData();
  }

  buildChartData(): void {
    // Contamos actividades por mes (últimos 6 meses)
    const months: { [key: string]: number } = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Inicializamos los últimos 6 meses con 0
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = 0;
    }

    // Contamos actividades en cada mes
    this.activities.forEach(a => {
      const d = new Date(a.startDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (months[key] !== undefined) {
        months[key]++;
      }
    });

    // Convertimos a arrays para el gráfico
    this.chartLabels = Object.keys(months).map(key => {
      const [year, month] = key.split('-');
      return monthNames[parseInt(month)];
    });

    this.chartData = Object.values(months);

    // Dibujamos el gráfico después de que el DOM esté listo
    setTimeout(() => this.drawChart(), 500);
  }

  drawChart(): void {
    const canvas = document.getElementById('activityChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxValue = Math.max(...this.chartData, 1);
    const chartHeight = 150;
    const paddingBottom = 30;
    const paddingLeft = 20;
    const containerWidth = canvas.parentElement?.clientWidth || 400;

    const totalBars = this.chartData.length;
    const barWidth = Math.floor((containerWidth - paddingLeft) / totalBars * 0.55);
    const gap = Math.floor((containerWidth - paddingLeft) / totalBars * 0.45);

    canvas.width = containerWidth;
    canvas.height = chartHeight + paddingBottom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.chartData.forEach((value, i) => {
      const x = paddingLeft + i * (barWidth + gap);
      const barH = (value / maxValue) * chartHeight;
      const y = chartHeight - barH;

      ctx.fillStyle = '#0f3460';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 4);
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + barWidth / 2, y - 4);

      ctx.fillStyle = '#666';
      ctx.fillText(this.chartLabels[i], x + barWidth / 2, chartHeight + 20);
    });
  }
  // Conectar con Strava
  connectStrava(): void {
    this.stravaService.getAuthUrl().subscribe({
      next: (res: any) => {
        window.open(res.authorizationUrl, '_blank');
      },
      error: (err: any) => {
        console.error('Error obteniendo URL de Strava', err);
      }
    });
  }

  // Sincronizar actividades de Strava
  syncStrava(): void {
    this.isSyncing = true;
    this.syncMessage = '';

    this.stravaService.syncActivities().subscribe({
      next: (res: any) => {
        this.syncMessage = `✅ ${res.newActivitiesCount} actividades nuevas sincronizadas`;
        this.isSyncing = false;
        this.loadActivities(); // Recargamos
      },
      error: (err: any) => {
        this.syncMessage = '❌ Error al sincronizar. Conecta primero con Strava.';
        this.isSyncing = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Formatea metros a km
  formatKm(distance: number): string {
    return (distance / 1000).toFixed(1);
  }

  // Formatea segundos a hh:mm
  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
}
