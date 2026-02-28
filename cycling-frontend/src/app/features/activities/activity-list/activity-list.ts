import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';
import { Activity } from '../../../models/activity.model';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css'
})
export class ActivityList implements OnInit {

  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  isLoading: boolean = true;

  // Filtros
  filterType: string = '';
  filterDate: string = '';

  username: string = '';

  constructor(
    private activityService: ActivityService,
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
        // Ordenamos por fecha descendente
        this.activities = data.sort((a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        this.filteredActivities = this.activities;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando actividades', err);
        this.isLoading = false;
      }
    });
  }

  // Aplica los filtros seleccionados
  applyFilters(): void {
    this.filteredActivities = this.activities.filter(a => {
      const matchType = this.filterType ? a.type === this.filterType : true;
      const matchDate = this.filterDate
        ? a.startDate.startsWith(this.filterDate)
        : true;
      return matchType && matchDate;
    });
  }

  // Limpia los filtros
  clearFilters(): void {
    this.filterType = '';
    this.filterDate = '';
    this.filteredActivities = this.activities;
  }

  // Eliminar actividad con confirmación
  deleteActivity(id: number, name: string): void {
    const confirm = window.confirm(`¿Eliminar "${name}"?`);
    if (!confirm) return;

    this.activityService.deleteActivity(id).subscribe({
      next: () => {
        // Quitamos la actividad de la lista sin recargar
        this.activities = this.activities.filter(a => a.id !== id);
        this.filteredActivities = this.filteredActivities.filter(a => a.id !== id);
      },
      error: (err: any) => {
        console.error('Error eliminando actividad', err);
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

  // Icono según tipo de actividad
  getIcon(type: string): string {
    if (type === 'Ride') return '🚴';
    if (type === 'Run') return '🏃';
    if (type === 'Swim') return '🏊';
    return '🏅';
  }
}
