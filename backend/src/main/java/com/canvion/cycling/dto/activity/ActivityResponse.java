package com.canvion.cycling.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    
    private Long id;
    private Long userId;
    private Long stravaActivityId;
    private String name;
    private String type;
    private LocalDateTime startDate;
    private Integer distance; // En metros
    private Integer movingTime; // En segundos
    private Integer elapsedTime;
    private Integer totalElevationGain;
    private Float averageSpeed;
    private Float maxSpeed;
    private Integer averageHeartrate;
    private Integer maxHeartrate;
    private Float averageWatts;
    private Integer maxWatts;
    private String summaryPolyline;
    private String description;
    private Integer calories;
    private Boolean isManual;
    private LocalDateTime createdAt;
    
    // Campos calculados útiles para el frontend
    private String distanceKm; // Distancia en km formateada
    private String duration; // Duración formateada HH:MM:SS
    private String pace; // Ritmo formateado min/km
}
