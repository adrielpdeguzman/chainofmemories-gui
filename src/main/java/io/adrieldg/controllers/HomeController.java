package io.adrieldg.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import io.adrieldg.models.LoginCredentials;

@Controller
@RequestMapping("/")
public class HomeController {

  @RequestMapping(method = RequestMethod.GET)
  String index(Model model) {
    return "index";
  }

  @RequestMapping(path = "login", method = RequestMethod.GET)
  String login(Model model, @RequestParam(value = "error", required = false) String error) {
    model.addAttribute(new LoginCredentials());
    if (error != null) {
      model.addAttribute("error", error);
    }
    return "login";
  }

  @RequestMapping(path = "changelogs", method = RequestMethod.GET)
  String changelogs() {
    return "changelogs";
  }

}
