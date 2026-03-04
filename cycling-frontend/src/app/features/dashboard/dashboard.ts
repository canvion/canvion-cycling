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
import { BottomNav } from '../../shared/bottom-nav';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, Sidebar, BottomNav],
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

  // Móvil — saludo
  greeting: string = '';

// Móvil — racha de días
  streak: number = 0;

// Móvil — objetivo semanal
  weekGoalKm: number = 150;
  weekKm: number = 0;
  weekProgress: number = 0;

// Móvil — gráfico semanal por días
  weekDays: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  weekBars: number[] = [0, 0, 0, 0, 0, 0, 0];
  maxBarValue: number = 1;

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
    this.setGreeting();
    this.loadGoal();
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
    this.calculateStreak(this.activities);
    this.calculateWeekBars(this.activities);
    this.weekKm = this.activities
      .filter(a => {
        const d = new Date(a.startDate);
        const now = new Date();
        const monday = new Date(now);
        const day = now.getDay();
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        monday.setHours(0, 0, 0, 0);
        return d >= monday;
      })
      .reduce((sum, a) => sum + (a.distance / 1000), 0);
    this.weekProgress = Math.min((this.weekKm / this.weekGoalKm) * 100, 100);
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

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Buenos días';
    else if (hour < 20) this.greeting = 'Buenas tardes';
    else this.greeting = 'Buenas noches';
  }

  loadGoal(): void {
    const saved = localStorage.getItem('weekGoalKm');
    if (saved) this.weekGoalKm = parseInt(saved, 10);
  }

  calculateStreak(activities: Activity[]): void {
    const dates = new Set<number>();
    activities.forEach(a => {
      const d = new Date(a.startDate);
      d.setHours(0, 0, 0, 0);
      dates.add(d.getTime());
    });
    let count = 0;
    const cur = new Date();
    cur.setHours(0, 0, 0, 0);
    while (dates.has(cur.getTime())) {
      count++;
      cur.setDate(cur.getDate() - 1);
    }
    this.streak = count;
  }

  calculateWeekBars(activities: Activity[]): void {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const bars = [0, 0, 0, 0, 0, 0, 0];
    activities.forEach(a => {
      const d = new Date(a.startDate);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) bars[diff] += (a.distance || 0) / 1000;
    });
    this.weekBars = bars;
    this.maxBarValue = Math.max(...bars, 1);
  }

  getBarHeight(value: number): number {
    return (value / this.maxBarValue) * 100;
  }

  getTodayIndex(): number {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }

  getRelativeDate(activity: Activity): string {
    const diff = Math.floor((Date.now() - new Date(activity.startDate).getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return new Date(activity.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
