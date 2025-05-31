import { MigrationFn } from 'umzug'
import { DataTypes, Sequelize } from 'sequelize'

export const up: MigrationFn<Sequelize> = async ({ context }) => {
  const q = context.getQueryInterface()

  await q.createTable('feedbacks', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    from_user: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    to_user: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    company_name: {
      type: new DataTypes.STRING(128),
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

  await q.dropTable('feedbacks')
}
