import { sign } from '../jwt/jwt'; // onde está a função de assinar tokens
import Response from '../utils/Response';
import { ModelStatic, Op } from 'sequelize';
import UserModel from '../database/models/UserModel';
import md5 from 'md5';

class AuthService {
  private model: ModelStatic<UserModel> = UserModel;

  async login(login: string, password: string) {
    // busca o usuário por email ou username
    const user = await this.model.findOne({
      where: {
        [Op.or]: [{ userName: login }, { email: login }]
      }
    });
    if (!user) {
      return Response.unauthorized("Usuário ou senha inválidos.");
    }
    // verifica senha com md5
    const hashedPassword = md5(password);
    if(user.password !== hashedPassword){
      return Response.unauthorized("Usuário ou senha inválidos.")
    }

    const payload = {
      userId: user.userId,
      userName: user.userName,
      email: user.email,
      userType: user.userType,
      fkClearanceId: user.fkClearanceId,
    };

    const token = sign(payload);
    return Response.ok("Autenticado com sucesso!", { token });
    //return { token, user: payload };
  }
}

export default AuthService;
