package io.adrieldg.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.stereotype.Component;

import io.adrieldg.models.LoginCredentials;
import io.adrieldg.services.HomeService;

@Component
public class HomeServiceImpl implements HomeService {

  @Autowired
  private OAuth2RestTemplate restTemplate;

  @Override
  public void doLogin(LoginCredentials loginCredentials) {
    restTemplate.getOAuth2ClientContext().getAccessTokenRequest().set("username",
        loginCredentials.getUsername());
    restTemplate.getOAuth2ClientContext().getAccessTokenRequest().set("password",
        loginCredentials.getPassword());

    restTemplate.getAccessToken();
  }
}
