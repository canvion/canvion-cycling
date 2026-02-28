package com.canvion.cycling.dto.strava;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StravaActivity {

    private Long id;

    private String name;

    private String type;

    @JsonProperty("start_date")
    private ZonedDateTime startDate;

    @JsonProperty("distance")
    private Float distance;

    @JsonProperty("moving_time")
    private Integer movingTime;

    @JsonProperty("elapsed_time")
    private Integer elapsedTime;

    @JsonProperty("total_elevation_gain")
    private Float totalElevationGain;

    @JsonProperty("average_speed")
    private Float averageSpeed;

    @JsonProperty("max_speed")
    private Float maxSpeed;

    @JsonProperty("average_heartrate")
    private Float averageHeartrate;

    @JsonProperty("max_heartrate")
    private Float maxHeartrate;

    @JsonProperty("average_watts")
    private Float averageWatts;

    @JsonProperty("max_watts")
    private Integer maxWatts;

    @JsonProperty("kilojoules")
    private Float kilojoules;

    @JsonProperty("description")
    private String description;

    @JsonProperty("calories")
    private Float calories;

    @JsonProperty("map")
    private StravaMap map;


    @JsonProperty("average_cadence")
    private Float averageCadence;

    @JsonProperty("suffer_score")
    private Integer sufferScore;

    @JsonProperty("average_temp")
    private Integer averageTemp;
}