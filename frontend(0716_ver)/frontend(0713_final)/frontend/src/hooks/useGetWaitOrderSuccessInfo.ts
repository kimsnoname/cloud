import { useQuery, useQueryClient } from "react-query";
import axios from "axios";

const url = "http://43.203.87.56:8080/long-polling/listen";

const useGetWaitOrderSuccessInfo = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery("waitOrderSuccess", getWaitOrderSuccessInfo, {
    enabled: true,
    onSuccess: (data) => {
      console.log(new Date());
      console.log("미체결 거래 알림 성공");

      queryClient.invalidateQueries("cash");
      queryClient.invalidateQueries("holdingStock");
      queryClient.invalidateQueries("orderRecord");

      console.log(data);
      refetch();
      console.log("미체결 거래알림 재시작");
    },
    onError: () => {
      console.log("미체결 거래 알림 재요청");
      refetch();
    },
  });

  return { waitOrderSuccessData: data, waitOrderSuccessLoading: isLoading, waitOrderSuccessError: isError };
};

export default useGetWaitOrderSuccessInfo;

const getWaitOrderSuccessInfo = async () => {
  console.log("미체결 주문 처리대기 실행");
  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjVmNDY1NjExLWNlZjctNGYxZi05ZjY1LWMxYjU4NTY1N2IyZiIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTcyMDU1NDMwNSwiaWF0IjoxNzIwNDY3OTA1LCJqdGkiOiJQU29BMXNIeHlYYWFEbDc4OFk0eUZWM3JsQzlhc2dFWFl0eEkifQ.0T_MKV8jRou576TiZzCmVOtnp2XkLyWacnSfe8FtUcN_k4Znz9mNv6gWUQEaskMbgg6RbdbGMhIQmNeqXKBR-w";
  // const accessToken = localStorage.getItem("accessToken");
  const options = {
    headers: {
      Authorization: `${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const response = await axios.get(url, options);
  const orderInfo = await response.data;
  return orderInfo;
};
