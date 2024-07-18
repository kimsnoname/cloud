import { useSelector } from "react-redux";
import { StateProps } from "../models/stateProps";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

const useTradeStock = () => {
  const orderType = useSelector((state: StateProps) => state.stockOrderType);
  const companyId = useSelector((state: StateProps) => state.companyId);
  const orderPrice = useSelector((state: StateProps) => state.stockOrderPrice);
  const orderVolume = useSelector((state: StateProps) => state.stockOrderVolume);

  const queryClient = useQueryClient();
  const orderRequest = useMutation(() => postOrderRequest(orderType, companyId, orderPrice, orderVolume), {
    onSuccess: () => {
      queryClient.invalidateQueries("cash");
      queryClient.invalidateQueries("holdingStock");
      queryClient.invalidateQueries("orderRecord");

      // 🟢 중복되는 커스텀훅 -> 일단 기능구현 위해 처리함
      queryClient.invalidateQueries("stockHolds");
      queryClient.invalidateQueries("money");
    },
  });
  return orderRequest;
};

export default useTradeStock;

const postOrderRequest = async (orderType: boolean, companyId: number, price: number, volume: number) => {
  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjVmNDY1NjExLWNlZjctNGYxZi05ZjY1LWMxYjU4NTY1N2IyZiIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTcyMDU1NDMwNSwiaWF0IjoxNzIwNDY3OTA1LCJqdGkiOiJQU29BMXNIeHlYYWFEbDc4OFk0eUZWM3JsQzlhc2dFWFl0eEkifQ.0T_MKV8jRou576TiZzCmVOtnp2XkLyWacnSfe8FtUcN_k4Znz9mNv6gWUQEaskMbgg6RbdbGMhIQmNeqXKBR-w";
  // const accessToken = localStorage.getItem("accessToken");

  const options = {
    headers: {
      Authorization: `${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  // 매수
  if (!orderType) {
    const response = await axios.post(`http://43.203.87.56:8080/stock/buy?companyId=${companyId}&price=${price}&stockCount=${volume}`, {}, options);
    const orderResult = await response.data;

    return orderResult;
  }

  // 매도
  if (orderType) {
    const response = await axios.post(`http://43.203.87.56:8080/stock/sell?companyId=${companyId}&price=${price}&stockCount=${volume}`, {}, options);
    const orderResult = await response.data;

    return orderResult;
  }
};
