'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.renameColumn('Messages', 'user_id', 'senderId')
    await queryInterface.renameColumn('Messages', 'friends_id', 'recepientId')
    await queryInterface.renameColumn('Messages', 'belongsToId', 'friendId')
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
}
