package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.exception.InvalidStatusTransitionException;
import com.taskmanager.exception.NotFoundException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> findAll(Long userId, TaskStatus status, String search) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();

        return taskRepository.search(userId, status, normalizedSearch).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse findOne(Long userId, Long taskId) {
        return TaskResponse.from(requireOwnedTask(userId, taskId));
    }

    @Transactional
    public TaskResponse create(Long userId, TaskRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        Task task = Task.builder()
                .title(request.title().trim())
                .description(request.description())
                .status(request.status() == null ? TaskStatus.TODO : request.status())
                .user(owner)
                .build();

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long userId, Long taskId, TaskRequest request) {
        Task task = requireOwnedTask(userId, taskId);

        task.setTitle(request.title().trim());
        task.setDescription(request.description());

        if (request.status() != null && request.status() != task.getStatus()) {
            // Progression a sens unique : refuse tout retour en arriere.
            if (!task.getStatus().canMoveTo(request.status())) {
                throw new InvalidStatusTransitionException(task.getStatus(), request.status());
            }
            task.setStatus(request.status());
        }

        // saveAndFlush : force le flush pour que @PreUpdate s'execute avant
        // la construction du DTO, sinon la reponse renvoie un updatedAt perime.
        return TaskResponse.from(taskRepository.saveAndFlush(task));
    }

    @Transactional
    public void delete(Long userId, Long taskId) {
        taskRepository.delete(requireOwnedTask(userId, taskId));
    }

    /**
     * Charge la tache uniquement si elle appartient a l'utilisateur connecte.
     * On renvoie 404 (et non 403) pour ne pas divulguer l'existence des taches d'autrui.
     */
    private Task requireOwnedTask(Long userId, Long taskId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new NotFoundException("Tache introuvable : " + taskId));
    }
}
