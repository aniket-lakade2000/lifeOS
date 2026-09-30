package org.arise.ifthenplan;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.arise.IntegrationTest;
import org.arise.goal.Area;
import org.arise.goal.dto.CreateGoalRequest;
import org.arise.ifthenplan.dto.CreateIfThenPlanRequest;
import org.arise.ifthenplan.dto.UpdateIfThenPlanRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class IfThenPlanControllerIT extends IntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private long createGoal() throws Exception {
        var r = new CreateGoalRequest("Goal for plans", null, Area.CAREER, (short) 1, null);
        String res = mockMvc.perform(post("/api/goals").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(r)))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).get("id").asLong();
    }

    @Test
    void fullCrudFlow() throws Exception {
        long goalId = createGoal();

        var create = new CreateIfThenPlanRequest("I skip 2 days", "Do 15 minutes");
        String res = mockMvc.perform(post("/api/goals/{goalId}/if-then-plans", goalId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.goalId").value(goalId))
                .andReturn().getResponse().getContentAsString();
        long planId = objectMapper.readTree(res).get("id").asLong();

        mockMvc.perform(get("/api/goals/{goalId}/if-then-plans", goalId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].planTrigger").value("I skip 2 days"));

        var update = new UpdateIfThenPlanRequest("I skip 3 days", "Do 5 minutes");
        mockMvc.perform(put("/api/goals/{goalId}/if-then-plans/{planId}", goalId, planId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planTrigger").value("I skip 3 days"));

        mockMvc.perform(delete("/api/goals/{goalId}/if-then-plans/{planId}", goalId, planId))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/goals/{goalId}/if-then-plans/{planId}", goalId, planId))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_goalNotFound_returns404() throws Exception {
        var create = new CreateIfThenPlanRequest("planTrigger", "response");
        mockMvc.perform(post("/api/goals/999999/if-then-plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isNotFound());
    }

    @Test
    void get_planBelongsToDifferentGoal_returns404() throws Exception {
        long goal1 = createGoal();
        long goal2 = createGoal();

        var create = new CreateIfThenPlanRequest("planTrigger", "response");
        String res = mockMvc.perform(post("/api/goals/{goalId}/if-then-plans", goal1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andReturn().getResponse().getContentAsString();
        long planId = objectMapper.readTree(res).get("id").asLong();

        mockMvc.perform(get("/api/goals/{goalId}/if-then-plans/{planId}", goal2, planId))
                .andExpect(status().isNotFound());
    }
}