package com.canvion.cycling.service;

import com.canvion.cycling.dto.stats.StatsResponse;
import com.canvion.cycling.model.Activity;
import com.canvion.cycling.model.User;
import com.canvion.cycling.repository.ActivityRepository;
import com.canvion.cycling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ─────────────────────────────────────────
    // Semana actual (lunes → hoy)
    // ─────────────────────────────────────────
    public StatsResponse getWeeklyStats(String username) {
        User user = getUser(username);

        LocalDateTime now = LocalDateTime.now();
        // Retroceder hasta el lunes de esta semana
        LocalDateTime monday = now.minusDays(now.getDayOfWeek().getValue() - 1)
                .toLocalDate().atStartOfDay();

        List<Activity> activities = activityRepository.findByUserIdAndDeletedFalseAndStartDateBetween(user.getId(), monday, now);

        StatsResponse stats = new StatsResponse("week", "Esta semana");
        stats.setDateFrom(monday.format(DATE_FORMAT));
        stats.setDateTo(now.format(DATE_FORMAT));
        return calcular(stats, activities);
    }

    // ─────────────────────────────────────────
    // Mes actual (día 1 → hoy)
    // ─────────────────────────────────────────
    public StatsResponse getMonthlyStats(String username) {
        User user = getUser(username);

        LocalDateTime now = LocalDateTime.now();
        // Primer día del mes actual
        LocalDateTime primerDiaMes = now.toLocalDate()
                .withDayOfMonth(1).atStartOfDay();

        List<Activity> activities = activityRepository.findByUserIdAndDeletedFalseAndStartDateBetween(user.getId(), primerDiaMes, now);

        StatsResponse stats = new StatsResponse("month", "Este mes");
        stats.setDateFrom(primerDiaMes.format(DATE_FORMAT));
        stats.setDateTo(now.format(DATE_FORMAT));
        return calcular(stats, activities);
    }

    // ─────────────────────────────────────────
    // Año actual (1 enero → hoy)
    // ─────────────────────────────────────────
    public StatsResponse getYearlyStats(String username) {
        User user = getUser(username);

        LocalDateTime now = LocalDateTime.now();
        // Primer día del año actual
        LocalDateTime primerDiaAnio = now.toLocalDate()
                .withDayOfYear(1).atStartOfDay();

        List<Activity> activities = activityRepository.findByUserIdAndDeletedFalseAndStartDateBetween(user.getId(), primerDiaAnio, now);

        StatsResponse stats = new StatsResponse("year", "Este año");
        stats.setDateFrom(primerDiaAnio.format(DATE_FORMAT));
        stats.setDateTo(now.format(DATE_FORMAT));
        return calcular(stats, activities);
    }

    // ─────────────────────────────────────────
    // Lógica de cálculo (privado, reutilizable)
    // ─────────────────────────────────────────
    private StatsResponse calcular(StatsResponse stats, List<Activity> activities) {

        int totalSegundos = 0;
        int totalMetros = 0;
        int totalDesnivel = 0;

        for (Activity a : activities) {
            if (a.getMovingTime() != null)       totalSegundos += a.getMovingTime();
            if (a.getDistance() != null)          totalMetros   += a.getDistance();
            if (a.getTotalElevationGain() != null) totalDesnivel += a.getTotalElevationGain();
        }

        // Convertir metros a km con 2 decimales
        double km = Math.round(totalMetros / 10.0) / 100.0;

        // Formatear tiempo HH:MM:SS
        int horas   = totalSegundos / 3600;
        int minutos = (totalSegundos % 3600) / 60;
        int segundos = totalSegundos % 60;
        String tiempo = String.format("%02d:%02d:%02d", horas, minutos, segundos);

        stats.setTotalActivities(activities.size());
        stats.setTotalDistanceKm(km);
        stats.setTotalTime(tiempo);
        stats.setTotalElevation(totalDesnivel);

        return stats;
    }

    // ─────────────────────────────────────────
    // Helper usuario
    // ─────────────────────────────────────────
    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}