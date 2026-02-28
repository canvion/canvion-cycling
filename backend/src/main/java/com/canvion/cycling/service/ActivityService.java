package com.canvion.cycling.service;

import com.canvion.cycling.dto.activity.ActivityRequest;
import com.canvion.cycling.dto.activity.ActivityResponse;
import com.canvion.cycling.model.Activity;
import com.canvion.cycling.model.User;
import com.canvion.cycling.repository.ActivityRepository;
import com.canvion.cycling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ActivityResponse createActivity(ActivityRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Activity activity = new Activity();
        activity.setUser(user);
        activity.setName(request.getName());
        activity.setType(request.getType());
        activity.setStartDate(request.getStartDate());
        activity.setDistance(request.getDistance());
        activity.setMovingTime(request.getMovingTime());
        activity.setElapsedTime(request.getElapsedTime());
        activity.setTotalElevationGain(request.getTotalElevationGain());
        activity.setAverageSpeed(request.getAverageSpeed());
        activity.setMaxSpeed(request.getMaxSpeed());
        activity.setAverageHeartrate(request.getAverageHeartrate());
        activity.setMaxHeartrate(request.getMaxHeartrate());
        activity.setAverageWatts(request.getAverageWatts());
        activity.setMaxWatts(request.getMaxWatts());
        activity.setDescription(request.getDescription());
        activity.setCalories(request.getCalories());
        activity.setIsManual(true);

        Activity savedActivity = activityRepository.save(activity);
        return mapToResponse(savedActivity);
    }

    public List<ActivityResponse> getUserActivities(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return activityRepository.findByUserOrderByStartDateDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivityById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));

        // Verificar que la actividad pertenece al usuario autenticado
        if (!activity.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso para acceder a esta actividad");
        }

        return mapToResponse(activity);
    }

    public void deleteActivity(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));

        // Verificar que la actividad pertenece al usuario autenticado
        if (!activity.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar esta actividad");
        }

        activityRepository.delete(activity);
    }

    public ActivityResponse updateActivity(Long id, ActivityRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));

        // Verificar que la actividad pertenece al usuario autenticado
        if (!activity.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso para modificar esta actividad");
        }

        // Actualizar campos
        activity.setName(request.getName());
        activity.setType(request.getType());
        activity.setStartDate(request.getStartDate());
        activity.setDistance(request.getDistance());
        activity.setMovingTime(request.getMovingTime());
        activity.setElapsedTime(request.getElapsedTime());
        activity.setTotalElevationGain(request.getTotalElevationGain());
        activity.setAverageSpeed(request.getAverageSpeed());
        activity.setMaxSpeed(request.getMaxSpeed());
        activity.setAverageHeartrate(request.getAverageHeartrate());
        activity.setMaxHeartrate(request.getMaxHeartrate());
        activity.setAverageWatts(request.getAverageWatts());
        activity.setMaxWatts(request.getMaxWatts());
        activity.setDescription(request.getDescription());
        activity.setCalories(request.getCalories());

        Activity updatedActivity = activityRepository.save(activity);
        return mapToResponse(updatedActivity);
    }

    private ActivityResponse mapToResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setUserId(activity.getUser().getId());
        response.setStravaActivityId(activity.getStravaActivityId());
        response.setName(activity.getName());
        response.setType(activity.getType());
        response.setStartDate(activity.getStartDate());
        response.setDistance(activity.getDistance());
        response.setMovingTime(activity.getMovingTime());
        response.setElapsedTime(activity.getElapsedTime());
        response.setTotalElevationGain(activity.getTotalElevationGain());
        response.setAverageSpeed(activity.getAverageSpeed());
        response.setMaxSpeed(activity.getMaxSpeed());
        response.setAverageHeartrate(activity.getAverageHeartrate());
        response.setMaxHeartrate(activity.getMaxHeartrate());
        response.setAverageWatts(activity.getAverageWatts());
        response.setMaxWatts(activity.getMaxWatts());
        response.setAverageCadence(activity.getAverageCadence());
        response.setSufferScore(activity.getSufferScore());
        response.setAverageTemp(activity.getAverageTemp());
        response.setSummaryPolyline(activity.getSummaryPolyline());
        response.setDescription(activity.getDescription());
        response.setCalories(activity.getCalories());
        response.setIsManual(activity.getIsManual());
        response.setCreatedAt(activity.getCreatedAt());

        // Calcular campos formateados
        if (activity.getDistance() != null) {
            response.setDistanceKm(String.format("%.2f km", activity.getDistance() / 1000.0));
        }

        if (activity.getMovingTime() != null) {
            int hours = activity.getMovingTime() / 3600;
            int minutes = (activity.getMovingTime() % 3600) / 60;
            int seconds = activity.getMovingTime() % 60;
            response.setDuration(String.format("%02d:%02d:%02d", hours, minutes, seconds));
        }

        if (activity.getDistance() != null && activity.getMovingTime() != null && activity.getMovingTime() > 0) {
            double paceMinPerKm = (activity.getMovingTime() / 60.0) / (activity.getDistance() / 1000.0);
            int paceMin = (int) paceMinPerKm;
            int paceSec = (int) ((paceMinPerKm - paceMin) * 60);
            response.setPace(String.format("%d:%02d min/km", paceMin, paceSec));
        }

        return response;
    }
}