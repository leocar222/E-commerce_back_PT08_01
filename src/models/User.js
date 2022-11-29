const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('user', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUID,
        primaryKey : true
      },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    category:{
        type: DataTypes.ENUM('buyer', 'seller')
    },
    status:{
        type: DataTypes.ENUM('active', 'inactive', 'banned', 'delete')
    }
  });
};