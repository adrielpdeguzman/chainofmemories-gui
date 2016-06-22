
package io.adrieldg.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import io.adrieldg.services.JournalService;

@Controller
@RequestMapping("/journals")
public class JournalController {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired
  private JournalService journalService;

  @RequestMapping(method = RequestMethod.GET)
  String index() {
    logger.debug("Entered index mapping");
    int currentVolume = journalService.getCurrentVolume();
    return "redirect:/journals/volume/" + currentVolume;
  }
  
  @RequestMapping(path = "{id}", method = RequestMethod.GET)
  String show(@PathVariable Long id, Model model) {
    model.addAttribute("id", id);
    return "journals/show";
  }

  @RequestMapping("volume/{volume}")
  String volume(@PathVariable Integer volume, Model model) {
    model.addAttribute("volume", volume);
    return "journals/volume";
  }

  @RequestMapping("random")
  String random() {
    return "journals/random";
  }
}
