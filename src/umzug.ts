import { Umzug, SequelizeStorage } from 'umzug';
import { Sequelize } from 'sequelize';
import {config} from './config';
import path from 'path';
import glob from 'glob';

const sequelize = new Sequelize({
  dialect: 'mysql',
  ...config.db,
});

// Debug: Log the migrations directory
const migrationsDir = path.join(__dirname, '..', 'src', 'migrations');
console.log('Looking for migrations in:', migrationsDir);

// Debug: List all migration files
const migrationFiles = glob.sync('*.ts', { cwd: migrationsDir });
console.log('Found migration files:', migrationFiles);

export const migrator = new Umzug({
  migrations: {
    glob: ['*.ts', { cwd: migrationsDir }],
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up({ context }),
        down: async () => migration.down({ context }),
      };
    },
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    modelName: 'SequelizeMeta',
  }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;
