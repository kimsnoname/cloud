// src/components/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../view/style/login.css';
import { Button, Form, Input, Row, Col } from 'antd';

interface TestEntity {
  created_at: string;
  updated_at: string;
  id: string;
  pw: string;
  email: string;
  phoneNumber: string;
  name: string;
}


const TestLogin: React.FC = () => {
  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pw, setPassword] = useState<string>('');
  const [created_at, setCreatedAt] = useState('');
  const [updated_at, setUpdatedAt] = useState('');

  const [entities, setEntities] = useState([]);

  const getCurrentTime = (): string => {
    return new Date().toISOString();
  }


  const navigate = useNavigate();

  const handleSubmit = async() => {
    const currentTime = getCurrentTime();
    setCreatedAt(currentTime);
    setUpdatedAt(currentTime);

    const data: TestEntity = {
      created_at: currentTime,
      updated_at: currentTime,
      id: email,
      pw,
      email,
      phoneNumber,
      name,
  };
  try {
    const response = await fetch('http://43.203.87.56:8080/api/v1/test/test1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      console.log('Data submitted successfully');
    } else {
      console.error('Failed to submit data');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <Form onFinish={handleSubmit} className="login-form">
        <Form.Item
          label="이메일"
          name="email"
          rules={[{ required: true, message: '이메일을 입력해주세요.' }]}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="비밀번호"
          name="password"
          rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
        >
          <Input.Password
            value={pw}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            로그인
          </Button>
        </Form.Item>
      </Form>
      <Button onClick={handleRegisterRedirect} className="register-button-login">
        회원가입
      </Button>
    </div>
  );
};

export default TestLogin;
