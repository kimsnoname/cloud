import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Form, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './style/Communityform.css';

const CommunityUpdate: React.FC = () => {
  const navigate = useNavigate();
  const { boardId, id } = useParams<{ boardId: string; id: string }>();
  const [post, setPost] = useState({
    id: '',
    title: '',
    author: '',
    content: '',
    boardId: '',
  });

  useEffect(() => {
    const getPost = async () => {
      try {
        const response = await axios.get(`http://43.203.87.56:8080/api/posts/${boardId}/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        message.error('게시물을 불러오는 데 실패했습니다.');
      }
    };

    getPost();
  }, [boardId, id]);

  const { title, author, content } = post;

  const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, name } = event.target;
    setPost({
      ...post,
      [name]: value,
    });
  };

  const handleContentChange = (value: string) => {
    setPost({
      ...post,
      content: value,
    });
  };

  const updatePost = async () => {
    try {
      await axios.put(`http://43.203.87.56:8080/api/posts/${boardId}/${id}`, post);
      message.success('수정되었습니다.');
      navigate(`/community/${boardId}/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      message.error('게시물 수정에 실패했습니다.');
    }
  };

  const backToDetail = () => {
    navigate(`/community/${boardId}/${id}`);
  };

  return (
    <div className="community-form">
      <h2>게시물 수정</h2>
      <Form layout="vertical" onFinish={updatePost} style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Form.Item label="제목" required>
          <Input type="text" name="title" value={title} onChange={onChange} />
        </Form.Item>
        <Form.Item label="작성자" required>
          <Input type="text" name="author" value={author} readOnly={true} />
        </Form.Item>
        <Form.Item label="내용" required>
          <ReactQuill value={content} onChange={handleContentChange} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">수정</Button>
          <Button type="default" onClick={backToDetail}>취소</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommunityUpdate;
