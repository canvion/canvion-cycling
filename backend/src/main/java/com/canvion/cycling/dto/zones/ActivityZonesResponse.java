package com.canvion.cycling.dto.zones;

import java.util.List;

public class ActivityZonesResponse {

    private Long activityId;
    private String activityName;
    private Integer averageHeartrate;   // FC media de la actividad
    private Integer maxHeartrateUsed;   // FC máx configurada del usuario
    private int activeZone;             // zona donde estuvo (1-5)
    private String activeZoneName;      // nombre de esa zona
    private List<ZoneResult> allZones;  // las 5 zonas con rangos

    // Getters y setters
    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }

    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }

    public Integer getAverageHeartrate() { return averageHeartrate; }
    public void setAverageHeartrate(Integer averageHeartrate) { this.averageHeartrate = averageHeartrate; }

    public Integer getMaxHeartrateUsed() { return maxHeartrateUsed; }
    public void setMaxHeartrateUsed(Integer maxHeartrateUsed) { this.maxHeartrateUsed = maxHeartrateUsed; }

    public int getActiveZone() { return activeZone; }
    public void setActiveZone(int activeZone) { this.activeZone = activeZone; }

    public String getActiveZoneName() { return activeZoneName; }
    public void setActiveZoneName(String activeZoneName) { this.activeZoneName = activeZoneName; }

    public List<ZoneResult> getAllZones() { return allZones; }
    public void setAllZones(List<ZoneResult> allZones) { this.allZones = allZones; }
}