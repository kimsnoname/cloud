import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Space, Input, message, Pagination } from 'antd';
import axios from 'axios';
import './style/Community.css';

interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  views: number;
  comments: number;
  boardId: string;
}

interface CommunityPageProps {
  hideInput?: boolean;
  customStyle?: React.CSSProperties;
  h1Style?: React.CSSProperties;
}

const Community: React.FC<CommunityPageProps> = ({ hideInput, customStyle, h1Style }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [boardId, setBoardId] = useState<string>(''); // 기본 게시판 ID
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // 페이지당 게시물 수
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://43.203.87.56:8080/api/posts'); // 전체 게시글 가져오는 엔드포인트로 수정
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // message.error('게시물을 불러오는 데 실패했습니다.');
      }
    };

    fetchPosts();
  }, []);

  const handleBoardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setBoardId(value);
    }
  };

  const handleNavigate = () => {
    if (boardId) {
      navigate(`/community/${boardId}`);
    } else {
      message.warning('종목 코드를 입력해주세요.');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const startIndex = (currentPage - 1) * pageSize;
  const currentPosts = sortedPosts.slice(startIndex, startIndex + pageSize);

  return (
    <div className={`community-list ${hideInput ? 'trading-page-style' : ''}`} style={customStyle}>
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <h1 style={h1Style}>전체 게시판</h1>

        <div className="desktop-view">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: '10%' }}>종 목</th>
                <th style={{ textAlign: 'center', width: '40%' }}>제 목</th>
                <th style={{ textAlign: 'center', width: '10%' }}>작성자</th>
                <th style={{ textAlign: 'center', width: '15%' }}>날 짜</th>
                <th style={{ textAlign: 'center', width: '10%' }}>댓글 수</th>
                <th style={{ textAlign: 'center', width: '10%' }}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.map(post => (
                <tr key={`${post.boardId}-${post.id}`}>
                  <td style={{ textAlign: 'center' }}>{post.boardId}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Link to={`/community/${post.boardId}/${post.id}`}>{post.title}</Link>
                  </td>
                  <td style={{ textAlign: 'center' }}>{post.author}</td>
                  <td style={{ textAlign: 'center' }}>{post.date}</td>
                  <td style={{ textAlign: 'center' }}>{post.comments}</td>
                  <td style={{ textAlign: 'center' }}>{post.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="write-button-container">
            <Link to={`/community/000000/new`}>
              <Button type="primary" className="button">글 작성</Button>
            </Link>
          </div>
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={posts.length}
              onChange={handlePageChange}
              showSizeChanger={false}
              className="pagination"
            />
          </div>
        </div>

        <div className="mobile-view">
          <ul className="mobile-list">
            {currentPosts.map(post => (
              <li key={`${post.boardId}-${post.id}`}>
                <Link to={`/community/${post.boardId}/${post.id}`}>
                  <h3>{post.title}</h3>
                  <div className="info-row">
                    <p className="info-item">종목: {post.boardId}</p>
                    <p className="info-item">작성자: {post.author}</p>
                  </div>
                  <div className="info-row">
                    <p className="info-item">댓글: {post.comments}</p>
                    <p className="info-item">조회수: {post.views}</p>
                  </div>
                  <p className="info-item date-item">날짜: {post.date}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="write-button-container">
            <Link to={`/community/000000/new`}>
              <Button type="primary" className="button">글 작성</Button>
            </Link>
          </div>
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={posts.length}
              onChange={handlePageChange}
              showSizeChanger={false}
              className="pagination"
            />
          </div>
        </div>

        {!hideInput &&
          <div className="navigate-board">
            <Input
              placeholder="종목 코드 입력 (6자리 숫자)"
              value={boardId}
              onChange={handleBoardChange}
              maxLength={6}
            />
            <Button type="primary" className="navigate-button" onClick={handleNavigate}>게시판 이동</Button>
          </div>
        }
      </Space>
    </div>
  );
};

export default Community;
