import axiosRegistry from "./axiosInstance";
import { registryRoutes } from "./endpoints";
import { logError } from "../../utils/logError";

export const getEmployeeById = async (id: string) => {
  try {
    const response = await axiosRegistry.get(registryRoutes.getEmployeeById(id));
    return response.data?.data || null;
  } catch (error: unknown) {
    logError("getEmployeeById", error);
    return null;
  }
};