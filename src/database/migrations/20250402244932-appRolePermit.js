'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'app_role_permit',
      {
        app_role_permit_id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        fk_app_role_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'app_role',
            key: 'app_role_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        fk_menu_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'menu',
            key: 'menu_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        fk_permit_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'permit',
            key: 'permit_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },

        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        created_by: {
          allowNull: false,
          type: DataTypes.UUID,
          references: {
            model: {
              tableName: "user",
              schema: "access_control",
            },
            key: "user_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_by: {
          allowNull: false,
          type: DataTypes.UUID,
          references: {
            model: {
              tableName: "user",
              schema: "access_control",
            },
            key: "user_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        activated: {
          allownull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        schema: 'access_control'
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('app_role_permit', {
      schema: 'access_control'
    })
  }
};