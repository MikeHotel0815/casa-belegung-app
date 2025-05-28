'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Item, {
        foreignKey: 'UserId', // This should match the foreign key in the Item model
        // onDelete: 'CASCADE', // Optional: If a user is deleted, their items are also deleted
        // onUpdate: 'CASCADE'  // Optional: How to handle updates
      });
    }

    // Placeholder for password validation
    // TODO: Implement password hashing and comparison using bcryptjs
    validPassword(password) {
      return this.password === password; // Plain text comparison (for placeholder only)
    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
