package com.inzira.shared.exceptions;

// Custom exception for not found resources
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
