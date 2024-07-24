import { useState, useEffect } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import {
  Layout,
  Spin,
  Alert,
  Menu,
  Modal,
  Breadcrumb,
  message,
  Button,
  Dropdown,
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Divider,
} from "antd";
import SidebarLayout from "./SidebarLayout";
import axios from "axios";
import "./style/transfer.css";

const { Option } = Select;

interface AccountInfo {
  accountNumber: string;
  balance: number;
}

interface AccountPasswordEntity {
  userId: string;
  accountPassword: string;
}

interface TransferEntity {
  userId: Number;
  accountPassword: string;
  accountNumber: string;
  amount: Number;
}

const banks = [
  { key: "bank1", name: "국민은행" },
  { key: "bank2", name: "기업은행" },
  { key: "bank3", name: "농협은행" },
  { key: "bank4", name: "신한은행" },
  { key: "bank5", name: "산업은행" },
  { key: "bank6", name: "우리은행" },
  { key: "bank7", name: "한국씨티은행" },
  { key: "bank8", name: "하나은행" },
  { key: "bank9", name: "SC제일은행" },
  { key: "bank10", name: "경남은행" },
  { key: "bank11", name: "새마을금고" },
  { key: "bank12", name: "수협은행" },
  { key: "bank13", name: "우체국" },
  { key: "bank14", name: "카카오뱅크" },
  { key: "bank15", name: "토스뱅크" },
  { key: "bank16", name: "케이뱅크" },
];

