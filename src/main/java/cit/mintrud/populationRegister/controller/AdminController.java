package cit.mintrud.populationRegister.controller;


import cit.mintrud.populationRegister.model.User;
import cit.mintrud.populationRegister.repo.UserRepo;
import cit.mintrud.populationRegister.service.UserService;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private static final Logger log = Logger.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepo userRepo;

    @GetMapping("/users")
    public ModelAndView usersPage(@AuthenticationPrincipal User user, ModelAndView model) {
        model.addObject("user", user);
        model.addObject("newUser", new User());
        model.setViewName("admin/users");
        return model;
    }

    @PostMapping("/users/save")
    public String saveUser(@ModelAttribute User user, Map<String, Object> model)
    {
        if (!userService.addUser(user)) {
            model.put("message", "User exists!");
            return "registration";
        }
        return "redirect:/login";
    }

    @GetMapping({"/allUsers"})
    public @ResponseBody
    List<User> getAllUsers() {
        List<User> users = userRepo.findAll();
        return users;
    }


//    @PostMapping("/users/edit")
//    public ModelAndView saveUserEdit(@ModelAttribute UserSaveModel userSaveModel, ModelAndView model) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//        User user = userService.findByUsername(userDetails.getUsername());
//        model.setViewName("redirect:/custom/users");
//        userService.save(converter.convertFromUserSaveModelToUserEdit(userSaveModel));
//        log.info("Админ " + user.getUsername() + " ОТредактировал пользователя "  + userSaveModel.getUsername());
//        return model;
//    }


}
