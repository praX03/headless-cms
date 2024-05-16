// dataEntryModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Your Sequelize instance

const data = sequelize.define('data', {
  entity_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  attributes: {
    type: DataTypes.JSON, // Use JSONB for efficient storage and querying
    allowNull: false,
  },
}, { timestamps: false});

module.exports = data;
