package org.arise.checkin;

import jakarta.persistence.*;
import org.arise.common.BaseEntity;
import org.arise.goal.Goal;

import java.time.LocalDate;


@Entity
@Table(name = "check_ins")
public class CheckIn extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(name = "check_date", nullable = false)
    private LocalDate checkDate;

    @Column(nullable = false)
    private boolean done;

    @Column(length = 500)
    private String note;

    public Long getId() { return id; }
    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }
    public LocalDate getCheckDate() { return checkDate; }
    public void setCheckDate(LocalDate checkDate) { this.checkDate = checkDate; }
    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
