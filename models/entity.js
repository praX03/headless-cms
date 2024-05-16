const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const Entity = sequelize.define('Entity', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true 
    },
    attributes: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {timestamps: true });

module.exports = Entity;
