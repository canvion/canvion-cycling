import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ActivityService } from '../../core/services/activity.service';
import { AuthService } from '../../core/services/auth.service';
import { Activity } from '../../models/activity.model';
import { SpinnerComponent } from '../../shared/spinner.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './stats.html',
  styleUrl: './stats.css'
})
export class Stats implements OnInit {

  username: string = '';
  isLoading: boolean = true;

  // Km por semana (últimas 8 semanas)
  weekLabels: string[] = [];
  weekData: number[] = [];
  maxWeekKm: number = 1;

  // Actividades por día de la semana
  dayLabels: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  dayData: number[] = [0, 0, 0, 0, 0, 0, 0];
  maxDayCount: number = 1;

  // Distancia por mes (últimos 6 meses)
  monthLabels: string[] = [];
  monthKmData: number[] = [];
  maxMonthKm: number = 1;

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.loadStats();
  }

  loadStats(): void {
    this.activityService.getActivities().subscribe({
      next: (data: Activity[]) => {
        this.calculateWeeklyKm(data);
        this.calculateDayOfWeek(data);
        this.calculateMonthlyKm(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando estadísticas', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateWeeklyKm(activities: Activity[]): void {
    const weeks: { [key: string]: number } = {};

    // Inicializamos las últimas 8 semanas
    const today = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i * 7);
      const weekKey = this.getWeekKey(d);
      weeks[weekKey] = 0;
    }

    // Sumamos km por semana
    activities.forEach(a => {
      const d = new Date(a.startDate);
      const weekKey = this.getWeekKey(d);
      if (weeks[weekKey] !== undefined) {
        weeks[weekKey] += a.distance / 1000;
      }
    });

    this.weekLabels = Object.keys(weeks).map(key => {
      const [year, week] = key.split('-W');
      return `S${week}`;
    });
    this.weekData = Object.values(weeks).map(v => Math.round(v));
    this.maxWeekKm = Math.max(...this.weekData, 1);
  }

  getWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${weekNum}`;
  }

  calculateDayOfWeek(activities: Activity[]): void {
    this.dayData = [0, 0, 0, 0, 0, 0, 0];

    activities.forEach(a => {
      const d = new Date(a.startDate);
      // getDay() devuelve 0=Domingo, 1=Lunes... lo convertimos a 0=Lunes
      const day = (d.getDay() + 6) % 7;
      this.dayData[day]++;
    });

    this.maxDayCount = Math.max(...this.dayData, 1);
  }

  calculateMonthlyKm(activities: Activity[]): void {
    const months: { [key: string]: number } = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = 0;
    }

    activities.forEach(a => {
      const d = new Date(a.startDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (months[key] !== undefined) {
        months[key] += a.distance / 1000;
      }
    });

    this.monthLabels = Object.keys(months).map(key => {
      const month = parseInt(key.split('-')[1]);
      return monthNames[month];
    });

    this.monthKmData = Object.values(months).map(v => Math.round(v));
    this.maxMonthKm = Math.max(...this.monthKmData, 1);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
