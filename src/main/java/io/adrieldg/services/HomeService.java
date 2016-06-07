package io.adrieldg.services;

import org.springframework.stereotype.Service;

@Service
public interface HomeService {
  void doLogin(String username, String password);
}
