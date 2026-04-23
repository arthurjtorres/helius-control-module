import { DataTypes, Model } from "sequelize";
import { UserTypeEnum } from "./enums/UserTypeEnum";
import db from "./database";
import sequelize from "sequelize";

class UserModel extends Model {
  declare userId: string;
  declare userName: string;
  declare email: string;
  declare password: string;
  declare userType: UserTypeEnum;
  declare fkClearanceId: string;
  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
  declare activated: boolean;

}

UserModel.init({
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  userName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: sequelize.STRING,
    allowNull: false,
  },
  userType: {
    type: sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: [[...Object.values(UserTypeEnum)]],
    }
  },
  fkClearanceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clearance_level',
      key: 'clearance_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  tableName: 'user',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

export default UserModel;