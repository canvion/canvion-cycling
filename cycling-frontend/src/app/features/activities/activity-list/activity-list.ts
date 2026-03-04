import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';
import { Activity } from '../../../models/activity.model';
import { SpinnerComponent } from '../../../shared/spinner.component';
import { Sidebar } from '../../../shared/sidebar';
import { BottomNav } from '../../../shared/bottom-nav';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, FormsModule, Sidebar, BottomNav],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css'
})
export class ActivityList implements OnInit {

  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  isLoading: boolean = true;

  filterType: string = '';
  filterDate: string = '';
  username: string = '';

  // Paginación
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 10;

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.isLoading = true;
    this.activityService.getActivitiesPaginated(page, this.pageSize).subscribe({
      next: (data: any) => {
        this.activities = data.content || [];
        this.filteredActivities = this.activities;
        this.currentPage = data.number;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    window.scrollTo(0, 0);
    this.loadPage(page);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  applyFilters(): void {
    this.filteredActivities = this.activities.filter(a => {
      const matchType = this.filterType ? a.type === this.filterType : true;
      const matchDate = this.filterDate ? a.startDate.startsWith(this.filterDate) : true;
      return matchType && matchDate;
    });
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterDate = '';
    this.filteredActivities = this.activities;
  }

  deleteActivity(id: number, name: string): void {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    this.activityService.deleteActivity(id).subscribe({
      next: () => {
        this.activities = this.activities.filter(a => a.id !== id);
        this.filteredActivities = this.filteredActivities.filter(a => a.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {}
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

  getIcon(type: string): string {
    if (type === 'Ride') return '🚴';
    if (type === 'Run') return '🏃';
    if (type === 'Swim') return '🏊';
    return '🏅';
  }

  getRelativeDate(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  decodePolyline(encoded: string): [number, number][] {
    if (!encoded) return [];
    const points: [number, number][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
  }

  getRoutePath(encoded: string): string {
    if (!encoded) return '';
    const points = this.decodePolyline(encoded);
    if (points.length < 2) return '';

    const lats = points.map(p => p[0]);
    const lngs = points.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const rangeL = maxLat - minLat || 1;
    const rangeG = maxLng - minLng || 1;
    const W = 80; const H = 50; const pad = 6;

    return points.map(p => {
      const x = pad + ((p[1] - minLng) / rangeG) * (W - pad * 2);
      const y = pad + ((maxLat - p[0]) / rangeL) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
}
