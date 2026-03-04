import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { Activity } from '../../models/activity.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtener todas las actividades del usuario
  getActivities(): Observable<Activity[]> {
    return this.http.get<any>(`${this.apiUrl}/activities`).pipe(
      map((response: any) => {
        // Si la respuesta tiene paginación devolvemos el content
        if (response && response.content) {
          return response.content;
        }
        // Si es un array directo lo devolvemos tal cual
        return response;
      })
    );
  }
  // Obtener una actividad por ID
  getActivity(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/activities/${id}`);
  }

  // Eliminar una actividad
  deleteActivity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/activities/${id}`);
  }
  getActivitiesPaginated(page: number, size: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/activities?page=${page}&size=${size}&sortBy=startDate&direction=desc`
    );
  }
}
