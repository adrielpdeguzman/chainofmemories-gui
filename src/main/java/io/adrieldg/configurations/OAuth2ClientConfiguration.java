package io.adrieldg.configurations;

import java.util.Arrays;

import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.AccessTokenProvider;
import org.springframework.security.oauth2.client.token.AccessTokenProviderChain;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordAccessTokenProvider;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordResourceDetails;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client;

@EnableOAuth2Client
@Configuration
public class OAuth2ClientConfiguration {
  @Value("${oauth2.id}")
  private String id;
  @Value("${oauth2.clientId}")
  private String clientId;
  @Value("${oauth2.clientSecret}")
  private String clientSecret;
  @Value("${oauth2.accessTokenUri}")
  private String accessTokenUri;

  @Autowired
  private OAuth2ClientContext oauth2ClientContext;

  @Bean
  public ClientHttpRequestFactory httpRequestFactory() {
    return new HttpComponentsClientHttpRequestFactory(httpClient());
  }

  @Bean
  public HttpClient httpClient() {
    PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
    connectionManager.setMaxTotal(1);
    connectionManager.setDefaultMaxPerRoute(1);
    return HttpClientBuilder.create().setConnectionManager(connectionManager).build();
  }

  @Bean
  public OAuth2ProtectedResourceDetails oauth2ProtectedResourceDetails() {
    ResourceOwnerPasswordResourceDetails details = new ResourceOwnerPasswordResourceDetails();
    details.setId(id);
    details.setClientId(clientId);
    details.setClientSecret(clientSecret);
    details.setAccessTokenUri(accessTokenUri);
    return details;
  }

  @Bean
  public AccessTokenProvider accessTokenProvider() {
    ResourceOwnerPasswordAccessTokenProvider tokenProvider =
        new ResourceOwnerPasswordAccessTokenProvider();
    tokenProvider.setRequestFactory(httpRequestFactory());
    return new AccessTokenProviderChain(Arrays.<AccessTokenProvider>asList(tokenProvider));
  }

  @Bean
  public OAuth2RestTemplate restTemplate() {
    OAuth2RestTemplate template =
        new OAuth2RestTemplate(oauth2ProtectedResourceDetails(), oauth2ClientContext);
    template.setRequestFactory(httpRequestFactory());
    template.setAccessTokenProvider(accessTokenProvider());
    return template;
  }
}
