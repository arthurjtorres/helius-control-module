import { DataTypes, Model } from "sequelize";
import db from ".";
import sequelize from "sequelize";
import ModuleModel from "./ModuleModel";

class MenuModel extends Model {
  declare menuId: string;
  declare menuName: string;
  declare fkModuleId: string;

  declare createdAt: Date;
  declare createdBy: string;
  declare updatedAt: Date;
  declare updatedBy: string;
  declare activated: boolean;
}

MenuModel.init({
  menuId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  menuName: {
    type: sequelize.STRING,
    allowNull: false,

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
  tableName: 'menu',
  schema: 'access_control',
  timestamps: false,
  underscored: true
});

MenuModel.belongsTo(ModuleModel, {
  foreignKey: 'fkModuleId',
   as: 'menuModule'
});

ModuleModel.hasMany(MenuModel, {
  foreignKey: 'fkModuleId',
   as: 'moduleMenu',
})

export default MenuModel;