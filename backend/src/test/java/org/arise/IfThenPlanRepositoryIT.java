package org.arise;

import org.arise.goal.Area;
import org.arise.goal.Goal;
import org.arise.goal.GoalRepository;
import org.arise.goal.GoalStatus;
import org.arise.ifthenplan.IfThenPlan;
import org.arise.ifthenplan.IfThenPlanRepository;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class IfThenPlanRepositoryIT extends IntegrationTest {
    @Autowired
    IfThenPlanRepository ifThenPlanRepository;

    @Autowired
    GoalRepository goalRepository;

    @Test
    public void savesAndLoadsAPlanLinkedToAGoal() {
        Goal goal = new Goal("Ship lifeOS v0.1", null,Area.CAREER, (short) 1, "Write integration tests");
        Goal savedGoal = goalRepository.save(goal);

        IfThenPlan plan = new IfThenPlan();
        plan.setGoal(savedGoal);
        plan.setPlanTrigger("I skip 2 days in a row");
        plan.setResponse("Do 15 minutes of the smallest next action");
        ifThenPlanRepository.save(plan);

        List<IfThenPlan> plans = ifThenPlanRepository.findByGoalId(savedGoal.getId());
        assertThat(plans).hasSize(1);
        assertThat(plans.get(0).getPlanTrigger()).isEqualTo("I skip 2 days in a row");
    }
}
