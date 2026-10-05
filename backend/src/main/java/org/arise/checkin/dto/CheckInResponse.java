package org.arise.checkin.dto;

import java.time.Instant;
import java.time.LocalDate;

public record CheckInResponse(
        Long id,
        Long goalId,
        LocalDate checkDate,
        boolean done,
        String note,
        Instant createdAt,
        Instant updatedAt
) {}