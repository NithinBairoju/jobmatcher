package com.jobmatch.matchjob;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MatchjobApplication {

	public static void main(String[] args) {
		SpringApplication.run(MatchjobApplication.class, args);
	}

//	@Bean
//	CommandLineRunner commandLineRunner(ChatClient.Builder builder){
//		return args ->{
//             var client = builder.build();
//			 var response = client.prompt("tell me the list of the 7 wonders")
//					 .call()
//					 .content();
//			 System.out.println(response);
//		};
//	}
}
