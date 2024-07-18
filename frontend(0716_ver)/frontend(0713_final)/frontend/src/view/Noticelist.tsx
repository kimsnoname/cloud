import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Space, message } from 'antd';
import axios from 'axios';
import './style/Noticelist.css';

interface Notice {
  noticeId: number;
  title: string;
  author: string;
  date: string;
  content: string;
  views: number;
  comments: number;
}

const NoticeList: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole')); // 사용자 권한
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get('http://43.203.87.56:8080/api/notices');
        setNotices(response.data);
      } catch (error) {
        console.error('Error fetching notices:', error);
        message.error('공지사항을 불러오는 데 실패했습니다.');
      }
    };


    fetchNotices();
  }, []);

  const sortedNotices = [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleWriteButtonClick = () => {
    if (userRole !== 'admin') {
      alert('글 작성 권한이 없습니다.');
      navigate('/noticelist');
      return;
    }
    navigate('/noticesForm');
  };

  return (
    <div className="notice-list">
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <h1>공지사항</h1>
        <div className="desktop-view">
          <table>
            <thead>
            <tr>
                <th style={{ textAlign: 'center', width: '40%' }}>제목</th>
                <th style={{ textAlign: 'center', width: '20%' }}>작성자</th>
                <th style={{ textAlign: 'center', width: '20%' }}>날짜</th>
                <th style={{ textAlign: 'center', width: '10%' }}>댓글 수</th>
                <th style={{ textAlign: 'center', width: '10%' }}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {sortedNotices.map(notice => (
                <tr key={notice.noticeId}>
                  <td style={{ textAlign: 'center' }}>
                    <Link to={`/notices/${notice.noticeId}`}>{notice.title}</Link>
                  </td>
                  <td style={{ textAlign: 'center' }}>{notice.author}</td>
                  <td style={{ textAlign: 'center' }}>{notice.date}</td>
                  <td style={{ textAlign: 'center' }}>{notice.comments}</td>
                  <td style={{ textAlign: 'center' }}>{notice.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="write-button-container">
            {userRole === 'admin' && (
              <Link to="/noticesForm">
                <Button type="primary" className="button" onClick={handleWriteButtonClick}>글 작성</Button>
              </Link>
            )}
          </div>
        </div>
        <div className="mobile-view">
          <ul className="mobile-list">
            {sortedNotices.map(notice => (
              <li key={notice.noticeId}>
                <Link to={`/notices/${notice.noticeId}`}>
                  <h3>{notice.title}</h3>
                  <p>작성자: {notice.author}</p>
                  <p className="mobile-date">날짜: {notice.date}</p>
                  <p>댓글 수: {notice.comments}</p>
                  <p className="mobile-views">조회수: {notice.views}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="write-button-container">
            {userRole === 'admin' && (
              <Link to="/noticesForm">
                <Button type="primary" className="button" onClick={handleWriteButtonClick}>글 작성</Button>
              </Link>
            )}
          </div>
        </div>
      </Space>
    </div>
  );
};

export default NoticeList;
