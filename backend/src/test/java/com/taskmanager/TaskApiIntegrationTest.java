package com.taskmanager;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.entity.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void registerAndLogin() throws Exception {
        String email = "zuber+" + System.nanoTime() + "@test.com";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("Zuber", email, "password123"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty());

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest(email, "password123"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        token = objectMapper.readTree(body).get("token").asText();
    }

    @Test
    void refuse_l_acces_aux_taches_sans_token() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refuse_un_enregistrement_avec_un_email_invalide() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("X", "pas-un-email", "password123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").isNotEmpty());
    }

    @Test
    void deroule_le_cycle_de_vie_complet_d_une_tache() throws Exception {
        String created = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TaskRequest("Preparer le test", "Backend Spring Boot", null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("TODO"))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(created).get("id").asLong();

        mockMvc.perform(put("/api/tasks/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TaskRequest("Preparer le test", "Mise a jour", TaskStatus.DONE))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));

        JsonNode filtered = objectMapper.readTree(mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .param("status", "DONE")
                        .param("search", "preparer"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());

        assertThat(filtered).hasSize(1);

        mockMvc.perform(delete("/api/tasks/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void renvoie_un_updatedAt_rafraichi_apres_modification() throws Exception {
        String created = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TaskRequest("Avant", null, null))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        JsonNode before = objectMapper.readTree(created);
        long id = before.get("id").asLong();

        Thread.sleep(5);

        String updated = mockMvc.perform(put("/api/tasks/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TaskRequest("Apres", null, TaskStatus.DONE))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode after = objectMapper.readTree(updated);

        // La reponse doit porter la date de modification reelle, pas celle de creation.
        assertThat(Instant.parse(after.get("updatedAt").asText()))
                .isAfter(Instant.parse(before.get("updatedAt").asText()));
        // Comparaison a la milliseconde : l'aller-retour en base arrondit les
        // nanosecondes a la microseconde, la date de creation reste la meme.
        assertThat(Instant.parse(after.get("createdAt").asText()).truncatedTo(ChronoUnit.MILLIS))
                .isEqualTo(Instant.parse(before.get("createdAt").asText()).truncatedTo(ChronoUnit.MILLIS));
    }

    @Test
    void ne_laisse_pas_un_utilisateur_voir_les_taches_d_un_autre() throws Exception {
        String created = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TaskRequest("Privee", null, null))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(created).get("id").asLong();

        String otherEmail = "intrus+" + System.nanoTime() + "@test.com";
        String otherBody = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("Intrus", otherEmail, "password123"))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String otherToken = objectMapper.readTree(otherBody).get("token").asText();

        mockMvc.perform(get("/api/tasks/" + id)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }
}
