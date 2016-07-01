package io.adrieldg.configurations;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.oauth2.client.DefaultOAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestOperations;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.AccessTokenProvider;
import org.springframework.security.oauth2.client.token.DefaultAccessTokenRequest;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordAccessTokenProvider;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordResourceDetails;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client;
import org.springframework.web.util.DefaultUriTemplateHandler;
import org.springframework.web.util.UriTemplateHandler;

@EnableOAuth2Client
@Configuration
public class OAuth2ClientConfiguration {

  @Value("${oauth2.clientId}")
  private String clientId;
  @Value("${oauth2.clientSecret}")
  private String clientSecret;
  @Value("${oauth2.accessTokenUri}")
  private String accessTokenUri;
  @Value("${oauth2.grantType}")
  private String grantType;
  @Value("${oauth2.scope}")
  private String[] scope;
  @Value("${global.apiUrl}")
  private String apiUrl;

  @Bean
  public AccessTokenProvider accessTokenProvider() {
    ResourceOwnerPasswordAccessTokenProvider accessTokenProvider =
        new ResourceOwnerPasswordAccessTokenProvider();
    accessTokenProvider.setRequestFactory(new SimpleClientHttpRequestFactory());
    return accessTokenProvider;
  }

  @Bean
  public OAuth2ProtectedResourceDetails resource() {
    ResourceOwnerPasswordResourceDetails resource = new ResourceOwnerPasswordResourceDetails();
    resource.setAccessTokenUri(apiUrl + accessTokenUri);
    resource.setClientId(clientId);
    resource.setClientSecret(clientSecret);
    resource.setGrantType(grantType);
    resource.setScope(Arrays.asList(scope));
    return resource;
  }

  @Bean
  public UriTemplateHandler uriTemplateHandler() {
    DefaultUriTemplateHandler uriTemplateHandler = new DefaultUriTemplateHandler();
    uriTemplateHandler.setBaseUrl(apiUrl);

    return uriTemplateHandler;
  }

  @Bean
  @Qualifier("myRestTemplate")
  public OAuth2RestOperations myRestTemplate() {
    OAuth2RestTemplate template = new OAuth2RestTemplate(resource(),
        new DefaultOAuth2ClientContext(new DefaultAccessTokenRequest()));
    template.setAccessTokenProvider(accessTokenProvider());
    template.setUriTemplateHandler(uriTemplateHandler());
    return template;
  }
}
