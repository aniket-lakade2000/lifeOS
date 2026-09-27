package org.arise.ifthenplan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IfThenPlanRepository extends JpaRepository<IfThenPlan, Long> {
    List<IfThenPlan> findByGoalId(Long goalId);
}
