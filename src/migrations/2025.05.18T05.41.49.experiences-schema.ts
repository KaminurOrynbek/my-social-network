import { MigrationFn } from 'umzug'
import { DataTypes, Sequelize } from 'sequelize'

export const up: MigrationFn<Sequelize> = async ({ context }) => {
  const q = context.getQueryInterface()

  await q.createTable('experiences', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    company_name: {
      type: new DataTypes.STRING(256),
      allowNull: false,
    },
    role: {
      type: new DataTypes.STRING(256),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })
}

export const down: MigrationFn<Sequelize> = async ({ context }) => {
  const q = context.getQueryInterface()

  await q.dropTable('experiences')
}
