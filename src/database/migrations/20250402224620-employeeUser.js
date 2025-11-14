"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "employee_user",
      {
        fk_user_id: {
          type: DataTypes.UUID,
          //primaryKey: true,
          allowNull: false,
          references: {
            model: "user",
            key: "user_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        fk_employee_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: "employee",
              schema: "registry",
            },
            key: "employee_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
      },
      {
        schema: "access_control",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("employee_user", {
      schema: "access_control",
    });
  },
};
