package com.taskmanager.dto;

import com.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequest(

        @NotBlank(message = "Le titre est obligatoire")
        @Size(max = 150, message = "Le titre ne peut pas depasser 150 caracteres")
        String title,

        @Size(max = 5000, message = "La description ne peut pas depasser 5000 caracteres")
        String description,

        /** Optionnel a la creation : TODO par defaut. */
        TaskStatus status
) {}
