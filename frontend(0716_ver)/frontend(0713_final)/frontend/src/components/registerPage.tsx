// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Row, Col } from 'antd';
import '../view/style/register.css';
import axios from 'axios';

interface TestEntity {
  createdAt: string;
  updatedAt: string;
  pw: string;
  email: string;
  phoneNumber: string;
  userName: string;
};

const TestRegister: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailCode, setEmailCode] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // const [userID, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const [pw, setPassword] = useState<string>('');


  const navigate = useNavigate();
  const getCurrentTime = (): string => {
    return new Date().toISOString();
  }

  const handleEmailVerification = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    alert(`이메일 인증 코드: ${code}`);
    // 실제로는 이메일을 보내는 로직이 여기에 추가되어야 합니다.
  };

  const handleVerifyCode = () => {
    if (emailCode === generatedCode) {
      setIsEmailVerified(true);
      alert('이메일 인증 완료!');
    } else {
      alert('인증 코드가 일치하지 않습니다.');
    }
  };

  // 비밀번호 검증 규칙 함수
  const validatePassword = async (rule: any, value: string) => {
    if (value && value.length >= 8) {
      // 비밀번호가 8글자 이상일 경우 추가 검사
      const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/;
      if (regex.test(value)) {
        return Promise.resolve();
      }
    }
    return Promise.reject('비밀번호는 8글자 이상이어야 하며, 영문자, 숫자, 특수문자를 포함해야 합니다.');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // setUserId(value);
  };


  const handleSubmit = async() => {
    const currentTime = getCurrentTime();

    if (!isEmailVerified) {
      alert('이메일 인증을 완료해 주세요.');
      return;
  }

  if (pw !== confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

    const data: TestEntity = {
      pw,
      email,
      phoneNumber,
      userName,
      createdAt: currentTime,
      updatedAt: currentTime,
  };

  try {
    const response = await axios.post('http://43.203.87.56:8080/api/v1/test/test1', data, 
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('데이터 전달 성공: ', response.data)
    if (response.status === 200) {
      console.log('User registered successfully');
    } else {
      console.error(response.status);
      console.error('Failed to register user');
    }
  } catch (error) {
    console.error('Error:', error);
  };
};

 

  return (
    <div className="register-container">
      <h2>회원가입</h2>
      <Form onFinish={handleSubmit} className="register-form">
      <Row gutter={8} align="middle">
      <Col flex="auto">
        <Form.Item label="이메일" name="email" rules={[{ required: true, message: '이메일을 입력해주세요.' }]}>
          <Input type="email" value={email} onChange={handleEmailChange} />
          </Form.Item>
        </Col>
        <Col>
            <Button type="primary" className="code-button1" onClick={handleEmailVerification} style={{ display: 'block', margin: 'auto' }}>
            인증 코드 받기
            </Button>
        </Col>
        </Row>

        <Row gutter={8} align="middle">
        <Col flex="auto">
        <Form.Item label="인증 코드" name="emailCode" rules={[{ required: true, message: '인증 코드를 입력해주세요.' }]}>
          <Input type="text" value={emailCode} onChange={(e) => setEmailCode(e.target.value)} />
        </Form.Item>
        </Col>
        <Col>
        <Button type="primary" className="code-button2" onClick={handleVerifyCode} style={{ display: 'block', margin: 'auto' }}>
          인증
        </Button>
        </Col>
        </Row>
        <Form.Item label="닉네임" name="userName" rules={[{ required: true, message: '닉네임을 입력해주세요.' }]}>
          <Input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
        </Form.Item>
        <Form.Item label="핸드폰 번호" name="phoneNumber" rules={[{ required: true, message: '핸드폰 번호를 입력해주세요.' }]}>
          <Input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </Form.Item>
        <Form.Item label="비밀번호" name="pw" rules={[
            { required: true, message: '비밀번호를 입력해주세요.' },
            { validator: validatePassword }
            ]}>
          <Input.Password value={pw} onChange={(e) => setPassword(e.target.value)} />
        </Form.Item>
        <Form.Item
          label="비밀번호 확인"
          name="confirmPassword"
          dependencies={['pw']}
          rules={[
            { required: true, message: '비밀번호 확인을 입력해주세요.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('pw') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
              },
            }),
          ]}
        >
          <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="register-button">
            회원가입
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TestRegister;
