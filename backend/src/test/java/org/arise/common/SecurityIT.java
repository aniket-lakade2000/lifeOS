package org.arise.common;

import org.arise.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityIT extends IntegrationTest {

    @Autowired MockMvc mockMvc;

    @Test
    void apiEndpoint_withoutCredentials_returns401() throws Exception {
        mockMvc.perform(get("/api/goals")).andExpect(status().isUnauthorized());
    }

    @Test
    void apiEndpoint_withWrongCredentials_returns401() throws Exception {
        mockMvc.perform(get("/api/goals").with(httpBasic("testuser", "wrongpassword")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void apiEndpoint_withCorrectCredentials_returns200() throws Exception {
        mockMvc.perform(get("/api/goals").with(httpBasic("testuser", "testpass")))
                .andExpect(status().isOk());
    }
}