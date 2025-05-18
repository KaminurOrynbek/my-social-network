import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Models } from '../interfaces/general';

interface ExperienceAttributes {
  id: number;
  userId: number;
  companyName: string;
  role: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

export class Experience extends Model<ExperienceAttributes, Optional<ExperienceAttributes, 'id'>> implements ExperienceAttributes {
  id: number;
  userId: number;
  companyName: string;
  role: string;
  startDate: Date;
  endDate: Date;
  description: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  static defineSchema(sequelize: Sequelize) {
    Experience.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        field: 'user_id',
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      companyName: {
        field: 'company_name',
        type: new DataTypes.STRING(256),
        allowNull: false,
      },
      role: {
        type: new DataTypes.STRING(256),
        allowNull: false,
      },
      startDate: {
        field: 'start_date',
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        field: 'end_date',
        type: DataTypes.DATE,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    }, {
      tableName: 'experiences',
      underscored: true,
      sequelize,
    });
  }

  static associate(models: Models) {
    Experience.belongsTo(models.user, { foreignKey: 'user_id' });
  }
}
