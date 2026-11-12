import axiosRegistry from "./axiosInstance";
import { registryRoutes } from "./endpoints";
import { logError } from "../../utils/logError";

export const getPersonById = async (id: string) => {
  try {
    const response = await axiosRegistry.get(registryRoutes.getPersonById(id));
    return response.data;
  } catch (error: unknown) {
    logError("getPersonById", error);
    return null;
  }
};
