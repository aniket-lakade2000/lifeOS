package org.arise.checkin;

import org.arise.checkin.dto.CreateCheckInRequest;
import org.arise.checkin.dto.CheckInResponse;
import org.arise.checkin.dto.UpdateCheckInRequest;
import org.arise.goal.Goal;

import java.time.LocalDate;

public final class CheckInMapper {
    private CheckInMapper() {}

    public static CheckIn toEntity(CreateCheckInRequest r, Goal goal, LocalDate resolvedDate) {
        CheckIn c = new CheckIn();
        c.setGoal(goal);
        c.setCheckDate(resolvedDate);
        c.setDone(r.done());
        c.setNote(r.note());
        return c;
    }

    public static void applyUpdate(CheckIn c, UpdateCheckInRequest r) {
        c.setDone(r.done());
        c.setNote(r.note());
    }

    public static CheckInResponse toResponse(CheckIn c) {
        return new CheckInResponse(c.getId(), c.getGoal().getId(), c.getCheckDate(),
                c.isDone(), c.getNote(), c.getCreatedAt(), c.getUpdatedAt());
    }
}