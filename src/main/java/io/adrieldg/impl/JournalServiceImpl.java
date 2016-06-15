package io.adrieldg.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.oauth2.client.OAuth2RestOperations;
import org.springframework.stereotype.Component;

import io.adrieldg.services.JournalService;

@Component
public class JournalServiceImpl implements JournalService {

  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired
  @Qualifier("myRestTemplate")
  private OAuth2RestOperations restTemplate;

  private final String BASE_URL = "journals/";

  @Override
  public Integer getCurrentVolume() {
    int currentVolume =
        restTemplate.getForEntity(BASE_URL + "/search/getCurrentVolume", Integer.class).getBody();
    return currentVolume;
  }
}
