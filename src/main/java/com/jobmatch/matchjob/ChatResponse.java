package com.jobmatch.matchjob;

public class ChatResponse {
    private String content;
    private String error;

    // Constructors
    public ChatResponse() {}

    public ChatResponse(String content, String error) {
        this.content = content;
        this.error = error;
    }

    // Getters and setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
