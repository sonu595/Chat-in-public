package com.example.chat.api;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

	@GetMapping("/")
	public Map<String, String> home() {
		return Map.of(
				"status", "ok",
				"message", "Simple Spring Boot API is running");
	}

	@GetMapping("/api/hello")
	public GreetingResponse hello(@RequestParam(defaultValue = "Render") String name) {
		return new GreetingResponse(
				"Hello " + name + "!",
				"chat",
				Instant.now().toString());
	}
}
