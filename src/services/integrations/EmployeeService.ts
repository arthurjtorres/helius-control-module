import axiosRegistry from "./axiosInstance";
import { registryRoutes } from "./endpoints";

export const getEmployeeById = async (id: string) => {
  try {
    const response = await axiosRegistry.get(registryRoutes.getEmployeeById(id));
    return response.data?.data || null;
  } catch (error: any) {
    console.error(`Erro ao buscar employee ${id}:`, error.message);
    return null;
  }
};