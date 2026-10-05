package org.arise;

import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcBuilderCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;

@Import(AuthenticatedIntegrationTest.DefaultAuthConfig.class)
public abstract class AuthenticatedIntegrationTest extends IntegrationTest {

    @TestConfiguration
    static class DefaultAuthConfig {
        @Bean
        MockMvcBuilderCustomizer defaultAuthCustomizer() {
            return builder -> builder.defaultRequest(
                    MockMvcRequestBuilders.get("/").with(httpBasic("testuser", "testpass"))
            );
        }
    }
}