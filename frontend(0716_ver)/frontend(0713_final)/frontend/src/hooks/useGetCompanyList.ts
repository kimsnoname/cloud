import { useQuery } from "react-query";
import axios from "axios";

const useGetCompanyList = () => {
  const { data, isLoading, error } = useQuery("companyList", getCompanyList, {});

  return { companyList: data, compnayListLoading: isLoading, companyListError: error };
};

export default useGetCompanyList;

// 서버에서 Company 목록 fetch 하는 함수
const getCompanyList = async () => {
  const res = await axios.get("http://43.203.87.56:8080/api/kisd/companies");
  const companyList = await res.data;

  return companyList;
};
