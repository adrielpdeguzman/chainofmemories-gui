package io.adrieldg.configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.OAuth2RestOperations;
import org.springframework.security.oauth2.client.resource.OAuth2AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component public class CustomAuthenticationProvider implements AuthenticationProvider {

	@Autowired @Qualifier("myRestTemplate") private OAuth2RestOperations restTemplate;

	@Override public Authentication authenticate(Authentication authentication)
			throws AuthenticationException {
		String username = authentication.getName();
		String password = authentication.getCredentials().toString();

		restTemplate.getOAuth2ClientContext().setAccessToken(null);

		restTemplate.getOAuth2ClientContext().getAccessTokenRequest().set("username", username);
		restTemplate.getOAuth2ClientContext().getAccessTokenRequest().set("password", password);

		try {
			restTemplate.getForEntity("me", String.class);
		}
		catch (OAuth2AccessDeniedException e) {
			throw new BadCredentialsException(e.getSummary());
		}
		return new UsernamePasswordAuthenticationToken(username, password, new ArrayList<>());
	}

	@Override public boolean supports(Class<?> authentication) {
		return authentication.equals(UsernamePasswordAuthenticationToken.class);
	}

	protected OAuth2RestOperations getRestTemplate() {
		return restTemplate;
	}
}
