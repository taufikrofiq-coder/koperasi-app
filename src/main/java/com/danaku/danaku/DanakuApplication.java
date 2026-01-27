package com.danaku.danaku;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DanakuApplication {

	public static void main(String[] args) {
			System.setProperty("log.name", "app-danaku");
		SpringApplication.run(DanakuApplication.class, args);
	}

}
