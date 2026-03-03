package com.canvion.cycling.service;

import com.canvion.cycling.dto.strava.StravaActivity;
import com.canvion.cycling.dto.strava.StravaTokenResponse;
import com.canvion.cycling.model.Activity;
import com.canvion.cycling.model.User;
import com.canvion.cycling.repository.ActivityRepository;
import com.canvion.cycling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StravaService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final EncryptionService encryptionService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${strava.client.id}")
    private String clientId;

    @Value("${strava.client.secret}")
    private String clientSecret;

    @Value("${strava.redirect.uri}")
    private String redirectUri;

    @Value("${strava.oauth.url}")
    private String oauthUrl;

    @Value("${strava.token.url}")
    private String tokenUrl;

    @Value("${strava.api.base.url}")
    private String apiBaseUrl;

    public String getAuthorizationUrl(String username) {
        return UriComponentsBuilder.fromUriString(oauthUrl)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "read,activity:read_all")
                .queryParam("state", username)
                .toUriString();
    }

    public void connectStrava(String code, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Intercambiar código por tokens
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("client_id", clientId);
        requestBody.put("client_secret", clientSecret);
        requestBody.put("code", code);
        requestBody.put("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<StravaTokenResponse> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                StravaTokenResponse.class
        );

        StravaTokenResponse tokenResponse = response.getBody();
        if (tokenResponse == null) {
            throw new RuntimeException("Error al obtener tokens de Strava");
        }

        // Guardar tokens encriptados
        user.setStravaAccessToken(encryptionService.encrypt(tokenResponse.getAccessToken()));
        user.setStravaRefreshToken(encryptionService.encrypt(tokenResponse.getRefreshToken()));
        user.setStravaTokenExpiresAt(
                LocalDateTime.ofInstant(
                        java.time.Instant.ofEpochSecond(tokenResponse.getExpiresAt()),
                        ZoneId.systemDefault()
                )
        );
        user.setStravaAthleteId(tokenResponse.getAthlete().getId());
        user.setIsStravaConnected(true);

        userRepository.save(user);
    }

    public void disconnectStrava(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setStravaAccessToken(null);
        user.setStravaRefreshToken(null);
        user.setStravaTokenExpiresAt(null);
        user.setStravaAthleteId(null);
        user.setIsStravaConnected(false);

        userRepository.save(user);
    }

    public List<Activity> syncActivities(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!Boolean.TRUE.equals(user.getIsStravaConnected())) {
            throw new RuntimeException("Usuario no conectado a Strava");
        }

        // Verificar si el token ha expirado y renovarlo si es necesario
        if (user.getStravaTokenExpiresAt().isBefore(LocalDateTime.now())) {
            refreshAccessToken(user);
        }

        // Obtener actividades de Strava
        String accessToken = encryptionService.decrypt(user.getStravaAccessToken());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> request = new HttpEntity<>(headers);

        String activitiesUrl = apiBaseUrl + "/athlete/activities?per_page=30";

        ResponseEntity<List<StravaActivity>> response = restTemplate.exchange(
                activitiesUrl,
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<List<StravaActivity>>() {}
        );

        // ========================================
        // SOLO UNA VEZ - aquí obtenemos el body
        // ========================================
        List<StravaActivity> stravaActivities = response.getBody();

        if (stravaActivities == null || stravaActivities.isEmpty()) {
            return List.of();
        }

        // Guardar actividades que no existan
        List<Activity> newActivities = stravaActivities.stream()
                .filter(sa -> !activityRepository.existsByStravaActivityId(sa.getId()))
                .map(sa -> mapStravaActivityToActivity(sa, user))
                .toList();

        return activityRepository.saveAll(newActivities);
    }

    private void refreshAccessToken(User user) {
        String refreshToken = encryptionService.decrypt(user.getStravaRefreshToken());

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("client_id", clientId);
        requestBody.put("client_secret", clientSecret);
        requestBody.put("grant_type", "refresh_token");
        requestBody.put("refresh_token", refreshToken);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<StravaTokenResponse> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                StravaTokenResponse.class
        );

        StravaTokenResponse tokenResponse = response.getBody();
        if (tokenResponse == null) {
            throw new RuntimeException("Error al renovar token de Strava");
        }

        user.setStravaAccessToken(encryptionService.encrypt(tokenResponse.getAccessToken()));
        user.setStravaRefreshToken(encryptionService.encrypt(tokenResponse.getRefreshToken()));
        user.setStravaTokenExpiresAt(
                LocalDateTime.ofInstant(
                        java.time.Instant.ofEpochSecond(tokenResponse.getExpiresAt()),
                        ZoneId.systemDefault()
                )
        );

        userRepository.save(user);
    }

    private Activity mapStravaActivityToActivity(StravaActivity sa, User user) {
        Activity activity = new Activity();
        activity.setUser(user);
        activity.setStravaActivityId(sa.getId());
        activity.setName(sa.getName());
        activity.setType(sa.getType());
        activity.setStartDate(sa.getStartDate().toLocalDateTime());
        activity.setDistance(sa.getDistance() != null ? sa.getDistance().intValue() : null);
        activity.setMovingTime(sa.getMovingTime());
        activity.setElapsedTime(sa.getElapsedTime());
        activity.setTotalElevationGain(sa.getTotalElevationGain() != null ? sa.getTotalElevationGain().intValue() : null);
        activity.setAverageSpeed(sa.getAverageSpeed());
        activity.setMaxSpeed(sa.getMaxSpeed());
        activity.setAverageHeartrate(sa.getAverageHeartrate() != null ? sa.getAverageHeartrate().intValue() : null);
        activity.setMaxHeartrate(sa.getMaxHeartrate() != null ? sa.getMaxHeartrate().intValue() : null);
        activity.setAverageWatts(sa.getAverageWatts());
        activity.setMaxWatts(sa.getMaxWatts());

        activity.setAverageCadence(sa.getAverageCadence());
        activity.setSufferScore(sa.getSufferScore());
        activity.setAverageTemp(sa.getAverageTemp());

        activity.setDescription(sa.getDescription());
        activity.setCalories(sa.getCalories() != null ? sa.getCalories().intValue() : null);
        activity.setIsManual(false);

        if (sa.getMap() != null) {
            activity.setSummaryPolyline(sa.getMap().getSummaryPolyline());
            activity.setDetailedPolyline(sa.getMap().getPolyline());
        }

        return activity;
    }

    // Descargar UNA actividad de Strava y guardarla en BD
    public void fetchAndSaveActivity(User user, Long stravaActivityId) {

        // Renovar token si ha expirado
        if (user.getStravaTokenExpiresAt().isBefore(LocalDateTime.now())) {
            refreshAccessToken(user);
        }

        String accessToken = encryptionService.decrypt(user.getStravaAccessToken());

        // Llamar a la API de Strava para obtener esa actividad concreta
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> request = new HttpEntity<>(headers);

        String url = apiBaseUrl + "/activities/" + stravaActivityId;

        ResponseEntity<StravaActivity> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                StravaActivity.class
        );

        StravaActivity stravaActivity = response.getBody();
        if (stravaActivity == null) {
            throw new RuntimeException("Strava no devolvió la actividad " + stravaActivityId);
        }

        // Reutilizamos el método que ya tenías
        Activity activity = mapStravaActivityToActivity(stravaActivity, user);
        activityRepository.save(activity);
    }

    // Actualizar una actividad ya existente con datos frescos de Strava
    public void fetchAndUpdateActivity(User user, Long stravaActivityId, Activity existing) {

        if (user.getStravaTokenExpiresAt().isBefore(LocalDateTime.now())) {
            refreshAccessToken(user);
        }

        String accessToken = encryptionService.decrypt(user.getStravaAccessToken());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> request = new HttpEntity<>(headers);

        String url = apiBaseUrl + "/activities/" + stravaActivityId;

        ResponseEntity<StravaActivity> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                StravaActivity.class
        );

        StravaActivity sa = response.getBody();
        if (sa == null) {
            throw new RuntimeException("Strava no devolvió la actividad " + stravaActivityId);
        }

        // Actualizar campos de la actividad existente
        existing.setName(sa.getName());
        existing.setDistance(sa.getDistance() != null ? sa.getDistance().intValue() : null);
        existing.setMovingTime(sa.getMovingTime());
        existing.setElapsedTime(sa.getElapsedTime());
        existing.setTotalElevationGain(sa.getTotalElevationGain() != null ? sa.getTotalElevationGain().intValue() : null);
        existing.setAverageSpeed(sa.getAverageSpeed());
        existing.setMaxSpeed(sa.getMaxSpeed());
        existing.setAverageHeartrate(sa.getAverageHeartrate() != null ? sa.getAverageHeartrate().intValue() : null);
        existing.setMaxHeartrate(sa.getMaxHeartrate() != null ? sa.getMaxHeartrate().intValue() : null);
        existing.setAverageWatts(sa.getAverageWatts());
        existing.setMaxWatts(sa.getMaxWatts());
        existing.setAverageCadence(sa.getAverageCadence());
        existing.setSufferScore(sa.getSufferScore());
        existing.setAverageTemp(sa.getAverageTemp());
        existing.setDescription(sa.getDescription());
        existing.setCalories(sa.getCalories() != null ? sa.getCalories().intValue() : null);

        if (sa.getMap() != null) {
            existing.setSummaryPolyline(sa.getMap().getSummaryPolyline());
            existing.setDetailedPolyline(sa.getMap().getPolyline());
        }

        activityRepository.save(existing);
    }
}