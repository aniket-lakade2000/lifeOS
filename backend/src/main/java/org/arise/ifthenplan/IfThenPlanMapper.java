package org.arise.ifthenplan;

import org.arise.goal.Goal;
import org.arise.ifthenplan.dto.CreateIfThenPlanRequest;
import org.arise.ifthenplan.dto.IfThenPlanResponse;
import org.arise.ifthenplan.dto.UpdateIfThenPlanRequest;

public final class IfThenPlanMapper {
    private IfThenPlanMapper() {}

    public static IfThenPlan toEntity(CreateIfThenPlanRequest r, Goal goal) {
        IfThenPlan p = new IfThenPlan();
        p.setGoal(goal);
        p.setTrigger(r.trigger());
        p.setResponse(r.response());
        return p;
    }

    public static void applyUpdate(IfThenPlan p, UpdateIfThenPlanRequest r) {
        p.setTrigger(r.trigger());
        p.setResponse(r.response());
    }

    public static IfThenPlanResponse toResponse(IfThenPlan p) {
        return new IfThenPlanResponse(p.getId(), p.getGoal().getId(), p.getTrigger(),
                p.getResponse(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
