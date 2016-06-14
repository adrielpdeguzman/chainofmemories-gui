package io.adrieldg.configurations;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestOperations;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordResourceDetails;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client;

@EnableOAuth2Client
@Configuration
public class OAuth2ClientConfiguration {
  @Value("${security.oauth2.client.clientId}")
  private String clientId;
  @Value("${security.oauth2.client.clientSecret}")
  private String clientSecret;
  @Value("${security.oauth2.client.accessTokenUri}")
  private String accessTokenUri;
  @Value("${security.oauth2.client.grantType}")
  private String grantType;
  @Value("${security.oauth2.client.scope}")
  private String[] scope;

  @Bean
  public OAuth2ProtectedResourceDetails oauth2ProtectedResourceDetails() {
    ResourceOwnerPasswordResourceDetails details = new ResourceOwnerPasswordResourceDetails();
    details.setAccessTokenUri(accessTokenUri);
    details.setClientId(clientId);
    details.setClientSecret(clientSecret);
    details.setGrantType(grantType);
    details.setScope(Arrays.asList(scope));
    return details;
  }

  @Bean
  public OAuth2RestOperations restTemplate(OAuth2ClientContext oauth2ClientContext) {
    return new OAuth2RestTemplate(oauth2ProtectedResourceDetails(), oauth2ClientContext);
  }
}
