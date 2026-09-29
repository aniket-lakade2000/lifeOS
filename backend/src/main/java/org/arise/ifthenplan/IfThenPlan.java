package org.arise.ifthenplan;

import jakarta.persistence.*;
import org.arise.common.BaseEntity;
import org.arise.goal.Goal;
import org.hibernate.sql.results.graph.Fetch;

import java.time.Instant;

@Entity
@Table(name = "if_then_plans")
public class IfThenPlan extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(nullable = false)
    private String planTrigger;

    @Column(nullable = false)
    private String response;

    // getters and setters
    public Long getId() { return id; }
    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }
    public String getPlanTrigger() { return planTrigger; }
    public void setPlanTrigger(String trigger) { this.planTrigger = trigger; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

}
