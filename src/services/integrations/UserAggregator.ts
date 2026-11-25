import { getEmployeeById } from "./EmployeeService";
import { getPersonById } from "./PersonService";
import { logError } from "../../utils/logError";

/** Vínculos do usuário lidos aqui (associações incluídas no `toJSON()`). */
type UserLinks = { EmployeeUser?: { fkEmployeeId?: string } | null; ExternalUser?: { fkPersonId?: string } | null };

export const enrichUserData = async <T extends object>(user: T) => {
  try {
    const links = user as UserLinks;
    const employeeId = links.EmployeeUser?.fkEmployeeId;
    const personId = links.ExternalUser?.fkPersonId;

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
