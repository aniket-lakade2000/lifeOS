package org.arise.goal;

import org.arise.goal.dto.CreateGoalRequest;
import org.arise.goal.dto.GoalResponse;
import org.arise.goal.dto.UpdateGoalRequest;

public final class GoalMapper {
    private GoalMapper() {}

    public static Goal toEntity(CreateGoalRequest r) {
        Goal g = new Goal();
        g.setTitle(r.title());
        g.setDescription(r.description());
        g.setArea(r.area());
        g.setPriority(r.priority());
        g.setNextAction(r.nextAction());
        g.setStatus(GoalStatus.ACTIVE);
        return g;
    }

    public static void applyUpdate(Goal g, UpdateGoalRequest r) {
        g.setTitle(r.title());
        g.setDescription(r.description());
        g.setPriority(r.priority());
        g.setNextAction(r.nextAction());
    }

    public static GoalResponse toResponse(Goal g) {
        return new GoalResponse(g.getId(), g.getTitle(), g.getDescription(), g.getArea(),
                g.getPriority(), g.getStatus(), g.getNextAction(), g.getCreatedAt(), g.getUpdatedAt());
    }
}
