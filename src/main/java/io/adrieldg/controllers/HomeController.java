package io.adrieldg.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import io.adrieldg.models.User;

@Controller
@RequestMapping("/")
public class HomeController {

  @RequestMapping(method = RequestMethod.GET)
  String index(Model model) {
    return "index";
  }

  @RequestMapping(path = "/login", method = RequestMethod.GET)
  String login() {
    return "login";
  }

  @RequestMapping(path = "/login", method = RequestMethod.POST)
  String doLogin(@ModelAttribute User user) {
    return "login";
  }

  @RequestMapping(path = "/logut", method = RequestMethod.GET)
  String logout() {
    return "login";
  }

  @RequestMapping(path = "/changelogs", method = RequestMethod.GET)
  String changelogs() {
    return "changelogs";
  }
}