const Transfer: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState("4"); // 기본으로 내 정보 메뉴 선택
  // const [contentText, setContentText] = useState('계좌 이체 페이지 입니다!'); // 선택된 메뉴에 따른 내용 표시
  // const [accountNumber, setAccountNumber] = useState('');
  // const [balance, setBalance] = useState<number | undefined>(0);
  // const accountNumber = '123456-12';
  // const balance = '300,000';
  const [accountInfo, setAccountInfo] = useState<{
    accountNumber: string;
    balance: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [accountNumber, setAccountNumber] = useState("");
  const [balance, setBalance] = useState("");

  var selectedBankKey = "";
  const [amount, setTransferAmount] = useState<number | undefined>(undefined);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedBankName, setSelectedBankName] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [showBankMenu, setShowBankMenu] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [userId, setUserId] = useState("");
  const [bankName, setBankName] = useState("");

  const isMobile = window.innerWidth <= 768;

  const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
  const axiosInstance = axios.create({
    baseURL: 'http://43.203.87.56:8080/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // 모든 axios 요청에 JWT 토큰을 추가합니다.
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`; // JWT 토큰을 헤더에 추가
  
    useEffect(() => {
      axiosInstance.get('/account/info')
      .then(response => {
        setAccountInfo(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Failed to fetch account information');
        setLoading(false);
      });
    }, []);
  

  // 은행 클릭 시 작동하는 함수
  const handleBankMenuClick = (bank: any) => {
    setSelectedBank(bank.key);
    setSelectedBankName(bank.name);
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const handleTransferNext = () => {
    // Perform validation or additional steps if needed
    console.log("Transfer amount:", amount);
  };

  const handleTransfer = () => {
    // Perform transfer logic
    console.log(
      `Transfering ${amount} to account ${selectedAccount} at bank ${selectedBank}`
    );
  };

  // 모달 visible 속성 설정
  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setAccountPassword("");
    setAttempts(0);
  };

  const handlePasswordInput = (value: string) => {
    if (accountPassword.length < 6) {
      setAccountPassword(accountPassword + value);
    }
  };

  const handleBackspace = () => {
    setAccountPassword(accountPassword.slice(0, -1));
  };

  const handlePasswordSubmit = async () => {
    // const userId = 22;
    if (accountPassword.length !== 6) {
      message.error("비밀번호는 6자리여야 합니다.");
      return;
    }
    try {
      // 비밀번호 검증 API 호출
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
        console.log('비밀번호가 확인되었습니다.');
        setVisible(false);

        const data = {
          userId,
          accountPassword,
          accountNumber,
          amount,
        };
  
        try {  
          const transferResponse = await axios.post('http://43.203.87.56:8080/api/account/transfer', data, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // JWT 토큰을 Authorization 헤더에 포함
            },
          });
  
          console.log('이체 성공: ', transferResponse.data);
  
          if (transferResponse.status === 201) {
            console.log('이체 성공: ', transferResponse.data);
            navigate('/transferSuccess', { state: { accountNumber, amount }});
          } else {
            console.error('이체 실패');
          }
        } catch (error) {
          console.error('이체 요청 오류:', error);
        }
  
      } else {
        setAttempts(attempts + 1);
        setAccountPassword('');
        if (attempts + 1 >= 5) {
          message.error('비밀번호를 5회 이상 틀렸습니다. 계좌 이체가 불가능합니다.');
          handleCancel();
        } else {
          message.error('비밀번호가 맞지 않습니다.');
        }
      }
    } catch (error) {
      message.error('서버 오류가 발생했습니다.');
      console.error('서버 오류:', error);
    }
};

  const handleNextButtonClick = () => {
    if (amount !== undefined && accountInfo) {
      if (amount > accountInfo.balance) {
        setError("이체 금액이 잔액을 초과할 수 없습니다.");
      } else {
        setError(null);
        // 여기서 이체 로직을 추가하세요.
        console.log("이체 진행");
      }
    }
    setShowBankMenu(!showBankMenu);
  };

  // const selectedBankName = selectedBank ? banks.find(bank => bank.key === selectedBank)?.name : banks.find(bank => bank.name);

  const bankMenu = (
    <>
      {!isMobile ? (
        <div className="desktop-bankmenu-container">
          <Menu onClick={handleBankMenuClick}>
            <div style={{ width: "400px" }}>
              <Row gutter={[8, 8]} className="bankmenu-button-row">
                {banks.map((bank) => (
                  <Col span={6} key={bank.key}>
                    {/* <Button block onClick={() => handleBankMenuClick(bank.key)}> */}
                    <Button
                      block
                      className="bankmenu-button"
                      onClick={() => handleBankMenuClick(bank)}
                    >
                      {bank.name}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>
          </Menu>
        </div>
      ) : (
        <div className="mobile-bankmenu-container">
          <Menu onClick={handleBankMenuClick}>
            <div style={{ width: "300px" }}>
              <Row gutter={[6, 10]} className="bankmenu-button-row">
                {banks.map((bank) => (
                  <Col span={6} key={bank.key}>
                    {/* <Button block onClick={() => handleBankMenuClick(bank.key)}> */}
                    <Button
                      block
                      className="bankmenu-button"
                      onClick={() => handleBankMenuClick(bank)}
                    >
                      {bank.name}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>
          </Menu>
        </div>
      )}
    </>
  );
  const navigate = useNavigate();
  const handleTransferSuccessRedirect = () => {
    navigate("/transferSuccess", { state: { selectedAccount, amount } });
  };

  return (
    <>
      {!isMobile ? (
        <div className="desktop-container">
          <SidebarLayout
            selectedKey={selectedKey}
            onMenuClick={handleMenuClick}
          >
            <div className="parent-wrapper-transfer">
              <div className="wrapper-transfer">
                {/* Account Information Card */}
                <Card title="내 계좌 정보" style={{ width: "110%" }}>
                  <Row gutter={16}>
                    <Col span={11}>
                      <Form.Item label="계좌번호">
                        <Input value={accountInfo?.accountNumber} readOnly />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="계좌 잔액">
                        <Input.Group compact>
                          <Input
                            style={{
                              width: "calc(100% - 40px)",
                              textAlign: "right",
                            }}
                            value={accountInfo?.balance.toLocaleString()}
                            readOnly
                          />
                          <Input
                            style={{ width: "40px", textAlign: "center" }}
                            value="원"
                            readOnly
                          />
                        </Input.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Divider />

                {/* Transfer Section */}
                <Card title="이체하기" style={{ width: "110%" }}>
                  <Form layout="vertical" onFinish={handleTransferNext}>
                    <Row gutter={16}>
                      <Col span={16}>
                        <Form.Item label="이체 금액">
                          <Input.Group compact>
                            <Input
                              style={{
                                width: "calc(100% - 40px)",
                                textAlign: "right",
                              }}
                              type="number"
                              value={amount}
                              onChange={(e) =>
                                setTransferAmount(Number(e.target.value))
                              }
                            />
                            <Input
                              style={{ width: "40px", textAlign: "center" }}
                              value="원"
                              readOnly
                            />
                          </Input.Group>
                        </Form.Item>
                      </Col>
                      <Col>
                        <Form.Item>
                          <Button
                            type="primary"
                            className="transfer-next-button"
                            onClick={handleNextButtonClick}
                            disabled={!amount}
                          >
                            다음
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                    {showBankMenu && (
                      <Row gutter={16} className="select-transfer">
                        <Col span={5}>
                          <Form.Item label="금융 기관 선택">
                            <Input.Group compact>
                              <Input
                                style={{
                                  width: "calc(100% - 40px)",
                                  textAlign: "right",
                                }}
                                value={[selectedBankName]}
                                readOnly
                              />
                              <Dropdown
                                overlay={bankMenu}
                                trigger={["click"]}
                                placement="bottomRight"
                                arrow={{ pointAtCenter: true }}
                              >
                                <Button
                                  style={{ width: "40px", textAlign: "center" }}
                                >
                                  ▼
                                  {/* {selectedBankName ? selectedBankName : '▼'} */}
                                </Button>
                              </Dropdown>
                            </Input.Group>
                          </Form.Item>
                        </Col>
                        <Col span={13}>
                          <Form.Item label="계좌번호">
                            <Input
                              value={accountNumber}
                              onChange={(e) =>
                                setAccountNumber(e.target.value)
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item>
                            <Button
                              type="primary"
                              className="transfer-button"
                              htmlType="submit"
                              disabled={!accountNumber}
                              onClick={showModal}
                            >
                              이체
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </Form>
                  <Divider />
                </Card>
              </div>
            </div>
          </SidebarLayout>
        </div>
      ) : (
        <div className="mobile-container">
          {/* Account Information Card */}
          <Card title="내 계좌 정보" style={{ width: "100%" }}>
            <Form.Item label="계좌번호">
              <Input value={accountInfo?.accountNumber} readOnly />
            </Form.Item>

            <Form.Item label="계좌 잔액">
              <Input.Group compact>
                <Input
                  style={{ width: "calc(100% - 40px)", textAlign: "right" }}
                  value={accountInfo?.balance.toLocaleString()}
                  readOnly
                />
                <Input
                  style={{ width: "40px", textAlign: "center" }}
                  value="원"
                  readOnly
                />
              </Input.Group>
            </Form.Item>
          </Card>

          <Divider />

          {/* Transfer Section */}
          <Card title="이체하기" style={{ width: "100%" }}>
            <Form layout="vertical" onFinish={handleTransferNext}>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item label="이체 금액">
                    <Input.Group compact>
                      <Input
                        style={{
                          width: "calc(100% - 40px)",
                          textAlign: "right",
                          marginLeft: "0px",
                        }}
                        type="number"
                        value={amount}
                        onChange={(e) =>
                          setTransferAmount(Number(e.target.value))
                        }
                      />
                      <Input
                        style={{ width: "40px", textAlign: "center" }}
                        value="원"
                        readOnly
                      />
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item>
                    <Button
                      type="primary"
                      className="transfer-next-button"
                      onClick={handleNextButtonClick}
                      disabled={!amount}
                    >
                      다음
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
              {showBankMenu && (
                <div className="select-transfer">
                  <Form.Item label="금융 기관 선택">
                    <Input.Group compact>
                      <Input
                        style={{
                          width: "calc(100% - 40px)",
                          textAlign: "right",
                        }}
                        value={[selectedBankName]}
                        readOnly
                      />
                      <Dropdown
                        overlay={bankMenu}
                        trigger={["click"]}
                        placement="bottomRight"
                        arrow={{ pointAtCenter: true }}
                      >
                        <Button
                          style={{
                            width: "40px",
                            height: "35.5px",
                            textAlign: "center",
                          }}
                        >
                          ▼
                        </Button>
                      </Dropdown>
                    </Input.Group>
                  </Form.Item>

                  <Form.Item label="계좌번호">
                    <Input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      className="transfer-button"
                      htmlType="submit"
                      disabled={!accountNumber}
                      onClick={showModal}
                    >
                      이체
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form>
            <Divider />
          </Card>
        </div>
      )}
      <div>
        <Modal
          title="비밀번호 입력"
          visible={visible}
          onCancel={handleCancel}
          footer={null}
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
    </>
  );
};

export default Transfer;
