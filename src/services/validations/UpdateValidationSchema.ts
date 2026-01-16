import joi from "joi";
import UserValidation from "./UserValidation";
import Validation from "./CreateValidationSchema";

const UpdateValidation = joi.object({
  updatedAt: joi.date().required(),
  updatedBy: joi.string().required(),

}); 

const UpdateUserValidation = UserValidation.fork(
  Object.keys(UserValidation.describe().keys),
  (schema) => schema.optional()
).keys({
  updatedAt: joi.date().required(),
  updatedBy: joi.string().required(), 
})

const UpdatePermitValidation = Validation.PermitValidation.fork(
  Object.keys(Validation.PermitValidation.describe().keys),
  (schema) => schema.optional()
).keys({
  updatedAt: joi.date().required(),
  updatedBy: joi.string().required(), 
})

export = {
  UpdateValidation,
  UpdateUserValidation,
  UpdatePermitValidation
}