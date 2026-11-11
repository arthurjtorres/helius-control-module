import axios from "axios";
import { attachServiceToken } from "./serviceToken";

const axiosRegistry = axios.create({
  baseURL: `http://modulo-cadastro:${process.env.PORT_API_CADASTRO}`,
  timeout: 5000,
});

attachServiceToken(axiosRegistry, "control");

export default axiosRegistry;
