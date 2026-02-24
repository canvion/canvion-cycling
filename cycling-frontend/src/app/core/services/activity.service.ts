import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity, ActivityRequest } from '../../models/activity.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtener todas las actividades del usuario
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/activities`);
  }

  // Obtener una actividad por ID
  getActivity(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/activities/${id}`);
  }

  // Crear una actividad nueva
  createActivity(data: ActivityRequest): Observable<Activity> {
    return this.http.post<Activity>(`${this.apiUrl}/activities`, data);
  }

  // Editar una actividad existente
  updateActivity(id: number, data: ActivityRequest): Observable<Activity> {
    return this.http.put<Activity>(`${this.apiUrl}/activities/${id}`, data);
  }

  // Eliminar una actividad
  deleteActivity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/activities/${id}`);
  }
}
