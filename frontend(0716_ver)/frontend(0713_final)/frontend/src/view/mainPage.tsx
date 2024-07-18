// mainPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Button, Menu, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import NewPage from "./newPage";
import GetMyInfo from './getMyInfo';
import Assets from './assets';
import Transactions from './transactions';
import Transfer from './transfer';
import './style/MainPage.css';
import LandingPage from "./landing";
import Login from './loginPage';
import Register from './registerPage';
import Welcome from './welcomePage';
import AccountRegistration from './accountRegistrationPage';
import TransferSuccess from "./transferSuccessPage";
import TestLogin from '../components/loginPage';
import TestRegister from '../components/registerPage';
import MobileFooterMenu from './MobileFooterMenu';
import ApiIndexPage from './api/apiIndexPage';
import StockPrice from './api/stockPrice';
import Indices from './api/indices';
import Noticelist from './Noticelist';
import NoticeDetail from './Noticedetail';
import NoticeForm from './NoticeForm';
import Community from './Community';
import CommunityForm from './CommunityForm';
import CommunityDetail from './CommunityDetail';
import CommunityUpdate from './CommunityUpdate';
import Board from './Board';
import Trading from './trading';
import TestChart from '../components/testChart';
import Footer from './Footer';
import NotLogin from './NotLogin';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(localStorage.getItem('isLoggedIn') === 'true');
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  const handleLogout = () => {
    // Call delToken function in Android
    if (window.Android && typeof window.Android.delToken === 'function') {
      window.Android.delToken();
    } else {
      console.warn('Android delToken function is not available');
    }

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName(null);
    navigate('/');
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  
  const toggleLogin = () => {
    const newLoginState = !isLoggedIn;
    setIsLoggedIn(newLoginState);
    if (newLoginState) {
      setUserName('User'); // replace with actual username if needed
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', 'User');
    } else {
      setUserName(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('accessToken');
    }
  }; 

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/welcome' || location.pathname === '/accountRegistration';

  return (
    <div>
      {!isAuthPage && (
        <div className="navbar">
          <Link to="/" className="logo">무명증권</Link>
          <div className="mobile-menu">
            <Button className="menu-button" type="text" icon={<MenuOutlined />} onClick={showDrawer} />
            <Drawer
              title="Menu"
              placement="left"
              onClose={onClose}
              visible={visible}
            >
              <Menu mode="vertical" className="nav-menu-mobile">
                <Menu.Item key="trading" onClick={onClose}>
                  <Link to="/trading">트레이딩</Link>
                </Menu.Item>
                <Menu.Item key="GetMyInfo" onClick={onClose}>
                  <Link to="/GetMyInfo">내정보</Link>
                </Menu.Item>
                <Menu.Item key="community" onClick={onClose}>
                  <Link to="/community">종목토론실</Link>
                </Menu.Item>
                <Menu.Item key="notice" onClick={onClose}>
                  <Link to="/noticelist">공지사항</Link>
                </Menu.Item>
              </Menu>
            </Drawer>
          </div>
          <Menu mode="horizontal" className="nav-menu">
            <Menu.Item key="trading">
              <Link to="/trading">트레이딩</Link>
            </Menu.Item>
            <Menu.Item key="GetMyInfo">
              <Link to="/GetMyInfo">내정보</Link>
            </Menu.Item>
            <Menu.Item key="community">
              <Link to="/community">종목토론실</Link>
            </Menu.Item>
            <Menu.Item key="notice">
              <Link to="/Noticelist">공지사항</Link>
            </Menu.Item>
          </Menu>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <span className="welcome-message">{userName}님 환영합니다.</span>
                <Button type="default" onClick={handleLogout} className="logout-button">로그아웃</Button>
              </>
            ) : (
              <>
                <Button type="primary" onClick={handleRegisterRedirect} className="signup-button">회원가입</Button>
                <Button type="default" onClick={handleLoginRedirect} className="login-button">로그인</Button>
              </>
            )}
            <Button type="dashed" onClick={toggleLogin}>Toggle Login</Button>  
          </div>
        </div>
      )}
      <Routes>
        <Route path="/newPage" element={<NewPage />} />
        <Route path="/" element={<Trading />} />

        <Route path="/getMyInfo" element={isLoggedIn ? <GetMyInfo /> : <NotLogin />} /> 
        <Route path="/assets" element={isLoggedIn ? <Assets /> : <NotLogin />} /> 
        <Route path="/transactions" element={isLoggedIn ? <Transactions /> : <NotLogin />} />
        <Route path="/transfer" element={isLoggedIn ? <Transfer /> : <NotLogin />} />
        <Route path="/notlogin" element={<NotLogin />} /> {/* 비로그인 기본 경로 */}

        <Route path="/getMyInfo" element={<GetMyInfo />} /> 
        <Route path="/assets" element={<Assets />} /> 
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserName={setUserName} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/accountRegistration" element={<AccountRegistration />} />
        <Route path="/transferSuccess" element={<TransferSuccess />} />
        <Route path="/testlogin" element={<TestLogin />} />
        <Route path="/testregister" element={<TestRegister />} />
        <Route path="/notices" element={<Noticelist />} />
        <Route path="/noticelist" element={<Noticelist />} />
        <Route path="/notices/:id" element={<NoticeDetail />} />
        <Route path="/noticesForm" element={<NoticeForm />} />
        <Route path="/Community" element={<Community />} />
        <Route path="/Community/:boardId" element={<Board />} />
        <Route path="/Community/:boardId/new" element={<CommunityForm />} />
        <Route path="/Community/:boardId/update/:id" element={<CommunityUpdate />} />
        <Route path="/Community/:boardId/:id" element={<CommunityDetail />} />
        <Route path="/apiindexpage" element={<ApiIndexPage />} />
        <Route path="/indices" element={<Indices />} />
        <Route path="/equities/:id" element={<StockPrice />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/testchart" element={<TestChart />} />
      </Routes>
      <div className="footer-padding">
        <Footer />
      </div>
      {!isAuthPage && <MobileFooterMenu />}
    </div>
  );
};

export default MainPage;
