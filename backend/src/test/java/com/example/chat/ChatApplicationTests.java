package com.example.chat;

import com.example.chat.api.GreetingResponse;
import com.example.chat.api.HelloController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ChatApplicationTests {

	@Autowired
	private HelloController helloController;

	@Test
	void contextLoads() {
		assertThat(this.helloController).isNotNull();
	}

	@Test
	void helloApiReturnsExpectedResponse() {
		GreetingResponse response = this.helloController.hello("Sonu");

		assertThat(response.message()).isEqualTo("Hello Sonu!");
		assertThat(response.appName()).isEqualTo("chat");
		assertThat(response.timestamp()).isNotBlank();
	}

	@Test
	void homeEndpointShowsApiStatus() {
		assertThat(this.helloController.home())
				.containsEntry("status", "ok")
				.containsEntry("message", "Simple Spring Boot API is running");
	}

}
