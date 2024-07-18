import { useQuery } from "react-query";
import axios from "axios";

const useGetStockHolds = () => {
  const { data, isLoading, error } = useQuery("stockHolds", getStockHolds, {});

  return { stockHolds: data, stockHoldsLoading: isLoading, stockHoldsError: error };
};

export default useGetStockHolds;

// 서버에서 StockHolds 목록 fetch 하는 함수
const getStockHolds = async () => {
  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjVmNDY1NjExLWNlZjctNGYxZi05ZjY1LWMxYjU4NTY1N2IyZiIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTcyMDU1NDMwNSwiaWF0IjoxNzIwNDY3OTA1LCJqdGkiOiJQU29BMXNIeHlYYWFEbDc4OFk0eUZWM3JsQzlhc2dFWFl0eEkifQ.0T_MKV8jRou576TiZzCmVOtnp2XkLyWacnSfe8FtUcN_k4Znz9mNv6gWUQEaskMbgg6RbdbGMhIQmNeqXKBR-w";
  // const accessToken = localStorage.getItem("accessToken");
  const res = await axios.get("http://43.203.87.56:8080/stock/stockholds", {
    headers: {
      'Authorization': accessToken
    }
  });
  const stockHoldsList = await res.data;

  return stockHoldsList;
};
