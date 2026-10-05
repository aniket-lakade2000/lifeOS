package org.arise.checkin.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateCheckInRequest(
        @NotNull Boolean done,
        @Size(max = 500) String note
) {}