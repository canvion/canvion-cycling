import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActivityService } from '../../core/services/activity.service';
import { AuthService } from '../../core/services/auth.service';
import { Activity } from '../../models/activity.model';
import { Sidebar } from '../../shared/sidebar';
import { SpinnerComponent } from '../../shared/spinner.component';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, Sidebar, SpinnerComponent],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar implements OnInit {

  isLoading: boolean = true;

  // Mes actual mostrado
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();

  // Nombres de meses y días
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Días del mes actual con sus actividades
  calendarDays: { day: number | null, activities: Activity[] }[] = [];

  // Todas las actividades
  activities: Activity[] = [];

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['month'] !== undefined) {
        this.currentMonth = Number(params['month']);
        this.currentYear = Number(params['year']);
      }
      this.loadActivities();
    });
  }

  loadActivities(): void {
    this.activityService.getActivities().subscribe({
      next: (data: Activity[]) => {
        this.activities = data;
        this.buildCalendar();
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

  buildCalendar(): void {
    this.calendarDays = [];

    // Primer día del mes (0=Dom, 1=Lun...)
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    // Convertimos a lunes=0
    const startOffset = (firstDay + 6) % 7;

    // Total de días del mes
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    // Añadimos celdas vacías al principio
    for (let i = 0; i < startOffset; i++) {
      this.calendarDays.push({ day: null, activities: [] });
    }

    // Añadimos los días con sus actividades
    for (let d = 1; d <= daysInMonth; d++) {
      const dayActivities = this.activities.filter(a => {
        const date = new Date(a.startDate);
        return date.getFullYear() === this.currentYear &&
          date.getMonth() === this.currentMonth &&
          date.getDate() === d;
      });
      this.calendarDays.push({ day: d, activities: dayActivities });
    }
  }

  // Mes anterior
  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.updateUrl();
    this.buildCalendar();
    this.cdr.detectChanges();
  }

  // Mes siguiente
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.updateUrl();
    this.buildCalendar();
    this.cdr.detectChanges();
  }

  updateUrl(): void {
    this.router.navigate([], {
      queryParams: { month: this.currentMonth, year: this.currentYear },
      replaceUrl: true
    });
  }

  // Si el día tiene actividad navega a ella, si tiene varias va a la primera
  goToActivity(activities: Activity[]): void {
    if (activities.length === 1) {
      this.router.navigate(['/activities', activities[0].id]);
    } else if (activities.length > 1) {
      // Si hay varias mostramos la primera
      this.router.navigate(['/activities', activities[0].id]);
    }
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    const today = new Date();
    return today.getFullYear() === this.currentYear &&
      today.getMonth() === this.currentMonth &&
      today.getDate() === day;
  }

  getIcon(type: string): string {
    if (type === 'Ride') return '🚴';
    if (type === 'Run') return '🏃';
    if (type === 'Swim') return '🏊';
    return '🏅';
  }
}
