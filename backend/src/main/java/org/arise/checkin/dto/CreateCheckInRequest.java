package org.arise.checkin.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateCheckInRequest(
        LocalDate checkDate,
        @NotNull boolean done,
        @Size(max = 500) String note
) {}
