import axiosRegistry from "./axiosInstance";
import { registryRoutes } from "./endpoints";

export const getPersonById = async (id: string) => {
  try {
    const response = await axiosRegistry.get(registryRoutes.getPersonById(id));
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao buscar person ${id}:`, error.message);
    console.log('url: ',registryRoutes.getPersonById(id));
    return null;
  }
};
