import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';
import { Activity } from '../../../models/activity.model';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activity-detail.html',
  styleUrl: './activity-detail.css'
})
export class ActivityDetail implements OnInit {

  activity: Activity | null = null;
  isLoading: boolean = true;
  username: string = '';

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';

    // Cogemos el id de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadActivity(Number(id));
    }
  }

  loadActivity(id: number): void {
    this.activityService.getActivity(id).subscribe({
      next: (data: Activity) => {
        this.activity = data;
        this.isLoading = false;
        this.cdr.detectChanges();

        // Si tiene polyline, dibujamos el mapa
        if (data.summaryPolyline) {
          setTimeout(() => this.loadMap(data.summaryPolyline), 300);
        }
      },
      error: (err: any) => {
        console.error('Error cargando actividad', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMap(polyline: string): void {
    // Cargamos Leaflet dinámicamente
    const L = (window as any)['L'];
    if (!L) {
      console.warn('Leaflet no está cargado');
      return;
    }

    const map = L.map('map').setView([40.4168, -3.7038], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Decodificamos el polyline de Strava
    const coords = this.decodePolyline(polyline);
    if (coords.length === 0) return;

    const line = L.polyline(coords, { color: '#fc4c02', weight: 3 }).addTo(map);
    map.fitBounds(line.getBounds());
  }

  // Decodifica el formato polyline de Google/Strava
  decodePolyline(encoded: string): [number, number][] {
    const coords: [number, number][] = [];
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

      lat += (result & 1) ? ~(result >> 1) : result >> 1;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      lng += (result & 1) ? ~(result >> 1) : result >> 1;

      coords.push([lat / 1e5, lng / 1e5]);
    }

    return coords;
  }

  // Formatea metros a km
  formatKm(distance: number): string {
    return (distance / 1000).toFixed(2);
  }

  // Formatea segundos a hh:mm:ss
  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Icono según tipo
  getIcon(type: string): string {
    if (type === 'Ride') return '🚴';
    if (type === 'Run') return '🏃';
    if (type === 'Swim') return '🏊';
    return '🏅';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
