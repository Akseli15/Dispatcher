package kill.me.dispatcher.config;

import kill.me.dispatcher.entities.Dispatcher;
import kill.me.dispatcher.repos.DispatcherRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class DispatcherDetailsService implements UserDetailsService {

    private final DispatcherRepository dispatcherRepository;

    public DispatcherDetailsService(DispatcherRepository dispatcherRepository) {
        this.dispatcherRepository = dispatcherRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Dispatcher dispatcher = dispatcherRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Dispatcher not found"));

        return User.withUsername(dispatcher.getUsername())
                .password(dispatcher.getPassword())
                .roles(dispatcher.getRole())
                .build();
    }
}
