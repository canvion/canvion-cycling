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

    // Métricas básicas
    private Integer distance;
    private Integer movingTime;
    private Integer elapsedTime;
    private Integer totalElevationGain;

    // Velocidad
    private Float averageSpeed;
    private Float maxSpeed;

    // Frecuencia cardíaca
    private Integer averageHeartrate;
    private Integer maxHeartrate;

    // Potencia
    private Float averageWatts;
    private Integer maxWatts;


    private Float averageCadence;
    private Integer sufferScore;
    private Integer averageTemp;


    // Ruta
    private String summaryPolyline;
    private String detailedPolyline;

    // Otros
    private String description;
    private Integer calories;
    private Boolean isManual;
    private LocalDateTime createdAt;

    // Campos calculados
    private String distanceKm;
    private String duration;
    private String pace;
}