module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    address: DataTypes.STRING,
    roleId: DataTypes.INTEGER
    // Các trường khác nếu có
  }, {
    tableName: 'users' // Đảm bảo tên bảng đúng
  });
  
  return User;
};