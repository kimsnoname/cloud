import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './style/Communityform.css';
import axios from 'axios';

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

const CommunityForm: React.FC = () => {
  const navigate = useNavigate();
  const { id, boardId } = useParams<{ id: string; boardId: string }>();
  const isEdit = Boolean(id);
  const [posts, setPosts] = useState<Post[]>([]);
  const post = isEdit ? posts.find(p => p.id === Number(id)) : undefined;
  const quillRef = useRef<ReactQuill>(null);

  const [title, setTitle] = useState<string>(post?.title || '');
  const [author, setAuthor] = useState<string>(post?.author || '');
  const [content, setContent] = useState<string>(post?.content || '');
  const [boardIdInput, setBoardIdInput] = useState<string>(post?.boardId || boardId || '000000');

  useEffect(() => {
    if (boardId) {
      setBoardIdInput(boardId);
    }
  }, [boardId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthor(e.target.value);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleBoardIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardIdInput(e.target.value);
  };

  const handleSubmit = async () => {
    if (!title || !author || !content || !boardIdInput) {
      message.warning('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:4000/posts/${boardIdInput}`);
      const boardPosts = response.data;
      const newPostId = isEdit ? post!.id : boardPosts.length + 1;

      const newPost: Post = {
        id: newPostId,
        title,
        author,
        date: new Date().toISOString().split('T')[0],
        content,
        views: isEdit ? post!.views : 0,
        comments: isEdit ? post!.comments : 0,
        boardId: boardIdInput,
      };

      if (isEdit) {
        const response = await axios.put(`http://localhost:4000/posts/${boardIdInput}/${id}`, newPost);
        setPosts(posts.map(p => (p.id === newPost.id && p.boardId === newPost.boardId ? response.data : p)));
      } else {
        const response = await axios.post(`http://localhost:4000/posts`, newPost);
        setPosts([...posts, response.data]);
      }
      message.success('글이 저장되었습니다.');
      navigate(`/community/${boardIdInput}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Board does not exist, create a new one
        try {
          const newPostId = 1; // Start from 1 for the new board
          const newPost: Post = {
            id: newPostId,
            title,
            author,
            date: new Date().toISOString().split('T')[0],
            content,
            views: 0,
            comments: 0,
            boardId: boardIdInput,
          };

          const response = await axios.post(`http://localhost:4000/posts`, newPost);
          setPosts([...posts, response.data]);
          message.success('새로운 게시판이 생성되고 글이 저장되었습니다.');
          navigate(`/community/${boardIdInput}`);
        } catch (creationError) {
          console.error('Error creating new board and saving post:', creationError);
          message.error('새로운 게시판 생성 및 글 저장에 실패했습니다.');
        }
      } else {
        console.error('Error fetching board posts or saving post:', error);
        message.error('게시판 정보를 불러오거나 글 저장에 실패했습니다.');
      }
    }
  };

  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  return (
    <div className="community-form">
      <Form layout="vertical" onFinish={handleSubmit} style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Form.Item label="제목" required>
          <Input value={title} onChange={handleTitleChange} />
        </Form.Item>
        <div className="author-boardid-row">
          <Form.Item label="작성자" required style={{ flex: 1, marginRight: '8px' }}>
            <Input value={author} onChange={handleAuthorChange} />
          </Form.Item>
          <Form.Item label="게시판 ID" required style={{ flex: 1 }}>
            <Input value={boardIdInput} onChange={handleBoardIdChange} maxLength={6} />
          </Form.Item>
        </div>
        <Form.Item label="내용" required>
          <ReactQuill
            ref={quillRef}
            value={content}
            onChange={handleContentChange}
            modules={modules}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">저장</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommunityForm;
