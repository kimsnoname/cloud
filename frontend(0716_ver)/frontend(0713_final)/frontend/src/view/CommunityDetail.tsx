import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import './style/Communitydetail.css';

interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  views: number;
  comments: Comment[];
  boardId: string;
}

interface Comment {
  replyId: number;
  userId: string;
  contents: string;
  date: string;
}

const CommunityDetail: React.FC = () => {
  const { id, boardId } = useParams<{ id: string; boardId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://43.203.87.56:8080/api/posts/${boardId}/${id}`);
        setPost(response.data);
        const commentsResponse = await axios.get(`http://43.203.87.56:8080/api/replies/${boardId}/${id}`);
        setComments(commentsResponse.data);
        console.log('Post loaded:', response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        message.error('글을 불러오는 데 실패했습니다.');
      }
    };

    fetchPost();
  }, [boardId, id]);

  if (!post) {
    return <div>글을 찾을 수 없습니다.</div>;
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`http://43.203.87.56:8080/api/posts/${boardId}/${id}`);
      message.success('글이 삭제되었습니다.');
      navigate(`/community/${boardId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      message.error('글 삭제에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment) {
      message.warning('댓글 내용을 입력해주세요.');
      return;
    }
  
    const newCommentData: Comment = {
      replyId: comments.length + 1,
      userId: '익명',
      contents: newComment,
      date: new Date().toISOString().split('T')[0],
    };
  
    try {
      await axios.post(`http://43.203.87.56:8080/api/reply/add`, {
        ...newCommentData,
        boardId,
        postId: id,
      });
      setComments([...comments, newCommentData]);
      setNewComment('');
      message.success('댓글이 추가되었습니다.');
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('댓글 추가에 실패했습니다.');
    }
  };

  const handleCommentDelete = async (replyId: number) => {
    try {
        const response = await axios.delete(`http://43.203.87.56:8080/api/delete/reply/${boardId}/${id}/${replyId}`);
        if (response.status === 204) {
            setComments(comments.filter(comment => comment.replyId !== replyId));
            message.success('댓글이 삭제되었습니다.');
        } else {
            message.error('댓글 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        message.error('댓글 삭제에 실패했습니다.');
    }
};

  return (
    <div className="community-detail">
      <h1>{post.title}</h1>
      <div className="post-meta">
        <p>작성자: {post.author}</p>
        <p>작성일: {post.date}</p>
      </div>
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
      <div className="post-actions">
        <Button type="primary" onClick={() => navigate(`/community/${boardId}`)}>목록</Button>
        <Button type="primary" onClick={() => navigate(`/community/${boardId}/update/${post.id}`)}>수정</Button>
        <Button type="default" onClick={handleDelete}>삭제</Button>
      </div>

      <div className="comments-section">
        <h2>댓글</h2>
        <Form layout="vertical" onFinish={handleCommentSubmit}>
          <Form.Item>
            <Input.TextArea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={4}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">댓글 작성</Button>
          </Form.Item>
        </Form>

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.replyId} className="comment">
              <div className="comment-meta">
                <p>{comment.userId}</p>
                <p>{comment.date}</p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: comment.contents }}></div>
              <Button type="link" onClick={() => handleCommentDelete(comment.replyId)}>삭제</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
