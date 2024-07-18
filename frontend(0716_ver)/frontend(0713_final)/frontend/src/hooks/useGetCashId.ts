import { useQuery } from "react-query";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { StateProps } from "../models/stateProps";
import { setCashId } from '../reducer/cash/cashSlice'; // Import setCashId action

const url = "http://43.203.87.56:8080/cash";

const useGetCashId = () => {
  const dispatch = useDispatch(); // Create a dispatch instance
  const isLogin = useSelector((state: StateProps) => state.login);

  const { data, isLoading, isError } = useQuery("cash", getCashData, {
    enabled: isLogin === 1,
    onSuccess: (data) => {
      dispatch(setCashId(data)); // Dispatch the setCashId action with fetched data
    },
    onError: (error) => {
      console.error("Error fetching cashId:", error);
    }
  });

  return { cashData: data, cashLoading: isLoading, cashError: isError };
};

export default useGetCashId;

const getCashData = async () => {
  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjVmNDY1NjExLWNlZjctNGYxZi05ZjY1LWMxYjU4NTY1N2IyZiIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTcyMDU1NDMwNSwiaWF0IjoxNzIwNDY3OTA1LCJqdGkiOiJQU29BMXNIeHlYYWFEbDc4OFk0eUZWM3JsQzlhc2dFWFl0eEkifQ.0T_MKV8jRou576TiZzCmVOtnp2XkLyWacnSfe8FtUcN_k4Znz9mNv6gWUQEaskMbgg6RbdbGMhIQmNeqXKBR-w";
  // const accessToken = localStorage.getItem("accessToken");
    const options = {
      headers: {
        Authorization: `${accessToken}`,
        "Content-Type": "application/json",
      },
    };
  
    try {
      const response = await axios.get(url, options);
      return response.data.cashId;
    } catch (error) {
      throw new Error((error as Error).message || "Failed to fetch cashId");
    }
  };