import { DataTypes, Model } from "sequelize";
import db from "./database";
import sequelize from "sequelize";

/** Empresa concedida ao usuário além da própria, restrita ao grupo (T18, ADR-021). Ligação: remoção física. */
class UserCompanyModel extends Model {
  declare fkUserId: string;
  declare fkCompanyId: string;
  declare createdAt: Date;
  declare createdBy: string;
}

UserCompanyModel.init({
  fkUserId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
  // FK para registry.company só de integridade: os dados da empresa vêm por HTTP
  fkCompanyId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
  createdAt: { allowNull: false, type: sequelize.DATE, defaultValue: sequelize.literal("CURRENT_TIMESTAMP") },
  createdBy: { allowNull: false, type: DataTypes.UUID },
}, {
  sequelize: db,
  tableName: 'user_company',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

export default UserCompanyModel;
