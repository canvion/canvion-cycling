package com.canvion.cycling.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "strava_activity_id", unique = true)
    private Long stravaActivityId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "distance")
    private Integer distance;

    @Column(name = "moving_time")
    private Integer movingTime;

    @Column(name = "elapsed_time")
    private Integer elapsedTime;

    @Column(name = "total_elevation_gain")
    private Integer totalElevationGain;

    @Column(name = "average_speed")
    private Float averageSpeed;

    @Column(name = "max_speed")
    private Float maxSpeed;

    @Column(name = "average_heartrate")
    private Integer averageHeartrate;

    @Column(name = "max_heartrate")
    private Integer maxHeartrate;

    @Column(name = "average_watts")
    private Float averageWatts;

    @Column(name = "max_watts")
    private Integer maxWatts;

    @Column(name = "average_cadence")
    private Float averageCadence;

    @Column(name = "suffer_score")
    private Integer sufferScore;

    @Column(name = "average_temp")
    private Integer averageTemp;

    @Column(name = "summary_polyline", columnDefinition = "TEXT")
    private String summaryPolyline;

    @Column(name = "detailed_polyline", columnDefinition = "TEXT")
    private String detailedPolyline;

    @Column(length = 500)
    private String description;

    @Column(name = "calories")
    private Integer calories;

    @Column(name = "is_manual", nullable = false)
    private Boolean isManual = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}