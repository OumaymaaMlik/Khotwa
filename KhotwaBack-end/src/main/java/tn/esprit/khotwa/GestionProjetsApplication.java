package tn.esprit.khotwa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GestionProjetsApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionProjetsApplication.class, args);
    }
}
