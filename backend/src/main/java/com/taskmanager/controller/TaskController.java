package com.taskmanager.controller;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.security.AuthenticatedUser;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskResponse> list(@AuthenticationPrincipal AuthenticatedUser principal,
                                   @RequestParam(required = false) TaskStatus status,
                                   @RequestParam(required = false) String search) {
        return taskService.findAll(principal.getId(), status, search);
    }

    @GetMapping("/{id}")
    public TaskResponse getOne(@AuthenticationPrincipal AuthenticatedUser principal,
                               @PathVariable Long id) {
        return taskService.findOne(principal.getId(), id);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@AuthenticationPrincipal AuthenticatedUser principal,
                                               @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public TaskResponse update(@AuthenticationPrincipal AuthenticatedUser principal,
                               @PathVariable Long id,
                               @Valid @RequestBody TaskRequest request) {
        return taskService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthenticatedUser principal,
                                       @PathVariable Long id) {
        taskService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
