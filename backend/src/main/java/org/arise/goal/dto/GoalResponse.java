package org.arise.goal.dto;

import org.arise.goal.Area;
import org.arise.goal.GoalStatus;

import java.time.Instant;

public record GoalResponse(
        Long id,
        String title,
        String description,
        Area area,
        Short priority,
        GoalStatus status,
        String nextAction,
        Instant createdAt,
        Instant updatedAt
) {
}
