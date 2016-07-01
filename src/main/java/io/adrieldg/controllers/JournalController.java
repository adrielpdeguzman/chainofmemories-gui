package io.adrieldg.controllers;

import io.adrieldg.services.JournalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/journals")
public class JournalController {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private JournalService journalService;

  @RequestMapping(path = {"", "v", "v/"}, method = RequestMethod.GET) String index() {
    int currentVolume = journalService.getCurrentVolume();
    logger.debug("Entered journals/volume mapping at " + currentVolume);
    return "redirect:/journals/v/" + currentVolume;
  }

  @RequestMapping("v/{volume}") String volume(@PathVariable Integer volume, Model model) {
    model.addAttribute("volume", volume);
    return "journals/index";
  }
}
