import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Models } from '../interfaces/general';

interface FeedbackAttributes {
  id: number;
  fromUser: number;
  toUser: number;
  content: string;
  companyName: string;
}

export class Feedback extends Model<FeedbackAttributes, Optional<FeedbackAttributes, 'id'>> implements FeedbackAttributes {
  id: number;
  fromUser: number;
  toUser: number;
  content: string;
  companyName: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  static defineSchema(sequelize: Sequelize) {
    Feedback.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      fromUser: {
        field: 'from_user',
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      toUser: {
        field: 'to_user',
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      companyName: {
        field: 'company_name',
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
    }, {
      tableName: 'feedbacks',
      underscored: true,
      sequelize,
    });
  }

  static associate(models: Models) {
    Feedback.belongsTo(models.user, { foreignKey: 'from_user', as: 'from' });
    Feedback.belongsTo(models.user, { foreignKey: 'to_user', as: 'to' });
  }
}
