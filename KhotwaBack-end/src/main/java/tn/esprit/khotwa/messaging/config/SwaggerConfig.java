package tn.esprit.khotwa.messaging.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Khotwa Messaging API")
                        .version("1.0")
                        .description("API for Module 7 - Messaging, Notifications and Feedback"));
    }
}
