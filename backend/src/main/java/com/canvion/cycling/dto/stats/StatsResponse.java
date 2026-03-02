package com.canvion.cycling.dto.stats;

public class StatsResponse {

    private String period;           // "week", "month", "year"
    private String periodLabel;      // "Esta semana", "Este mes", "Este año"
    private int totalActivities;     // número de actividades
    private double totalDistanceKm;  // distancia en km (redondeado 2 decimales)
    private String totalTime;        // "HH:MM:SS" formateado
    private int totalElevation;      // desnivel en metros
    private String dateFrom;         // fecha inicio del período
    private String dateTo;           // fecha fin del período

    public StatsResponse(String period, String periodLabel) {
        this.period = period;
        this.periodLabel = periodLabel;
    }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getPeriodLabel() { return periodLabel; }
    public void setPeriodLabel(String periodLabel) { this.periodLabel = periodLabel; }

    public int getTotalActivities() { return totalActivities; }
    public void setTotalActivities(int totalActivities) { this.totalActivities = totalActivities; }

    public double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public String getTotalTime() { return totalTime; }
    public void setTotalTime(String totalTime) { this.totalTime = totalTime; }

    public int getTotalElevation() { return totalElevation; }
    public void setTotalElevation(int totalElevation) { this.totalElevation = totalElevation; }

    public String getDateFrom() { return dateFrom; }
    public void setDateFrom(String dateFrom) { this.dateFrom = dateFrom; }

    public String getDateTo() { return dateTo; }
    public void setDateTo(String dateTo) { this.dateTo = dateTo; }
}