import axios from "axios";

const axiosRegistry = axios.create({
  baseURL: `http://modulo-cadastro:${process.env.PORT_API_CADASTRO}`,
  timeout: 5000,
});

export default axiosRegistry;
