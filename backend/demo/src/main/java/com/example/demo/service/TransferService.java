package com.example.demo.service;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Transfer;
import com.example.demo.model.UserAccount;
import com.example.demo.repository.TransferRepository;
import com.example.demo.repository.UserAccountRepository;

@Service
@Transactional
public class TransferService {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private TransferRepository transferRepository;

    // 이체 동작 처리
    @Transactional
    public Transfer transferMoney(Long userId, String accountNumber, Long amount, String accountPassword) throws Exception {
        // 보내는 사람 계좌 조회

        UserAccount fromUserAccount = userAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new Exception("Sender not found"));



        // 내 계좌(이체하는 사람)에서 이체 금액만큼 빠짐
        fromUserAccount.setBalance(fromUserAccount.getBalance() - amount.intValue());
        userAccountRepository.save(fromUserAccount); // 이체 후 잔액을 저장

        // 받는 사람 계좌 조회 (계좌번호를 통해)
        UserAccount toUserAccount = userAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new Exception("Receiver not found"));

        // 받는 사람 계좌에 이체 금액 추가 (+amount)
        toUserAccount.setBalance(toUserAccount.getBalance() + amount.intValue());
        userAccountRepository.save(toUserAccount); // 이체 후 잔액을 저장

        // 이체 내역을 transfer 모델에 저장
        Transfer transfer = new Transfer();
        transfer.setUserId(userId);
        transfer.setAccountNumber(toUserAccount.getAccountNumber());
        transfer.setAmount(amount);
        //System.out.println("transferAmount");


        return transferRepository.save(transfer);
    }

    public boolean verifyPassword(Long userId, String accountPassword) throws Exception {
        UserAccount userAccount = userAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new Exception("User not found"));
        return userAccount.getAccountPassword().equals(hashPassword(accountPassword));
    }

    public void saveTransfer(Transfer transfer) {
        throw new UnsupportedOperationException("Unimplemented method 'saveTransfer'");
    }

    private String hashPassword(String password) {
        return DigestUtils.md5Hex(password);
    }
    
}