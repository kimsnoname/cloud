import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import './style/accountRegistrationPage.css';

interface AccountEntity {
  accountPassword: string;
}

const AccountRegistration: React.FC = () => {
  const [accountPW, setAccountPW] = useState<string>('');
  const [confirmAccountPassword, setConfirmAccountPassword] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  const userId = 8; // 하드코딩된 사용자 ID
  const { registerEmail } = location.state as { registerEmail: string };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountPW !== confirmAccountPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (accountPW.length !== 6) {
      message.error('계좌 비밀번호는 6자리로 입력해주세요.');
      return;
    }

    const data: AccountEntity = {
      accountPassword: accountPW,
    };

    try {
      const response = await axios.post(`http://43.203.87.56:8080/api/account/create?email=${registerEmail}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        message.success('계좌 개설에 성공하였습니다!');
        navigate('/main');
      } else {
        message.error('계좌 개설에 실패하였습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('계좌 개설 중 오류가 발생하였습니다.');
    }
  };

  return (
    <div className="account-registration-container">
      <h2>계좌 개설</h2>
      <Form className="account-registration-form" onSubmitCapture={handleSubmit}>
        <Form.Item
          label="계좌 비밀번호"
          name="accountPW"
          rules={[
            { required: true, message: '계좌 비밀번호를 입력해주세요.' },
            { min: 6, message: '계좌 비밀번호는 6자리로 입력해주세요.' },
            { max: 6, message: '계좌 비밀번호는 6자리로 입력해주세요.' },
          ]}
        >
          <Input.Password value={accountPW} onChange={(e) => setAccountPW(e.target.value)} />
        </Form.Item>
        <Form.Item
          label="계좌 비밀번호 확인"
          name="confirmAccountPassword"
          dependencies={['accountPW']}
          rules={[
            { required: true, message: '비밀번호 확인을 입력해주세요.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('accountPW') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
              },
            }),
          ]}
        >
          <Input.Password value={confirmAccountPassword} onChange={(e) => setConfirmAccountPassword(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" className="account-registration-ok" htmlType="submit">
            계좌 개설하기
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AccountRegistration;
