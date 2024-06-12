import axios from "axios";
const AxiosInstance = axios.create({
  baseURL: "",
  withCredentials: true,
});

export default AxiosInstance;
