package com.jobmatch.matchjob;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatRequest {
    @NotBlank(message = "Prompt cannot be empty")
    @Size(min = 2, max = 100000, message = "Prompt must be between 2 and 1000 characters")
    private String prompt;

    // Constructors
    public ChatRequest() {}

    public ChatRequest(String prompt) {
        this.prompt = prompt;
    }

    // Getters and setters
    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}
