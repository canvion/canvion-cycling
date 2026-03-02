package com.canvion.cycling.controller;

import com.canvion.cycling.dto.stats.StatsResponse;
import com.canvion.cycling.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    // GET /api/stats → los 3 períodos de una vez
    @GetMapping
    public ResponseEntity<Map<String, StatsResponse>> getAllStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(Map.of(
                "week",  statsService.getWeeklyStats(username),
                "month", statsService.getMonthlyStats(username),
                "year",  statsService.getYearlyStats(username)
        ));
    }

    // GET /api/stats/weekly
    @GetMapping("/weekly")
    public ResponseEntity<StatsResponse> getWeekly() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(statsService.getWeeklyStats(username));
    }

    // GET /api/stats/monthly
    @GetMapping("/monthly")
    public ResponseEntity<StatsResponse> getMonthly() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(statsService.getMonthlyStats(username));
    }

    // GET /api/stats/yearly
    @GetMapping("/yearly")
    public ResponseEntity<StatsResponse> getYearly() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(statsService.getYearlyStats(username));
    }
}