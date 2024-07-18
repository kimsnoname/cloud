import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import SidebarLayout from './SidebarLayout';
import './style/getMyInfo.css';

const GetMyInfo = () => {
  const [selectedKey, setSelectedKey] = React.useState('1');
  const [userForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

    
  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const onEdit = (values) => {
    console.log('Form values:', values);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰을 가져옴
      if (!token) {
        message.error('로그인 후 이용해주세요.');
        return;
      }

      try {
        const response = await axios.get('http://43.203.87.56:8080/api/user/info', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { email, userName } = response.data;
        userForm.setFieldsValue({ email, userName });
        setLoading(false);
      } catch (error) {
        message.error('유저 정보를 가져오는데 실패했습니다.');
        console.error(error);
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userForm]);

  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {isMobile ? (
        <div className="mobile-container">
          <Form onFinish={onEdit} form={userForm}>
            <Form.Item style={{ width: "100%", marginBottom: "0" }}>
              <Form.Item
                name="email"
                label={<b>이메일</b>}
                style={{ width: "100%", display: "block" }}
              >
                <Input size="large" disabled />
              </Form.Item>
              <Form.Item
                name="userName"
                label={<b>유저 닉네임</b>}
                style={{ width: "100%", display: "block" }}
              >
                <Input size="large" disabled />
              </Form.Item>
            </Form.Item>
          </Form>
          <Button type="primary" className="change-info-button">고객정보 변경</Button>
          <Button type="primary" className="delete-account">회원탈퇴</Button>
        </div>
      ) : (
        <SidebarLayout selectedKey={selectedKey} onMenuClick={handleMenuClick}>
          <div className='parent-wrapper'>
            <div className="wrapper">
            <Form onFinish={onEdit} form={userForm}>
                <Form.Item style={{ width: "100%", marginBottom: "0" }}>
                  <Form.Item
                    name="email"
                    label={<b>이메일</b>}
                    style={{
                      width: "calc(100% - 8px)",
                      display: "inline-block",
                      marginLeft: "8px",
                    }}                 >
                    <Input size="large" disabled />
                  </Form.Item>
                </Form.Item>
                <Form.Item style={{ width: "100%", marginBottom: "0" }}>
                  <Form.Item
                    name="userName"
                    label={<b>유저 닉네임</b>}
                    style={{ width: "calc(100% - 8px)", display: "inline-block" }}
                  >
                    <Input size="large" disabled />
                  </Form.Item>
                </Form.Item>
              </Form>
              <Button type="primary" className="change-info-button">고객정보 변경</Button>
              <Button type="primary" className="delete-account">회원탈퇴</Button>
            </div>
          </div>
        </SidebarLayout>
      )}
    </>
  );
};

export default GetMyInfo;
