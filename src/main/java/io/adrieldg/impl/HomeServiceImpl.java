package io.adrieldg.impl;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordResourceDetails;
import org.springframework.security.oauth2.common.AuthenticationScheme;
import org.springframework.stereotype.Component;

import io.adrieldg.services.HomeService;

@Component
public class HomeServiceImpl implements HomeService {

  @Autowired
  private OAuth2RestTemplate restTemplate;
  private String username;
  private String password;

  @Value("${security.oauth2.client.clientId}")
  private String clientId;

  @Value("${security.oauth2.client.clientSecret}")
  private String clientSecret;

  @Value("${security.oauth2.client.accessTokenUri}")
  private String accessTokenUri;

  @Value("${security.oauth2.client.grantType}")
  private String grantType;

  @Override
  public void doLogin(String username, String password) {
    this.username = username;
    this.password = password;

    restTemplateInit();

    restTemplate.getAccessToken();
  }

  @PostConstruct
  private void restTemplateInit() {
    ResourceOwnerPasswordResourceDetails details = new ResourceOwnerPasswordResourceDetails();
    List<String> scope = new ArrayList<String>();
    scope.add("read");
    scope.add("write");
    scope.add("trust");

    details.setAccessTokenUri(this.accessTokenUri);
    details.setClientId(this.clientId);
    details.setClientSecret(this.clientSecret);
    details.setGrantType(this.grantType);
    details.setScope(scope);
    details.setClientAuthenticationScheme(AuthenticationScheme.header);

    details.setUsername(this.username);
    details.setPassword(this.password);

    this.username = null;
    this.password = null;

    restTemplate = new OAuth2RestTemplate(details);

    details = null;
  }



}
