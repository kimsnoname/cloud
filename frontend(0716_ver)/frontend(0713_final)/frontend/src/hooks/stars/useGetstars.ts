import { useQuery } from 'react-query';

type StockAsBiResponseDto = {
  stockAsBiId: number;
  companyId: number;
  askp1: string;
  askp2: string;
  // ... 나머지 필드들
};

type StockInfResponseDto = {
  stockInfId: number;
  companyId: number;
  stck_prpr: string;
  prdy_vrss: string;
  prdy_ctrt: string;
  acml_vol: string;
  acml_tr_pbmn: string;
};

type CompanyResponseDto = {
  companyId: number;
  code: string;
  korName: string;
  stockAsBiResponseDto: StockAsBiResponseDto;
  stockInfResponseDto: StockInfResponseDto;
};

type StarDataItem = {
  starId: number;
  memberId: number;
  companyResponseDto: CompanyResponseDto;
};

type StarData = StarDataItem[];

const fetchStarData = async (): Promise<StarData> => {
  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjVmNDY1NjExLWNlZjctNGYxZi05ZjY1LWMxYjU4NTY1N2IyZiIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTcyMDU1NDMwNSwiaWF0IjoxNzIwNDY3OTA1LCJqdGkiOiJQU29BMXNIeHlYYWFEbDc4OFk0eUZWM3JsQzlhc2dFWFl0eEkifQ.0T_MKV8jRou576TiZzCmVOtnp2XkLyWacnSfe8FtUcN_k4Znz9mNv6gWUQEaskMbgg6RbdbGMhIQmNeqXKBR-w";
  // const accessToken = localStorage.getItem("accessToken");
  const res = await fetch('http://43.203.87.56:8080/stars', {
    headers: {
      'Authorization': `${accessToken}`
    }
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Something went wrong');
  }

  return res.json();
};

const useGetStar = () => {
  return useQuery<StarData, Error>('starData', fetchStarData);
};

export default useGetStar;
