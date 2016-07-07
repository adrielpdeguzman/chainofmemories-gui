package io.adrieldg.configurations;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired
  private CustomAuthenticationProvider authProvider;

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.authenticationProvider(authProvider);
  }

  @Override
  public void configure(WebSecurity web) throws Exception {
    web.ignoring().antMatchers("/js/**", "/css/**", "/img/**", "/webjars/**");
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    /*@formatter:off*/
    http.authorizeRequests()
        .antMatchers("/", "/changelog")
        .permitAll()
        .anyRequest().fullyAuthenticated()
        .and()
      .formLogin()
        .successHandler(addAccessTokenToCookieAfterAuthenticationSuccess())
        .loginPage("/login")
        .failureUrl("/login?error")
        .permitAll()
        .and()
      .logout()
        .logoutUrl("/logout")
        .logoutSuccessUrl("/?logout")
        .permitAll();
    /*@formatter:on*/
  }

  @Bean
  public AuthenticationSuccessHandler addAccessTokenToCookieAfterAuthenticationSuccess() {
    return new SavedRequestAwareAuthenticationSuccessHandler() {

      @Override
      public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
          Authentication authentication) throws IOException, ServletException {
        response.addCookie(new Cookie("chainofmemories_access_token",
            authProvider.getRestTemplate().getAccessToken().getValue()));
        super.onAuthenticationSuccess(request, response, authentication);
      }
    };
  }
}
