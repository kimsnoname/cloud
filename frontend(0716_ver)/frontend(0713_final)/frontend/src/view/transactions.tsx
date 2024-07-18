import { useState, useEffect } from 'react';
import { Table, Card, message } from 'antd';
import SidebarLayout from './SidebarLayout';
import './style/transactions.css';
import axios from 'axios';
import moment from 'moment';

const Transactions = () => {
  const [selectedKey, setSelectedKey] = useState('3'); // 기본으로 내 정보 메뉴 선택
  const [tradeData, setTradeData] = useState([]);
  const isMobile = window.innerWidth <= 768;

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
        const response = await axios.get('http://43.203.87.56:8080/api/transaction/list', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const formattedData = response.data.map((trade, index) => ({
          ...trade,
          key: index + 1,
          date: moment(trade.timestamp).format('YYYY-MM-DD HH:mm:ss'),
          amount: trade.price * trade.quantity,
        }));
        
        setTradeData(formattedData);
      } catch (error) {
        message.error('거래 내역을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching transaction data:', error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: '매매일',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <span style={{ color: record.tradeType === 'buy' ? '#FF0000' : '#0000FF' }}>
          {text}
        </span>
      ),
    },
    {
      title: '종목명',
      dataIndex: 'stockName',
      key: 'stockName',
      render: (text, record) => (
        <span style={{ color: record.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>
          {text}
        </span>
      ),
    },
    {
      title: '체결수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (
        <span style={{ color: record.tradeType === 'buy' ? '#FF0000' : '#0000FF' }}>
          {text}
        </span>
      ),
    },
    {
      title: '체결단가',
      dataIndex: 'price',
      key: 'price',
      render: (text, record) => (
        <span style={{ color: record.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>
          {text.toLocaleString()}원
        </span>
      ),
    },
    {
      title: '체결금액',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <span style={{ color: record.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>
          {text.toLocaleString()}원
        </span>
      ),
    },
  ];

  return (
    <>
      {!isMobile ? (
        <div className="desktop-container">
          <SidebarLayout selectedKey={selectedKey} onMenuClick={handleMenuClick}>
            <div className='parent-wrapper-transfer'>
              <div className="wrapper-transfer">
                <Card
                  title={
                    <div>
                      거래 내역
                      <span style={{ marginLeft: '10px', fontSize: '12px' }}>
                        <span style={{ color: '#FF0000' }}>매수는 (buy) 빨간색</span>, 
                        <span style={{ color: '#0000FF', marginLeft: '5px' }}>매도는 (sell) 파란색</span>
                      </span>
                    </div>
                  }
                  style={{ width: "110%" }}
                >
                  <Table
                    className="ant-table-wrapper"
                    dataSource={tradeData}
                    columns={columns}
                  />
                  <div className="mobile-transaction-list">
                    {tradeData.map((trade) => (
                      <div key={trade.key} className="mobile-transaction-card">
                        <div className="card-row">
                          <span className="label">매매일:</span>
                          <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF' }}>{trade.date}</span>
                        </div>
                        <div className="card-row">
                          <span className="label">종목명:</span>
                          <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>{trade.stockName}</span>
                        </div>
                        <div className="card-row">
                          <span className="label">체결수량:</span>
                          <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF' }}>{trade.quantity}</span>
                        </div>
                        <div className="card-row">
                          <span className="label">체결단가:</span>
                          <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>{trade.price.toLocaleString()}원</span>
                        </div>
                        <div className="card-row">
                          <span className="label">체결금액:</span>
                          <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>{trade.amount.toLocaleString()}원</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </SidebarLayout>
        </div>
      ) : (
        <div className="mobile-container">
          <Card
            title={
              <div>
                거래 내역
                <span style={{ marginLeft: '10px', fontSize: '12px' }}>
                  <span style={{ color: '#FF0000' }}>        매수는 (buy) 빨간색</span>, 
                  <span style={{ color: '#0000FF', marginLeft: '5px' }}>매도는 (sell) 파란색</span>
                </span>
              </div>
            }
          >
            <Table
              className="ant-table-wrapper"
              dataSource={tradeData}
              columns={columns}
            />
            <div className="mobile-transaction-list">
              {tradeData.map((trade) => (
                <div key={trade.key} className="mobile-transaction-card">
                  <div className="card-row">
                    <span className="label">매매일:</span>
                    <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>{trade.date}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">종목명:</span>
                    <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>{trade.stockName}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">체결수량:</span>
                    <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>{trade.quantity}주</span>
                  </div>
                  <div className="card-row">
                    <span className="label">체결단가:</span>
                    <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>{trade.price.toLocaleString()}원</span>
                  </div>
                  <div className="card-row">
                    <span className="label">체결금액:</span>
                    <span className="value" style={{ color: trade.tradeType === 'buy' ? '#FF0000' : '#0000FF', fontWeight: 'bold' }}>{trade.amount.toLocaleString()}원</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default Transactions;
