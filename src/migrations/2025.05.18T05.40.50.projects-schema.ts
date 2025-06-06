import { MigrationFn } from 'umzug'
import { DataTypes, Sequelize } from 'sequelize'

export const up: MigrationFn<Sequelize> = async ({ context }) => {
  const q = context.getQueryInterface()

  await q.createTable('projects', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    image: {
      type: new DataTypes.STRING(256),
      allowNull: false,
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

  await q.dropTable('projects')
}
