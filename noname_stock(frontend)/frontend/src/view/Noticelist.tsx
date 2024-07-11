import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space } from 'antd';
import axios from 'axios';
import './style/Noticelist.css';

interface Notice {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  views: number;
  comments: number;
}

const Noticelist: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get('http://localhost:4000/notices');
        setNotices(response.data);
      } catch (error) {
        console.error('Error fetching notices:', error);
      }
    };

    fetchNotices();
  }, []);

  const sortedNotices = [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="notice-list">
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <h1>공지사항</h1>
        <div className="desktop-view">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: '50%' }}>제목</th>
                <th style={{ textAlign: 'center', width: '10%' }}>작성자</th>
                <th style={{ textAlign: 'center', width: '15%' }}>날짜</th>
                <th style={{ textAlign: 'center', width: '10%' }}>댓글 수</th>
                <th style={{ textAlign: 'center', width: '10%' }}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {sortedNotices.map(notice => (
                <tr key={notice.id}>
                  <td style={{ textAlign: 'center' }}><Link to={`/notice/${notice.id}`}>{notice.title}</Link></td>
                  <td style={{ textAlign: 'center' }}>{notice.author}</td>
                  <td style={{ textAlign: 'center' }}>{notice.date}</td>
                  <td style={{ textAlign: 'center' }}>{notice.comments}</td>
                  <td style={{ textAlign: 'center' }}>{notice.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/noticeForm">
            <Button type="primary" className="write-button">글 작성</Button>
          </Link>
        </div>
        <div className="mobile-view">
          <ul className="mobile-list">
            {sortedNotices.map(notice => (
              <li key={notice.id}>
                <Link to={`/notice/${notice.id}`}>
                  <h3>{notice.title}</h3>
                  <p>작성자: {notice.author}</p>
                  <p>날짜: {notice.date}</p>
                  <p>댓글 수: {notice.comments}</p>
                  <p>조회수: {notice.views}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/noticeForm">
            <Button type="primary" className="write-button">글 작성</Button>
          </Link>
        </div>
      </Space>
    </div>
  );
};

export default Noticelist;
