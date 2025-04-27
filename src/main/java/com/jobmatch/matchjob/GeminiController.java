package com.jobmatch.matchjob;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
public class GeminiController {
    private final ChatClient chatClient;

    public GeminiController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }
//
//    public GeminiController(ChatClient chatClient) {
//        this.chatClient = chatClient;
//    }
//
    @PostMapping("/prompt")
    @CrossOrigin(origins ="http://127.0.0.1:5500/")
    public ResponseEntity<ChatResponse> handlePrompt(@Valid @RequestBody ChatRequest request) {
        if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body(new ChatResponse(null, "Prompt cannot be empty"));
        }

        try {
            String content = chatClient.prompt(request.getPrompt())
                    .call()
                    .content();

            return ResponseEntity.ok(new ChatResponse(content, null));
        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(new ChatResponse(null, "Error processing request: " + e.getMessage()));
        }
    }
}
