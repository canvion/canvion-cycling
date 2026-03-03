import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ActivityService } from '../../core/services/activity.service';
import { StravaService } from '../../core/services/strava.service';
import { AuthService } from '../../core/services/auth.service';
import { StatsService } from '../../core/services/stats.service';
import { Activity } from '../../models/activity.model';
import { SpinnerComponent } from '../../shared/spinner.component';
import { Sidebar } from '../../shared/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  activities: Activity[] = [];
  isLoading: boolean = true;
  isSyncing: boolean = false;
  syncMessage: string = '';
  username: string = '';

  // Últimas 5 actividades
  lastActivities: Activity[] = [];

  // Datos para el gráfico (por mes)
  chartLabels: string[] = [];
  chartData: number[] = [];
  maxChartValue: number = 1;

  // Comparativa año anterior
  currentYear: number = new Date().getFullYear();
  totalActivities: number = 0;
  totalKm: number = 0;
  totalHours: number = 0;
  lastYearActivities: number = 0;
  lastYearKm: number = 0;
  lastYearHours: number = 0;
  selectedPeriod: string = 'all';

  // Stats semana / mes / año del backend
  weekStats: any = null;
  monthStats: any = null;
  yearStats: any = null;

  constructor(
    private activityService: ActivityService,
    private stravaService: StravaService,
    private authService: AuthService,
    private statsService: StatsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.loadActivities();
    this.loadStats();
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
        this.cdr.detectChanges();
      }
    });
  }

  loadStats(): void {
    this.statsService.getStats().subscribe({
      next: (data: any) => {
        this.weekStats = data.week;
        this.monthStats = data.month;
        this.yearStats = data.year;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando stats', err);
      }
    });
  }

  calculateStats(): void {
    this.totalActivities = this.activities.length;
    this.totalKm = this.activities.reduce((sum, a) => sum + (a.distance / 1000), 0);
    this.totalHours = this.activities.reduce((sum, a) => sum + (a.movingTime / 3600), 0);

    this.lastActivities = [...this.activities]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);

    this.buildChartData();
    this.calculateYearComparison(this.activities);
  }

  buildChartData(): void {
    const months: { [key: string]: number } = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = 0;
    }

    this.activities.forEach(a => {
      const d = new Date(a.startDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (months[key] !== undefined) {
        months[key]++;
      }
    });

    this.chartLabels = Object.keys(months).map(key => {
      const month = parseInt(key.split('-')[1]);
      return monthNames[month];
    });

    this.chartData = Object.values(months);
    this.maxChartValue = Math.max(...this.chartData, 1);
  }

  filterByPeriod(period: string): void {
    this.selectedPeriod = period;

    const now = new Date();
    let filtered: Activity[];

    if (period === 'month') {
      filtered = this.activities.filter(a => {
        const d = new Date(a.startDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (period === 'year') {
      filtered = this.activities.filter(a =>
        new Date(a.startDate).getFullYear() === now.getFullYear()
      );
    } else {
      filtered = this.activities;
    }

    this.totalActivities = filtered.length;
    this.totalKm = filtered.reduce((sum, a) => sum + (a.distance / 1000), 0);
    this.totalHours = filtered.reduce((sum, a) => sum + (a.movingTime / 3600), 0);
    this.calculateYearComparison(filtered);
    this.cdr.detectChanges();
  }

  calculateYearComparison(filtered: Activity[]): void {
    const now = new Date();
    let comparison: Activity[];

    if (this.selectedPeriod === 'month') {
      comparison = this.activities.filter(a => {
        const d = new Date(a.startDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() - 1;
      });
    } else {
      comparison = this.activities.filter(a =>
        new Date(a.startDate).getFullYear() === now.getFullYear() - 1
      );
    }

    this.lastYearActivities = comparison.length;
    this.lastYearKm = comparison.reduce((sum, a) => sum + (a.distance / 1000), 0);
    this.lastYearHours = comparison.reduce((sum, a) => sum + (a.movingTime / 3600), 0);
  }

  getDiff(current: number, last: number): string {
    if (last === 0) return '';
    const diff = ((current - last) / last * 100).toFixed(0);
    return Number(diff) >= 0 ? `+${diff}%` : `${diff}%`;
  }

  isPositive(current: number, last: number): boolean {
    return current >= last;
  }

  connectStrava(): void {
    this.stravaService.getAuthUrl().subscribe({
      next: (res: any) => window.open(res.authorizationUrl, '_blank'),
      error: (err: any) => console.error('Error obteniendo URL de Strava', err)
    });
  }

  syncStrava(): void {
    this.isSyncing = true;
    this.syncMessage = '';

    this.stravaService.syncActivities().subscribe({
      next: (res: any) => {
        this.syncMessage = `✅ ${res.newActivitiesCount} actividades nuevas sincronizadas`;
        this.isSyncing = false;
        this.loadActivities();
        this.loadStats();
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

  formatKm(distance: number): string {
    return (distance / 1000).toFixed(1);
  }

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
}
