import { DataTypes, Model } from "sequelize";
import db from ".";
import sequelize from "sequelize";

class UserModuleModel extends Model {
  declare userModuleId: string;
  declare fkUserId: string;
  declare fkModuleId: string;
  declare accessDate: Date;
  declare expiresAt: Date;

  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
  declare activated: boolean;
}
UserModuleModel.init({
  userModuleId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  fkUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  fkModuleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'module',
      key: 'module_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  accessDate: {
    type: sequelize.DATE,
    allowNull: false,
  },
  expiresAt: {
    type: sequelize.DATE,
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
    allowNull: true,
    type: sequelize.DATE,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedBy: {
    allowNull: true,
    type: DataTypes.UUID,
  },
  activated: {
    allowNull: false,
    type: sequelize.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize: db,
  tableName: 'user_module',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

export default UserModuleModel;