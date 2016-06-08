package io.adrieldg.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import io.adrieldg.models.LoginCredentials;
import io.adrieldg.services.HomeService;

@Controller
@RequestMapping("/")
public class HomeController {
  @Autowired
  private HomeService homeService;

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
    homeService.doLogin(loginCredentials);
    return "redirect:/";
  }

  @RequestMapping(path = "/changelogs", method = RequestMethod.GET)
  String changelogs() {
    return "changelogs";
  }
}
