package io.adrieldg.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import io.adrieldg.models.LoginCredentials;

@Controller
@RequestMapping("/")
public class HomeController {

  @RequestMapping(method = RequestMethod.GET)
  String index(Model model, RedirectAttributes redirectAttributes,
      @RequestParam(value = "logout", required = false) String logout) {
    if (logout != null) {
      redirectAttributes.addFlashAttribute("logout", true);
      return "redirect:/";
    }
    return "index";
  }

  @RequestMapping(path = "login", method = RequestMethod.GET)
  String login(Model model, RedirectAttributes redirectAttributes,
      @RequestParam(value = "error", required = false) String error) {
    model.addAttribute(new LoginCredentials());
    if (error != null) {
      redirectAttributes.addFlashAttribute("error", error);
      return "redirect:/login";
    }
    return "login";
  }

  @RequestMapping(path = "changelog", method = RequestMethod.GET)
  String changelog() {
    return "changelog";
  }
}
