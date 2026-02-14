package com.canvion.cycling.dto.activity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityRequest {
    
    @NotBlank(message = "El nombre de la actividad es obligatorio")
    @Size(max = 200, message = "El nombre no puede superar los 200 caracteres")
    private String name;
    
    @NotBlank(message = "El tipo de actividad es obligatorio")
    private String type; // Ride, Run, Swim, etc.
    
    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDateTime startDate;
    
    @Positive(message = "La distancia debe ser positiva")
    private Integer distance; // En metros
    
    @Positive(message = "El tiempo en movimiento debe ser positivo")
    private Integer movingTime; // En segundos
    
    private Integer elapsedTime;
    
    private Integer totalElevationGain;
    
    private Float averageSpeed;
    
    private Float maxSpeed;
    
    private Integer averageHeartrate;
    
    private Integer maxHeartrate;
    
    private Float averageWatts;
    
    private Integer maxWatts;
    
    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String description;
    
    private Integer calories;
}
