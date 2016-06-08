package io.adrieldg.services;

import org.springframework.stereotype.Service;

import io.adrieldg.models.LoginCredentials;

@Service
public interface HomeService {
  void doLogin(LoginCredentials loginCredentials);
}
