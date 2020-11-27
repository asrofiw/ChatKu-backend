'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Messages.belongsTo(models.User, { foreignKey: 'user_id' })
    }
  };
  Messages.init({
    message: DataTypes.STRING,
    sender: DataTypes.STRING,
    recepient: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    friends_id: DataTypes.INTEGER,
    belongsToId: DataTypes.INTEGER,
    isRead: DataTypes.BOOLEAN,
    isLatest: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Messages'
  })
  return Messages
}
