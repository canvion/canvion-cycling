package com.canvion.cycling.dto.zones;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ZoneConfigRequest {

    @NotNull(message = "La FC máxima es obligatoria")
    @Min(value = 100, message = "Mínimo 100")
    @Max(value = 220, message = "Máximo 220")
    private Integer maxHeartrate;

    public Integer getMaxHeartrate() { return maxHeartrate; }
    public void setMaxHeartrate(Integer maxHeartrate) { this.maxHeartrate = maxHeartrate; }
}