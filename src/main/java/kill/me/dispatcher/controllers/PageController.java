package kill.me.dispatcher.controllers;

import kill.me.dispatcher.entities.Dispatcher;
import kill.me.dispatcher.repos.DispatcherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {

    @Autowired
    DispatcherRepository dispatcherRepository;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/main")
    public String mainPage(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Dispatcher dispatcher = dispatcherRepository.findDispatcherByUsername(username);

        model.addAttribute("username", dispatcher.getFullName());
        return "main";
    }


    @GetMapping("/routelist/{id}")
    public String currentRouteList(@PathVariable Long id, Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Dispatcher dispatcher = dispatcherRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Dispatcher not found"));

        model.addAttribute("username", dispatcher.getFullName());
        model.addAttribute("id", id);
        return "currentroutelist";
    }

    @GetMapping("/routelist")
    public String routelist() {
        return "routelist";
    }
}

