package io.adrieldg.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/journals")
public class JournalController {
  @Autowired
  private OAuth2RestTemplate restTemplate;

  @RequestMapping(method = RequestMethod.GET)
  String index(Model model) {
    String response = restTemplate.getForObject("http://localhost:8081/journals", String.class);
    model.addAttribute(response);

    return "journals/index";
  }
}
