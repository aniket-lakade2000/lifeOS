package org.arise.checkin;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.arise.AuthenticatedIntegrationTest;
import org.arise.checkin.dto.CreateCheckInRequest;
import org.arise.checkin.dto.UpdateCheckInRequest;
import org.arise.goal.Area;
import org.arise.goal.Goal;
import org.arise.goal.GoalRepository;
import org.arise.goal.GoalStatus;
import org.arise.goal.dto.CreateGoalRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class CheckInControllerIT extends AuthenticatedIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired GoalRepository goalRepository;

    private long createActiveGoal() throws Exception {
        var r = new CreateGoalRequest("Goal for check-ins", null, Area.CAREER, (short) 1, null);
        String res = mockMvc.perform(post("/api/goals").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(r)))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).get("id").asLong();
    }

    @Test
    void createCheckIn_defaultsToToday_returns201() throws Exception {
        long goalId = createActiveGoal();
        var body = new CreateCheckInRequest(null, true, "Did the thing");

        mockMvc.perform(post("/api/goals/{goalId}/check-ins", goalId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.checkDate").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.done").value(true));
    }

    @Test
    void createCheckIn_duplicateForSameDate_returns409() throws Exception {
        long goalId = createActiveGoal();
        var body = new CreateCheckInRequest(null, true, null);

        mockMvc.perform(post("/api/goals/{goalId}/check-ins", goalId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/goals/{goalId}/check-ins", goalId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    @Test
    void createCheckIn_futureDate_returns400() throws Exception {
        long goalId = createActiveGoal();
        var body = new CreateCheckInRequest(LocalDate.now().plusDays(1), true, null);

        mockMvc.perform(post("/api/goals/{goalId}/check-ins", goalId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCheckIn_goalNotActive_returns409() throws Exception {
        long goalId = createActiveGoal();
        Goal goal = goalRepository.findById(goalId).orElseThrow();
        goal.setStatus(GoalStatus.PAUSED);
        goalRepository.save(goal);

        var body = new CreateCheckInRequest(null, true, null);
        mockMvc.perform(post("/api/goals/{goalId}/check-ins", goalId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    @Test
    void updateCheckIn_today_succeeds() throws Exception {
        long goalId = createActiveGoal();
        var create = new CreateCheckInRequest(null, false, "Skipped");
        String res = mockMvc.perform(post("/api/goals/{goalId}/check-ins", goalId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(create)))
                .andReturn().getResponse().getContentAsString();
        long checkInId = objectMapper.readTree(res).get("id").asLong();

        var update = new UpdateCheckInRequest(true, "Actually did it later");
        mockMvc.perform(put("/api/goals/{goalId}/check-ins/{id}", goalId, checkInId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.done").value(true));
    }

    @Test
    void updateCheckIn_pastDate_returns409() throws Exception {
        long goalId = createActiveGoal();
        var create = new CreateCheckInRequest(LocalDate.now().minusDays(1), false, "Backfilled");
        String res = mockMvc.perform(post("/api/goals/{goalId}/check-ins", goalId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(create)))
                .andReturn().getResponse().getContentAsString();
        long checkInId = objectMapper.readTree(res).get("id").asLong();

        var update = new UpdateCheckInRequest(true, "Trying to rewrite history");
        mockMvc.perform(put("/api/goals/{goalId}/check-ins/{id}", goalId, checkInId)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isConflict());
    }

    @Test
    void getCheckIn_belongsToDifferentGoal_returns404() throws Exception {
        long goal1 = createActiveGoal();
        long goal2 = createActiveGoal();

        var create = new CreateCheckInRequest(null, true, null);
        String res = mockMvc.perform(post("/api/goals/{goalId}/check-ins", goal1)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(create)))
                .andReturn().getResponse().getContentAsString();
        long checkInId = objectMapper.readTree(res).get("id").asLong();

        mockMvc.perform(get("/api/goals/{goalId}/check-ins/{id}", goal2, checkInId))
                .andExpect(status().isNotFound());
    }
}