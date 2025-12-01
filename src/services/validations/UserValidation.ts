import joi from "joi";
import passwordComplexity from "joi-password-complexity";
import { UserTypeEnum } from "../../database/models/enums/UserTypeEnum";

const complexityOptions = {
  min: 8,
  max: 30,             // máximo opcional
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 4, // exige todos os 4 critérios
}

const UserValidation = joi.object({
  userName: joi.string().required().messages({
    "any.required": "O nome de usuário é obrigatório.",
    "string.empty": "O nome de usuário não pode estar vazio.",
  }),

  email: joi.string().email().required().messages({
    "any.required": "O e-mail é obrigatório.",
    "string.email": "Formato de e-mail inválido.",
    "string.empty": "O e-mail não pode estar vazio.",
  }),

  password: passwordComplexity(complexityOptions)
    .pattern(/^[^\s\-_]*$/)
    .required()
    .messages({
      "any.required": "A senha é obrigatória.",
      "string.pattern.base": "A senha não pode conter espaços, hífens ou underlines.",
      "passwordComplexity.tooShort": "A senha deve ter no mínimo 8 caracteres.",
      "passwordComplexity.lowercase": "A senha deve conter pelo menos uma letra minúscula.",
      "passwordComplexity.uppercase": "A senha deve conter pelo menos uma letra maiúscula.",
      "passwordComplexity.numeric": "A senha deve conter pelo menos um número.",
      "passwordComplexity.symbol": "A senha deve conter pelo menos um caractere especial.",
    }),

  confirmPassword: joi.string()
    .required()
    .valid(joi.ref("password"))
    .messages({
      "any.required": "A confirmação de senha é obrigatória.",
      "any.only": "A confirmação de senha deve ser igual à senha.",
    }),

  userType: joi.string()
    .valid(UserTypeEnum.COLABORADOR, UserTypeEnum.EXTERNO)
    .required()
    .messages({
      "any.required": "O tipo de usuário é obrigatório.",
      "any.only": "Tipo de usuário inválido.",
    }),

  fkEmployeeId: joi.string().uuid().when('userType', {
    is: UserTypeEnum.COLABORADOR,
    then: joi.required(),
    otherwise: joi.forbidden()
  }),

  fkPersonId: joi.string().uuid().when('userType', {
    is: UserTypeEnum.EXTERNO,
    then: joi.optional(),
    otherwise: joi.forbidden()
  }),

  fkClearanceId: joi.string().uuid().required(),

  createdAt: joi.date().required(),
  createdBy: joi.string().required(),

})
export default UserValidation;