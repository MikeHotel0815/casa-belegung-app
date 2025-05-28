'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Item.belongsTo(models.User, {
        foreignKey: 'UserId',
        allowNull: false, // Assuming an item must belong to a user
        onDelete: 'CASCADE', // If a user is deleted, their items are also deleted
      });
    }
  }
  Item.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    UserId: { // Foreign key for User
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Name of the Users table
        key: 'id',
      },
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};
