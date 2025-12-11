import { DataTypes, Model } from "sequelize";
import db from ".";
import UserModel from "./UserModel";
import sequelize from "sequelize";


class EmployeeUserModel extends Model {
  declare fkUserId: string;
  declare fkEmployeeId: string;

  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
  declare activated: boolean;
}

EmployeeUserModel.init({
  fkUserId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  fkEmployeeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  createdAt: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  createdBy: {
    allowNull: false,
    type: DataTypes.UUID,

  },
  updatedAt: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedBy: {
    allowNull: false,
    type: DataTypes.UUID,
  },
  activated: {
    allowNull: false,
    type: sequelize.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize: db,
  tableName: 'employee_user',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

EmployeeUserModel.belongsTo(UserModel, {
  foreignKey: 'fkUserId',
  as: 'user',
});

UserModel.hasOne(EmployeeUserModel, {
  foreignKey: 'fkUserId',
  as: 'employeeLink',
});

export default EmployeeUserModel;