package com.canvion.cycling.dto.zones;

public class ZoneResult {

    private int zoneNumber;       // 1, 2, 3, 4, 5
    private String zoneName;      // "Base aeróbica", "Tempo"...
    private int minBpm;           // FC mínima de la zona
    private int maxBpm;           // FC máxima de la zona
    private String description;   // descripción del efecto
    private boolean isActive;     // si la actividad estuvo en esta zona

    public ZoneResult(int zoneNumber, String zoneName, int minBpm, int maxBpm, String description) {
        this.zoneNumber = zoneNumber;
        this.zoneName = zoneName;
        this.minBpm = minBpm;
        this.maxBpm = maxBpm;
        this.description = description;
        this.isActive = false;
    }

    // Getters y setters
    public int getZoneNumber() { return zoneNumber; }
    public String getZoneName() { return zoneName; }
    public int getMinBpm() { return minBpm; }
    public int getMaxBpm() { return maxBpm; }
    public String getDescription() { return description; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}