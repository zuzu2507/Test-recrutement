package com.taskmanager.exception;

public class EmailAlreadyUsedException extends RuntimeException {

    public EmailAlreadyUsedException(String message) {
        super(message);
    }
}
