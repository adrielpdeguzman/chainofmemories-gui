package io.adrieldg.configurations;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.stereotype.Component;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

  @Autowired
  private OAuth2RestTemplate restTemplate;

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    String username = authentication.getName();
    String password = authentication.getCredentials().toString();

    restTemplate.getOAuth2ClientContext().getAccessTokenRequest().set("username", username);
    restTemplate.getOAuth2ClientContext().getAccessTokenRequest().set("password", password);

    if (restTemplate.getForEntity("http://localhost:8081/me", ResponseEntity.class)
        .getStatusCode() == HttpStatus.OK) {
      return new UsernamePasswordAuthenticationToken(username, password, new ArrayList<>());
    } else {
      return null;
    }
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.equals(UsernamePasswordAuthenticationToken.class);
  }

}
