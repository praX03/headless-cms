const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('headless_cms', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log(),  
});
sequelize.authenticate()
    .then(() => console.log('Database connection established'))
    .catch(error => console.error('Error connecting to database:', error)); 

module.exports = sequelize; 
