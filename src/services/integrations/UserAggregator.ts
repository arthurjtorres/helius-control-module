import { getEmployeeById } from "./EmployeeService";
import { getPersonById } from "./PersonService";

export const enrichUserData = async (user: any) => {
  try {
    const employeeId = user?.employeeLink?.fkEmployeeId;
    const personId = user?.externalLink?.fkPersonId;

    const [employeeData, personData] = await Promise.all([
      employeeId ? getEmployeeById(employeeId) : null,
      personId ? getPersonById(personId) : null,
    ]);

    return {
      ...user,
      employee: employeeData,
      person: personData,
    };
  } catch (error: any) {
    console.error("Erro ao enriquecer dados do usuário:", error.message);
    return user; // Retorna o dado parcial se falhar
  }
};
