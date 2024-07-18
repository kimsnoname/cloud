import axios from 'axios';
import { EquityResponse } from './types';

const apiClient = axios.create({
  baseURL: 'http://43.203.87.56:8080/api/kisd', // Spring Boot 서버의 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEquityData = (id: string): Promise<EquityResponse> => {
  return apiClient.get<EquityResponse>(`/equities/${id}`).then((response) => response.data);
};

// export const getEquityData = async (id: string) => {
//     const response = await axios.get<EquityResponse>(`http://43.203.87.56:8080/api/kisd/equities/${id}`);
//     return response.data;
// };