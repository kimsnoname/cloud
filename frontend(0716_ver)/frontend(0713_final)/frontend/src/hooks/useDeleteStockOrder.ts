import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

const useDeleteStockOrder = () => {
  const queryClient = useQueryClient();

  const mutate = useMutation((data: { orderId: number; cancleVolume: number }) => deleteStockOrder(data.orderId, data.cancleVolume), {
    onSuccess: () => {
      queryClient.invalidateQueries("holdingStock");
      queryClient.invalidateQueries("orderRecord");
    },
  });

  return mutate;
};

export default useDeleteStockOrder;

const deleteStockOrder = async (orderId: number, cancleVolume: number) => {
  const url = `http://43.203.87.56:8080/api/kisd/stock/stockorders?stockOrderId=${orderId}&stockCount=${cancleVolume}`;

  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjVmNDY1NjExLWNlZjctNGYxZi05ZjY1LWMxYjU4NTY1N2IyZiIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTcyMDU1NDMwNSwiaWF0IjoxNzIwNDY3OTA1LCJqdGkiOiJQU29BMXNIeHlYYWFEbDc4OFk0eUZWM3JsQzlhc2dFWFl0eEkifQ.0T_MKV8jRou576TiZzCmVOtnp2XkLyWacnSfe8FtUcN_k4Znz9mNv6gWUQEaskMbgg6RbdbGMhIQmNeqXKBR-w";
  // const accessToken = localStorage.getItem("accessToken");
  const options = {
    headers: {
      Authorization: `${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const response = await axios.delete(url, options);
  return response;
};
