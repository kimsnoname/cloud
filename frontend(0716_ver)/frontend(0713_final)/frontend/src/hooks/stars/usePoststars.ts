import { useMutation } from 'react-query';

const postStarData = async (companyId: number) => {
  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjVmNDY1NjExLWNlZjctNGYxZi05ZjY1LWMxYjU4NTY1N2IyZiIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTcyMDU1NDMwNSwiaWF0IjoxNzIwNDY3OTA1LCJqdGkiOiJQU29BMXNIeHlYYWFEbDc4OFk0eUZWM3JsQzlhc2dFWFl0eEkifQ.0T_MKV8jRou576TiZzCmVOtnp2XkLyWacnSfe8FtUcN_k4Znz9mNv6gWUQEaskMbgg6RbdbGMhIQmNeqXKBR-w";
  // const accessToken = localStorage.getItem("accessToken");
  const res = await fetch(`http://43.203.87.56:8080/stars/?companyId=${companyId}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `${accessToken}`
    }
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Something went wrong');
  }

  return res.json();
};

const usePostStar = () => {
  return useMutation(postStarData);
};

export default usePostStar;
