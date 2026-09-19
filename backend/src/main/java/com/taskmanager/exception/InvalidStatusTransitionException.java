package com.taskmanager.exception;

import com.taskmanager.entity.TaskStatus;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(TaskStatus from, TaskStatus to) {
        super("Le statut ne peut pas revenir en arrière : " + from + " -> " + to);
    }
}
