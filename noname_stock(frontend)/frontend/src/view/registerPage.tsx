// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flex, Form, Checkbox, Button, Input} from 'antd';
import './style/register.css';
import TermsModal from './termsModal';
import axios from 'axios';

interface RegisterEntity {
  // createdAt: string;
  // updatedAt: string;
  pw: string;
  email: string;
  userName: string;
};

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [pw, setPassword] = useState<string>('');
  const [emailCode, setEmailCode] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [termsVisible, setTermsVisible] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | undefined>(undefined); // 이메일 유효성 상태: 초기값을 undefined로 설정
  const [isEmailCodeButtonDisabled, setIsEmailCodeButtonDisabled] = useState(true); // 인증 코드 받기 버튼 비활성화 상태
  const [isVerifyButtonDisabled, setIsVerifyButtonDisabled] = useState(true); // 인증 버튼 비활성화 상태
  const [isAgreed, setIsAgreed] = useState(false);
  const [isUserNameValid, setIsUserNameValid] = useState<boolean | undefined>(undefined); // 닉네임 유효성 상태
  const [form] = Form.useForm();
  const navigate = useNavigate();
 
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 오류 메시지 상태 추가
  const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState<boolean>(true); // 회원가입 버튼 비활성화 상태

  // 이메일 입력값 변경 시 유효성 검사
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // 이메일 형식 검증
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setIsEmailValid(value === '' ? undefined : isValid); // 입력값이 없을 때는 undefined로 설정

    // 유효성에 따라 버튼 상태 설정
    setIsEmailCodeButtonDisabled(!isValid);
  };

  // 닉네임 중복 체크 함수
  const checkDuplicateUserName = async () => {
    setErrorMessage('');
    try {
      const response = await axios.post('http://localhost:8080/api/user/check-username', { userName });
      if (response.status === 200) {
        setErrorMessage('사용가능한 닉네임입니다.');
        setIsRegisterButtonDisabled(false);
        console.error('그 이름 쓰세요.');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setErrorMessage('이미 사용중인 닉네임입니다.');
      } else {
        setErrorMessage('닉네임 중복 확인 중 오류가 발생했습니다.');
      }
      console.error('Error:', error);
    }
  };

  const handleEmailVerification = async () => {
    setErrorMessage('');
    try {
      const response = await axios.post('http://localhost:8080/api/user/check-email', { email });
      if (response.status === 200) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        alert(`이메일 인증 코드: ${code}`);
        setIsVerifyButtonDisabled(false); // 인증 코드를 받은 후 인증 버튼 활성화
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setErrorMessage('이미 등록된 이메일입니다.');
      } else {
        setErrorMessage('이메일 인증 중 오류가 발생했습니다.');
      }
      console.error('Error:', error);
    }
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

  const handleSubmit = async() => {
    // const currentTime = getCurrentTime();

    if (!isEmailVerified) {
      alert('이메일 인증을 완료해 주세요.');
      return;
  }

    if (pw !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const data: RegisterEntity = {
      pw,
      email,
      userName
      // createdAt: currentTime,
      // updatedAt: currentTime,
    };
    const registerEmail = email;

    try {
      const response = await axios.post('http://localhost:8080/api/user/register', data, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('데이터 전달 성공: ', response.data)
      navigate('/welcome', { state: { registerEmail }});
      if (response.status === 201) {
        console.log('User registered successfully');
      } else {
        console.error(response.status);
        console.error('Failed to register user');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('회원가입 중 오류가 발생했습니다.');
    }
  
  };

  const showTermsModal = () => {
    setTermsVisible(true);
  };

  const handleAgree = () => {
    // setIsAgreed(true);
    setTermsVisible(false);
  };

  // // 닉네임 입력값 변경 시 오류 메시지 제거 및 유효성 검사
  // const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setUserName(value);
  //   if (errorMessage) {
  //     setErrorMessage(null);
  //   }
  //   // 닉네임 유효성 검사
  //   setIsUserNameValid(value === '' ? undefined : true); // 일단 빈 문자열이 아니면 유효하다고 가정
  // };

  // // 닉네임 유효성 검사 및 회원가입 버튼 활성화
  // React.useEffect(() => {
  //   if (isUserNameValid && !errorMessage) {
  //     setIsRegisterButtonDisabled(false);
  //   } else {
  //     setIsRegisterButtonDisabled(true);
  //   }
  // }, [isUserNameValid, errorMessage]);

  return (
    <div className="register-container">
      <Link to="/" className="logo-register">무명증권</Link> {/* Made the logo a clickable link */}
      <h2>회원가입</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>} {/* 오류 메시지 출력 */}
      <Form layout="vertical" onFinish={handleSubmit} className="register-form">
      <Flex justify='flex-start' align='center' gap='middle'>
      <Form.Item
          label="이메일"
          name="email"
          validateStatus={isEmailValid === false ? 'error' : undefined} // 입력값이 없을 때 빨간색 오류 표시 없앰
          help={!isEmailValid && email !== '' && '올바른 이메일 형식이 아닙니다.'}
          rules={[
            { required: true, message: '이메일을 입력해주세요.' },
            { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
          ]}
        >
          <Input type="email" value={email} onChange={handleEmailChange} />
          </Form.Item>
          <Button
          type="primary"
          className='code-button1'
          onClick={handleEmailVerification}
          disabled={isEmailCodeButtonDisabled} // 이메일 형식이 아닐 때 버튼 비활성화
        >
          인증 코드 받기
        </Button>
        </Flex>

        <Flex justify='flex-start' align='center' gap='middle'>
        <Form.Item label="인증 코드" name="emailCode" rules={[{ required: true, message: '인증 코드를 입력해주세요.' }]}>
          <Input type="text" value={emailCode} onChange={(e) => setEmailCode(e.target.value)} />
        </Form.Item>
        <Button
          type="primary"
          className='code-button2'
          onClick={handleVerifyCode}
          disabled={isVerifyButtonDisabled} // 인증 코드를 받기 전에는 버튼 비활성화
        >
          인증
        </Button>
        </Flex>
        
        <Flex justify='flex-start' align='center' gap='middle'>
        <Form.Item label="닉네임" name="userName" rules={[{ required: true, message: '닉네임을 입력해주세요.' }]}>
        <Input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
        </Form.Item>
        <Button
          type="primary"
          className='code-button1'
          onClick={checkDuplicateUserName} // 중복 확인 버튼 클릭 시 중복 확인 함수 호출
        >
          닉네임 중복 확인
        </Button>
        </Flex>

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
        <Form.Item
          name="terms"
          valuePropName="checked"
          className="terms-form-item"
          rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('이용약관에 동의해주세요.') }]}
        >
        <div className="terms-checkbox">
          <Checkbox
            checked={isAgreed}
            onClick={showTermsModal}
          >
            이용약관에 동의합니다
          </Checkbox>
        </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="register-button" disabled={!isAgreed || isRegisterButtonDisabled}>
            회원가입
          </Button>
        </Form.Item>
      </Form>
      <TermsModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        onAgree={handleAgree}
        isAgreed={isAgreed}
        setIsAgreed={setIsAgreed}
        
      />
    </div>
  );
};

export default Register;