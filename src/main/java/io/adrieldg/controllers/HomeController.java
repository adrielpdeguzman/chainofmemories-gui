package io.adrieldg.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.grant.password.ResourceOwnerPasswordResourceDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import io.adrieldg.models.LoginCredentials;

@Controller
@RequestMapping("/")
public class HomeController {
  @Autowired
  private OAuth2RestTemplate restTemplate;

  @RequestMapping(method = RequestMethod.GET)
  String index(Model model) {
    return "index";
  }

  @RequestMapping(path = "/login", method = RequestMethod.GET)
  String login(Model model) {
    model.addAttribute(new LoginCredentials());
    return "login";
  }

  @RequestMapping(path = "/login", method = RequestMethod.POST)
  String doLogin(@ModelAttribute LoginCredentials loginCredentials, RedirectAttributes attr) {
    restTemplate = new OAuth2RestTemplate(
        details(loginCredentials.getUsername(), loginCredentials.getPassword()));
   
    try {
      restTemplate.getAccessToken();
    }
    catch (RuntimeException e) {
      attr.addFlashAttribute("error", "Invalid login credentials");
      return "redirect:/login";
    }

    return "redirect:/";
  }

  @RequestMapping(path = "/logout", method = RequestMethod.GET)
  String logout() {
    return "redirect:/";
  }

  @RequestMapping(path = "/changelogs", method = RequestMethod.GET)
  String changelogs() {
    return "changelogs";
  }

  private OAuth2ProtectedResourceDetails details(String username, String password) {

    ResourceOwnerPasswordResourceDetails details = new ResourceOwnerPasswordResourceDetails();

    details.setAccessTokenUri(restTemplate.getResource().getAccessTokenUri());
    details.setClientId(restTemplate.getResource().getClientId());
    details.setClientSecret(restTemplate.getResource().getClientSecret());
    details.setGrantType(restTemplate.getResource().getGrantType());
    details.setScope(restTemplate.getResource().getScope());

    details.setUsername(username);
    details.setPassword(password);

    return details;
  }
}
