import { getEmployeeById } from "./EmployeeService";
import { getPersonById } from "./PersonService";
import { logError } from "../../utils/logError";

export const enrichUserData = async (user: any) => {
  try {
    const employeeId = user?.EmployeeUser?.fkEmployeeId;
    const personId = user?.ExternalUser?.fkPersonId;

    const [employeeData, personData] = await Promise.all([
      employeeId ? getEmployeeById(employeeId) : null,
      personId ? getPersonById(personId) : null,
    ]);

    return {
      ...user,
      employee: employeeData,
      person: personData,
    };
  } catch (error: unknown) {
    logError("enrichUserData", error);
    return user; // Retorna o dado parcial se falhar
  }
};
