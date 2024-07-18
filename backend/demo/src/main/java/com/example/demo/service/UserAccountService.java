package com.example.demo.service;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.UserAccount;
import com.example.demo.repository.UserAccountRepository;

@Service
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;

    @Autowired
    public UserAccountService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public UserAccount createAccount(Long userId, UserAccount userAccount) {
        // Hash the password before saving
        String hashedPassword = hashPassword(userAccount.getAccountPassword());
        userAccount.setAccountPassword(hashedPassword);
        userAccount.setUserId(userId);
        return userAccountRepository.save(userAccount);
    }

    //@Transactional
    public void deductAmount(Long userId, Long amount) throws Exception {
        UserAccount userAccount = userAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (userAccount.getBalance() < amount) {
            throw new Exception("Insufficient balance");
        }

        userAccount.setBalance(userAccount.getBalance() - amount.intValue());
        userAccountRepository.save(userAccount);
    }

    //@Transactional
    public void addAmount(Long userId, Long amount) throws Exception {
        UserAccount userAccount = userAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new Exception("User not found"));

        //예외처리 수정하기        
        if (userAccount.getBalance() < amount) {
            throw new Exception("Insufficient balance");
        }

        userAccount.setBalance(userAccount.getBalance() + amount.intValue());
        userAccountRepository.save(userAccount);
    }

    private String hashPassword(String password) {
        return DigestUtils.md5Hex(password);
    }
}
