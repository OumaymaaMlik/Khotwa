package tn.esprit.khotwa.messaging.config;

import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OnlineUserStore {
    private final Set<Long> onlineUsers = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void addUser(Long userId) { onlineUsers.add(userId); }
    public void removeUser(Long userId) { onlineUsers.remove(userId); }
    public Set<Long> getOnlineUsers() { return Collections.unmodifiableSet(onlineUsers); }
    public boolean isOnline(Long userId) { return onlineUsers.contains(userId); }
}