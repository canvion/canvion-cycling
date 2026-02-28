import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ActivityService } from '../../core/services/activity.service';
import { AuthService } from '../../core/services/auth.service';
import { Activity } from '../../models/activity.model';
import { SpinnerComponent } from '../../shared/spinner.component';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './records.html',
  styleUrl: './records.css'
})
export class Records implements OnInit {

  username: string = '';
  isLoading: boolean = true;

  // Récords
  longestRide: Activity | null = null;
  highestElevation: Activity | null = null;
  fastestRide: Activity | null = null;
  mostCalories: Activity | null = null;
  highestWatts: Activity | null = null;
  highestHeartrate: Activity | null = null;
  fastestSpeed: Activity | null = null;

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.loadRecords();
  }

  loadRecords(): void {
    this.activityService.getActivities().subscribe({
      next: (data: Activity[]) => {
        // Solo actividades de ciclismo para los récords
        const rides = data.filter(a => a.type === 'Ride');

        if (rides.length === 0) {
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        // Calculamos cada récord
        this.longestRide = rides.reduce((max, a) => a.distance > max.distance ? a : max);
        this.highestElevation = rides.reduce((max, a) => a.totalElevationGain > max.totalElevationGain ? a : max);
        this.fastestRide = rides.reduce((max, a) => a.averageSpeed > max.averageSpeed ? a : max);
        // Velocidad punta
        this.fastestSpeed = rides.reduce((max, a) => a.maxSpeed > max.maxSpeed ? a : max);

        // Estos pueden ser null si no tienen datos
        const withCalories = rides.filter(a => a.calories > 0);
        if (withCalories.length > 0) {
          this.mostCalories = withCalories.reduce((max, a) => a.calories > max.calories ? a : max);
        }

        const withWatts = rides.filter(a => a.averageWatts > 0);
        if (withWatts.length > 0) {
          this.highestWatts = withWatts.reduce((max, a) => a.averageWatts > max.averageWatts ? a : max);
        }

        const withHR = rides.filter(a => a.maxHeartrate > 0);
        if (withHR.length > 0) {
          this.highestHeartrate = withHR.reduce((max, a) => a.maxHeartrate > max.maxHeartrate ? a : max);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando récords', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatKm(distance: number): string {
    return (distance / 1000).toFixed(1);
  }

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
