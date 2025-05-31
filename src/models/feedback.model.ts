import { Model, DataTypes, Sequelize } from 'sequelize';
import { Models } from '../interfaces/general';

interface FeedbackAttributes {
  id: number;
  fromUser: number;
  companyName: string;
  toUser: number;
  context: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Feedback extends Model<FeedbackAttributes> implements FeedbackAttributes {
  id: number;
  fromUser: number;
  companyName: string;
  toUser: number;
  context: string;
  createdAt: Date;
  updatedAt: Date;

 
static defineSchema(sequelize: Sequelize) {
  Feedback.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fromUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'from_user',
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'company_name',
    },
    toUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'to_user',
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks',       
    freezeTableName: true,        
  });
}


  static associate(models: Models) {
    Feedback.belongsTo(models.user, { foreignKey: 'from_user', as: 'from' });
    Feedback.belongsTo(models.user, { foreignKey: 'to_user', as: 'to' });
  }
}
