package org.arise.ifthenplan.dto;

import java.time.Instant;

public record IfThenPlanResponse(
        Long id,
        Long goalId,
        String trigger,
        String response,
        Instant createdAt,
        Instant updatedAt
) {}