package org.arise;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.arise.goal.Area;
import org.arise.goal.GoalRepository;
import org.arise.goal.dto.CreateGoalRequest;
import org.arise.goal.dto.UpdateGoalRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class GoalControllerIT extends IntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired
    GoalRepository goalRepository;

    @Test
    void createGoal_blankTitle_returns400() throws Exception {
        var r = new CreateGoalRequest("", null, Area.CAREER, (short)1, null);
        mockMvc.perform(post("/api/goals").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[0].field").value("title"));
    }

    @Test
    void getGoal_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/goals/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Goal not found: 999999"));
    }

    @Test
    void getGoal_nonNumericId_returns400() throws Exception {
        mockMvc.perform(get("/api/goals/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid value for parameter 'id'"));
    }

    @Test
    void createGoal_malformedJson_returns400() throws Exception {
        mockMvc.perform(post("/api/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"title\": \"Missing closing brace\" "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed request body"));
    }

    @Test
    void createGoal_exceedsMaxActive_returns409() throws Exception {
        goalRepository.deleteAll();
        for (int i = 0; i < 3; i++) {
            var r = new CreateGoalRequest("Goal " + i, null, Area.CAREER, (short) 1, null);
            mockMvc.perform(post("/api/goals").contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(r)))
                    .andExpect(status().isCreated());
        }

        var fourth = new CreateGoalRequest("Goal 4", null, Area.CAREER, (short) 1, null);
        mockMvc.perform(post("/api/goals").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fourth)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Cannot have more than 3 active goals"));
    }

    @Test
    void fullCrudFlow() throws Exception {
        goalRepository.deleteAll();
        var create = new CreateGoalRequest("Learn LLD", null, Area.CAREER, (short)2, "Read book");
        String res = mockMvc.perform(post("/api/goals").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(res).get("id").asLong();

        mockMvc.perform(get("/api/goals/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Learn LLD"));

        var update = new UpdateGoalRequest("Learn LLD deeply", null, (short)1, "Read chapter 2");
        mockMvc.perform(put("/api/goals/{id}", id).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority").value(1));

        mockMvc.perform(delete("/api/goals/{id}", id)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/goals/{id}", id)).andExpect(status().isNotFound());
    }
}