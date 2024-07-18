import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Input, message, Pagination } from 'antd';
import axios from 'axios';
import './style/Board.css';

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

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // 페이지당 게시물 수
  const [navigateBoardId, setNavigateBoardId] = useState<string>(''); // 게시판 이동 ID
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://43.203.87.56:8080/api/posts/${boardId}`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        message.error('게시물을 불러오는 데 실패했습니다.');
      }
    };

    fetchPosts();
  }, [boardId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBoardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setNavigateBoardId(value);
    }
  };

  const handleNavigate = () => {
    navigate(`/community/${navigateBoardId}`);
  };

  const handleWriteClick = () => {
    if (isLoggedIn) {
      navigate(`/community/${boardId}/new`);
    } else {
      message.warning('로그인이 필요합니다.');
      navigate('/login');
    }
  };

  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const startIndex = (currentPage - 1) * pageSize;
  const currentPosts = sortedPosts.slice(startIndex, startIndex + pageSize);

  return (
    <div className="board-list">
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <h1>{boardId} 토론장</h1>

        <div className="desktop-view">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: '40%' }}>제목</th>
                <th style={{ textAlign: 'center', width: '10%' }}>작성자</th>
                <th style={{ textAlign: 'center', width: '15%' }}>날짜</th>
                <th style={{ textAlign: 'center', width: '10%' }}>댓글 수</th>
                <th style={{ textAlign: 'center', width: '10%' }}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.map(post => (
                <tr key={`${post.boardId}-${post.id}`}>
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
          <Link to={`/community/${boardId}/new`}>
            <Button type="primary" className="write-button">글 작성</Button>
          </Link>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={posts.length}
            onChange={handlePageChange}
            showSizeChanger={false}
            style={{ textAlign: 'center', marginTop: '20px' }}
          />
        </div>

        <div className="navigate-board">
          <Input
            placeholder="게시판 ID 입력 (6자리 숫자)"
            value={navigateBoardId}
            onChange={handleBoardChange}
            maxLength={6}
          />
          <Button type="primary" className="navigate-button" onClick={handleNavigate}>게시판 이동</Button>
        </div>

        <div className="mobile-view">
          <ul className="mobile-list">
            {currentPosts.map(post => (
              <li key={`${post.boardId}-${post.id}`}>
                <Link to={`/community/${post.boardId}/${post.id}`}>
                  <h3>{post.title}</h3>
                  <p>작성자: {post.author}</p>
                  <p>날짜: {post.date}</p>
                  <p>댓글 수: {post.comments}</p>
                  <p>조회수: {post.views}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link to={`/community/${boardId}/new`}>
            <Button type="primary" className="write-button">글 작성</Button>
          </Link>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={posts.length}
            onChange={handlePageChange}
            showSizeChanger={false}
            style={{ textAlign: 'center', marginTop: '20px' }}
          />
        </div>
      </Space>
    </div>
  );
};

export default Board;
