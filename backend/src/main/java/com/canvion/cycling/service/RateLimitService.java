package com.canvion.cycling.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Service
public class RateLimitService {

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    public boolean allowRequest(String identifier) {
        LocalDateTime now = LocalDateTime.now();
        RequestCounter counter = requestCounts.computeIfAbsent(identifier, k -> new RequestCounter());

        // Resetear si ha pasado un minuto
        if (counter.windowStart.plusMinutes(1).isBefore(now)) {
            counter.count = 0;
            counter.windowStart = now;
        }

        // Verificar límite
        if (counter.count >= MAX_REQUESTS_PER_MINUTE) {
            return false;
        }

        counter.count++;
        return true;
    }

    private static class RequestCounter {
        int count = 0;
        LocalDateTime windowStart = LocalDateTime.now();
    }
}