import React, { ReactNode } from "react";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Layout, Input, Button, Row, Col, List, Typography, Card, Space, message, Modal } from 'antd';
import axios from 'axios';
import './style/transfer.css';
import Community from "./Community";
import CandlestickChart from '../components/candlestickChart';
import { css } from '@emotion/react';

const { Content } = Layout;
const { Text, Title } = Typography;
const gridStyle: React.CSSProperties = {
	width: '50%',
	textAlign: 'center',
	height: 5, display: 'flex', alignItems: 'center', justifyContent: 'center'
};


axios.defaults.withCredentials = false;
axios.defaults.baseURL = 'http://3.34.171.35:5002';

interface StockData {
	stock_code: string;
	product_name: string;
	current_price: number;
	low_price: number;
	high_price: number;
	expected_closing_price: number;
	sell_orders: { price: number; quantity: number; }[];
	buy_orders: { price: number; quantity: number; }[];
	volume: number; // 거래량 추가
}

interface TradeEntity {
	userId: number;
	price: number;
	quantity: number;
	stockCode: string;
	productName: string;
}


const isMobile = window.innerWidth <= 768;
const windowSize = window.innerWidth
const cardSize = windowSize - 30

const Trading: React.FC = () => {
	const [stockData, setStockData] = useState<StockData | null>(null);
	const [productName, setProductName] = useState<string>('삼성전자');
	const [price, setPrice] = useState<number | null>(null);
	const [quantity, setQuantity] = useState<number | null>(null);
	const [userQuantity, setUserQuantity] = useState<number | null>(null);
	const [stockCode, setStockCode] = useState<string>('005930'); // 기본값을 '005930'으로 설정
	const [chartVisible, setChartVisible] = useState<boolean>(true);
	const [jobDate, setJobDate] = useState<string>('');
	const [accountPassword, setAccountPassword] = useState("");
	const [attempts, setAttempts] = useState(0);
	const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
	const [visible, setVisible] = useState(false);
	const navigate = useNavigate();


	useEffect(() => {
		const fetchStockData = async (code: string) => {
			try {
				const response = await axios.get<StockData>(`http://3.34.171.35:5002/stock/${code}`);
				const calculatedVolume = calculateVolume(response.data); // 거래량 계산
				setStockData({ ...response.data, volume: calculatedVolume });
				setProductName(response.data.product_name);
				setJobDate(new Date().toLocaleString());

			} catch (error) {
				console.error('Error fetching stock data:', error);
			}
		};

		fetchStockData(stockCode);

		// Refresh stock data every 61 seconds
		const interval = setInterval(() => fetchStockData(stockCode), 61000);

		return () => clearInterval(interval);
	}, [stockCode]);

	useEffect(() => {
		const fetchUserQuantity = async () => {
			setUserQuantity(0);
			try {
				const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
				const response = await axios.get<{ quantity: number }>(`http://43.203.87.56:8080/api/user/stock/${stockCode}`, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
				setUserQuantity(response.data.quantity);
			} catch (error) {
				console.error('Error fetching user quantity:', error);
			}
		};

		if (stockCode) {
			fetchUserQuantity();
		}
	}, [stockCode]);


	const calculateVolume = (data: StockData) => {
		// Sell orders의 quantity 합계 계산
		const sellVolume = data.sell_orders.reduce((acc, order) => acc + order.quantity, 0);
		// Buy orders의 quantity 합계 계산
		const buyVolume = data.buy_orders.reduce((acc, order) => acc + order.quantity, 0);
		// 총 거래량 반환
		return sellVolume + buyVolume;
	};

	const handlePasswordInput = (value: string) => {
		if (accountPassword.length < 6) {
			setAccountPassword(accountPassword + value);
		}
	};

	const handleBackspace = () => {
		setAccountPassword(accountPassword.slice(0, -1));
	};
	const handleCancel = () => {
		setVisible(false);
		setAccountPassword("");
		setAttempts(0);
	};

	const handlePasswordSubmit = async () => {
		if (!accountPassword) {
			alert('계좌번호를 확인해 주세요.');
			return;
		}

		const userId = 1;
		const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기

		if (accountPassword.length !== 6) {
			message.error("비밀번호는 6자리여야 합니다.");
			return;
		}
		try {
			const response = await axios.post(
				'http://43.203.87.56:8080/api/transfer/verifypassword',
				{
					userId,
					accountPassword
				},
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			if (response.data.success) {
				message.success("비밀번호가 확인되었습니다.");


				const data: TradeEntity = {
					userId,
					price,
					quantity,
					stockCode,
					productName
				};
				try {
					const response = await axios.post(
						`http://43.203.87.56:8080/api/transaction/${tradeType}`, data,
						{
							headers: {
								"Content-Type": "application/json",
								'Authorization': `Bearer ${token}`
							},
						}
					);
					console.log("거래 성공: ", response.data);
					console.log(response.status);
					if (response.status === 200) {
						alert('거래가 성공적으로 완료되었습니다.');
						navigate("/trading");
					} else {
						console.error(response.status);
						console.error("거래 실패: ${response.data.message}");
					}

				} catch (error) {
					message.error("서버 오류가 발생했습니다.");

					console.error(error);
				}
			} else {
				setAttempts(attempts + 1);
				setAccountPassword("");
				if (attempts + 1 >= 5) {
					message.error(
						"비밀번호를 5회 이상 틀렸습니다. 거래가 불가능합니다."
					);
					handleCancel();
				} else {
					message.error("비밀번호가 맞지 않습니다.");
				}
			}
		} catch (error) {
			message.error("서버 오류가 발생했습니다.");

			console.error(error);
		};
	}


	const canSell = quantity !== null && userQuantity !== null && quantity <= userQuantity;

	const handlePriceClick = (selectedPrice: number) => {
		setPrice(selectedPrice);
	};

	const handleSearch = () => {
		if (stockCode) {
			setStockCode(stockCode); // 입력된 종목 코드로 업데이트
		}
		const fetchUserQuantity = async () => {
			setUserQuantity(0);
			try {
				const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
				const response = await axios.get<{ quantity: number }>(`http://43.203.87.56:8080/api/user/stock/${stockCode}`, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
				setUserQuantity(response.data.quantity);
			} catch (error) {
				console.error('Error fetching user quantity:', error);
			}
		};

		if (stockCode) {
			fetchUserQuantity();
		}
	};

	const toggleChartVisibility = () => {
		setChartVisible(!chartVisible);
	};

	if (!stockData) {
		return <p>Loading...</p>;
	}




	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: 'white', width: '100%', overflowX: 'hidden' }}>
			<Content style={{ padding: '30px 10px' }}>
				<Row gutter={[3, 3]}>


					<Col xs={24} sm={17}>
						<div className="container">
							<div className="sub-container-2">

								<Row style={{ alignItems: 'center' }}>
									{!isMobile ? (
										<Col span={6}>
											<Card className="price-info" bordered={true} size="small" style={{ width: '100%', height: '100px', display: 'flex', alignItems: 'left', textAlign: 'left', justifyContent: 'left' }}>
												<Title level={5} style={{ marginTop: 0, marginBottom: '-30px', marginLeft: '10px', color: '#C94077', fontWeight: "bold" }}>{productName}</Title>
												<Title level={3} style={{ marginBottom: '-21px', marginLeft: '10px' }}>{stockData.current_price}원</Title>
												{/* <Title level={5} style={{marginTop:'-15px', textSizeAdjust:10}}>{jobDate}</Title> */}
												<span style={{ fontSize: '15px', marginLeft: '10px' }}>{jobDate}</span>
											</Card>
										</Col>
									) : (
										<Col span={24}>
											<Card className="price-info" bordered={true} size="small" style={{ width: cardSize, height: '100px', display: 'flex', alignItems: 'left', textAlign: 'left', justifyContent: 'left' }}>
												<Title level={5} style={{ marginTop: 0, marginBottom: '-30px', marginLeft: '10px', color: '#C94077', fontWeight: "bold" }}>{productName}</Title>
												<Title level={3} style={{ marginBottom: '-21px', marginLeft: '10px' }}>{stockData.current_price}원</Title>
												{/* <Title level={5} style={{marginTop:'-15px', textSizeAdjust:10}}>{jobDate}</Title> */}
												<span style={{ fontSize: '15px', marginLeft: '10px' }}>{jobDate}</span>
											</Card>
										</Col>
									)}
									{!isMobile ? (
										<Col span={11}>
											<div className="other-info">
												<Card size="small" style={{ width: '90%' }}>
													<Card.Grid style={gridStyle}>
														저가: {stockData.low_price}원
													</Card.Grid>
													<Card.Grid style={gridStyle}>
														예상체결가: {stockData.expected_closing_price}원
													</Card.Grid>
													<Card.Grid style={gridStyle}>
														고가: {stockData.high_price}원
													</Card.Grid>
													<Card.Grid style={gridStyle}>
														거래량: {stockData.volume}주
													</Card.Grid>
												</Card>
											</div>
										</Col>
									) : (
										<Col span={24}>
											<div className="other-info">
												<Card size="small" style={{ width: cardSize }}>
													<Card.Grid style={gridStyle}>
														저가: {stockData.low_price}원
													</Card.Grid>
													<Card.Grid style={gridStyle}>
														예상체결가: {stockData.expected_closing_price}원
													</Card.Grid>
													<Card.Grid style={gridStyle}>
														고가: {stockData.high_price}원
													</Card.Grid>
													<Card.Grid style={gridStyle}>
														거래량: {stockData.volume}주
													</Card.Grid>
												</Card>
											</div>
										</Col>
									)}
									{!isMobile ? (
										<Col span={6}>
											<div className="sub-container-1">
												<Card size="small" style={{ marginLeft: '-4.6%' }}>
													<Space direction="vertical" style={{ marginLeft: '0' }}>
														<Space.Compact block>
															<Input
																placeholder="종목코드 혹은 종목명"
																name="stock-input"
																value={stockCode}
																onChange={(e) => setStockCode(e.target.value)}
																style={{ width: 'calc(100% - 20px)', maxWidth: '150px' }}
															/>
															<Button type="primary" onClick={handleSearch}>검색</Button>
														</Space.Compact>
														<Space.Compact block>
															<Button onClick={toggleChartVisibility} style={{ marginLeft: '0px' }}>
																{chartVisible ? '차트 숨기기' : '차트 보이기'}
															</Button>
														</Space.Compact>
													</Space>
												</Card>
											</div>
										</Col>
									) : (
										<Col span={24}>
											<div className="sub-container-1">
												<Card size="small" style={{ width: cardSize }}>

													<Input
														placeholder="종목코드 혹은 종목명"
														name="stock-input"
														value={stockCode}
														onChange={(e) => setStockCode(e.target.value)}
														style={{ width: 'calc(100% - 20px)', maxWidth: '50%' }}
													/>
													<Button type="primary" onClick={handleSearch}>검색</Button>

													<Button onClick={toggleChartVisibility} style={{ marginLeft: '0%' }}>
														{chartVisible ? '차트 숨기기' : '차트 보이기'}
													</Button>

												</Card>
											</div>
										</Col>
									)}
								</Row>
							</div>

							{chartVisible && (
								<div className="sub-container-2">
									{!isMobile ? (
										<Card style={{ width: '89.5%', height: '80%', display: 'flex' }}>
											<CandlestickChart stockCode={stockCode} width={800} />
										</Card>
									) : (
										<Card style={{ width: cardSize, height: '80%', display: 'flex' }}>
											<CandlestickChart stockCode={stockCode} width={cardSize - 50} />
										</Card>
									)}
								</div>
							)}

							<div className="sub-container-3">
								<Row gutter={[16, 16]}>
									<Col xs={24} sm={8}>
										{!isMobile ? (
											<List
												header={<div>Sell Orders</div>}
												bordered
												dataSource={stockData.sell_orders}
												renderItem={item => (
													<List.Item onClick={() => handlePriceClick(item.price)}>
														<Text style={{ color: 'blue' }} className="price">{item.price}원</Text>
														<Text style={{ color: 'blue' }} className="quantity">{item.quantity}주</Text>
													</List.Item>
												)}
											/>
										) : (
											<List
												header={<div>Sell Orders</div>}
												bordered
												style={{ width: cardSize }}
												dataSource={stockData.sell_orders}
												renderItem={item => (
													<List.Item onClick={() => handlePriceClick(item.price)}>
														<Text style={{ color: 'blue' }} className="price">{item.price}원</Text>
														<Text style={{ color: 'blue' }} className="quantity">{item.quantity}주</Text>
													</List.Item>
												)}
											/>
										)}
									</Col>
									<Col xs={24} sm={8}>
										{!isMobile ? (
											<List
												header={<div>Buy Orders</div>}
												bordered

												dataSource={stockData.buy_orders}
												renderItem={item => (
													<List.Item onClick={() => handlePriceClick(item.price)}>
														<Text style={{ color: 'red' }} className="price">{item.price}원</Text>
														<Text style={{ color: 'red' }} className="quantity">{item.quantity}주</Text>
													</List.Item>
												)}
											/>
										) : (
											<List
												header={<div>Buy Orders</div>}
												bordered
												style={{ width: cardSize }}
												dataSource={stockData.buy_orders}
												renderItem={item => (
													<List.Item onClick={() => handlePriceClick(item.price)}>
														<Text style={{ color: 'red' }} className="price">{item.price}원</Text>
														<Text style={{ color: 'red' }} className="quantity">{item.quantity}주</Text>
													</List.Item>
												)}
											/>

										)}

									</Col>
									<Col xs={24} sm={8}>
										{!isMobile ? (
											<div>
												<Card>
													<Input
														placeholder="가격 (호가창에서 선택)"
														type="number"
														value={price !== null ? price : ''}
														onChange={(e) => setPrice(parseFloat(e.target.value))}
														style={{ width: '100%', marginBottom: '10px' }}
													/>
													<Input
														placeholder="수량"
														type="number"
														value={quantity !== null ? quantity : ''}
														onChange={(e) => setQuantity(parseFloat(e.target.value))}
														style={{ width: '100%', marginBottom: '10px' }}
													/>
													<Button type="primary" onClick={() => { setTradeType('buy'); setVisible(true); }} block>매수</Button>
												</Card>

												<Card>
													<Input
														placeholder="가격"
														type="number"
														value={stockData.current_price}
														readOnly
														style={{ width: '100%', marginBottom: '10px' }}
													/>
													<Input
														placeholder={userQuantity !== null ? `수량 (보유: ${userQuantity})` : '수량'}
														type="number"
														value={quantity !== null ? quantity : ''}
														onChange={(e) => setQuantity(parseFloat(e.target.value))}
														style={{ width: '100%', marginBottom: '10px' }}
													/>
													<div style={{ marginBottom: '10px' }}>
														{userQuantity !== null && <span>보유 수량: {userQuantity} 개</span>}
													</div>
													<Button type="primary" onClick={() => { setPrice(stockData.current_price); setTradeType('sell'); setVisible(true); }} disabled={!canSell} block>매도</Button>
												</Card>
											</div>
										) : (
											<div>
												<Card style={{ width: cardSize, marginBottom: '10px' }}>
													<Input
														placeholder="가격 (호가창에서 선택)"
														type="number"
														value={price !== null ? price : ''}
														onChange={(e) => setPrice(parseFloat(e.target.value))}
														style={{ width: '100%', marginBottom: '10px' }}
													/>
													<Input
														placeholder="수량"
														type="number"
														value={quantity !== null ? quantity : ''}
														onChange={(e) => setQuantity(parseFloat(e.target.value))}
														style={{ width: '100%', marginBottom: '10px' }}
													/>
													<Button type="primary" onClick={() => { setTradeType('buy'); setVisible(true); }} block>매수</Button>
												</Card>

												<Card style={{ width: cardSize }}>
													<Input
														placeholder="가격"
														type="number"
														value={stockData.current_price}
														readOnly
														style={{ width: '100%', marginBottom: '10px' }}
													/>
													<Input
														placeholder={userQuantity !== null ? `수량 (보유: ${userQuantity})` : '수량'}
														type="number"
														value={quantity !== null ? quantity : ''}
														onChange={(e) => setQuantity(parseFloat(e.target.value))}
														style={{ width: '100%', marginBottom: '10px' }}
													/>
													<div style={{ marginBottom: '10px' }}>
														{userQuantity !== null && <span>보유 수량: {userQuantity} 개</span>}
													</div>
													<Button type="primary" onClick={() => { setPrice(stockData.current_price); setTradeType('sell'); setVisible(true); }} disabled={!canSell} block>매도</Button>
												</Card>
											</div>
										)}
									</Col>
								</Row>
							</div>
						</div>
					</Col>



					{/* 아래 부분은 모바일에서 보이지 않도록 설정 */}
					<Col xs={0} sm={7} style={{ height: 'calc(100vh - 100px)' }}>
						<Community
							customStyle={{
								height: '100%',
								width: '80%',
								marginRight: '40px',
								backgroundColor: 'white',
								borderRadius: '8px',
							}}
							hideInput={true}
							h1Style={{
								fontSize: '20px',
								textAlign: 'left',
								fontFamily: 'Noto Sans KR',
							}}
						/>
					</Col>
				</Row>

				<div>
					<Modal
						title="비밀번호 입력"
						visible={visible}
						onCancel={handleCancel}
						footer={null}
						className="custom-modal" // 커스텀 스타일 클래스 추가
						style={{ top: '30%' }}
						width={400} // 모달의 전체 너비 조정
					>
						<div className="modal-content">
							<div className="password-dots">
								{Array(6)
									.fill(0)
									.map((_, i) => (
										<div
											key={i}
											className={`password-dot ${i < accountPassword.length ? "filled" : ""}`}
										/>
									))}
							</div>
							<Row gutter={[16, 16]} className="button-grid">
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, "Backspace", 0, "Submit"].map(
									(item, index) => (
										<Col span={8} key={index}>
											<Button
												type="primary"
												block
												onClick={() => {
													if (item === "Submit") {
														handlePasswordSubmit();
													} else if (item === "Backspace") {
														handleBackspace();
													} else {
														handlePasswordInput(item.toString());
													}
												}}
											>
												{item}
											</Button>
										</Col>
									)
								)}
							</Row>
						</div>
					</Modal>
				</div>
			</Content>
		</Layout>
	)
}

export default Trading;