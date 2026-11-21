import axiosRegistry from "./axiosInstance";
import { registryRoutes } from "./endpoints";

/** `registry` fora ou com erro: quem chama recusa (fail-closed). */
export class RegistryUnavailableError extends Error {}

/** Empresa do funcionário, como vem no `GET /employee/:id` do `registry`. */
export interface EmployeeCompany {
  companyId: string;
  fkCompanyGroupId?: string | null;
}

/**
 * Empresas ativas do grupo da empresa (T18). Empresa sem grupo: só ela mesma.
 * @throws RegistryUnavailableError se o `registry` falhar (404 = grupo sem empresas ativas → `[]`).
 */
export const getGroupCompanyIds = async (company: EmployeeCompany): Promise<string[]> => {
  if (!company.fkCompanyGroupId) return [company.companyId];
  try {
    const res = await axiosRegistry.get(registryRoutes.findCompanies, { params: { fkCompanyGroupId: company.fkCompanyGroupId } });
    return ((res.data?.data ?? []) as EmployeeCompany[]).map(c => c.companyId);
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) return [];
    throw new RegistryUnavailableError("registry indisponível ao listar as empresas do grupo");
  }
};
