import db from "./../models";

let getSpecializationById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                reject(new Error('Missing specialization ID'));
                return;
            }
            
            // Đảm bảo biến này được khởi tạo trước khi sử dụng
            let specialization = await db.Specialization.findOne({
                where: { id: id },
                raw: true // Lấy dữ liệu dạng plain object
            });
            
            // Kiểm tra và log ra kết quả để debug
            console.log("Query result:", specialization);
            
            if (!specialization) {
                console.log(`No specialization found with id = ${id}`);
                resolve(null);
                return;
            }
            
            // Chỉ trả về thông tin chuyên khoa, không bao gồm places
            resolve(specialization);
        } catch (e) {
            console.log("Error in getSpecializationById:", e);
            reject(e);
        }
    });
};

let getAllSpecializations = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let specializations = await db.Specialization.findAll({
                raw: true,
                nest: true
            });
            
            // Đảm bảo luôn trả về mảng, ngay cả khi không có dữ liệu
            resolve(specializations || []);
        } catch (e) {
            console.log('Error in getAllSpecializations:', e);
            reject(e);
        }
    });
};

let deleteSpecializationById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.Specialization.destroy({
                where: { id: id }
            });
            let infos = await db.Doctor_User.findAll({
                where: {
                    specializationId: id
                }
            });
            let arrId = [];
            infos.forEach((x) => {
                arrId.push(x.id);
            });
            await db.Doctor_User.destroy({ where: { id: arrId } });
            resolve(true);

        } catch (e) {
            reject(e);
        }
    });
};

let updateSpecialization = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm validation cho ID
            if (!data.id) {
                reject(new Error('ID chuyên khoa không được để trống'));
                return;
            }
            
            console.log("Finding specialization with ID:", data.id);
            
            let specialization = await db.Specialization.findOne({
                where: { id: data.id }
            });
            
            if (!specialization) {
                reject(new Error(`Không tìm thấy chuyên khoa với id = ${data.id}`));
                return;
            }
            
            // Cập nhật thông tin
            await specialization.update({
                name: data.name || specialization.name,
                description: data.description || specialization.description,
                ...(data.image && { image: data.image }),
                updatedAt: new Date()
            });
            
            // Quan trọng: Nhớ resolve kết quả
            resolve(specialization);
        } catch (e) {
            console.error("Error in updateSpecialization:", e);
            reject(e);
        }
    });
};

// Thêm hàm createSpecialization nếu chưa có

let createSpecialization = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name) {
                resolve({
                    errCode: 1,
                    errMessage: 'Thiếu thông tin bắt buộc'
                });
            } else {
                const specialization = await db.Specialization.create({
                    name: data.name,
                    description: data.description || null,
                    descriptionHTML: data.descriptionHTML || null,
                    image: data.image || null
                });
                
                resolve(specialization);
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    getSpecializationById: getSpecializationById,
    getAllSpecializations: getAllSpecializations,
    deleteSpecializationById: deleteSpecializationById,
    updateSpecialization: updateSpecialization,
    createSpecialization: createSpecialization
};
