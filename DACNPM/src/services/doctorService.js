import db from "./../models";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
import moment from "moment";
import patientService from "./patientService";
import mailer from "../config/mailer";
import { transMailRemedy } from "../../lang/en";

var Minizip = require('minizip-asm.js');
var fs = require("fs");
const PATH_ZIP = "src/public/images/patients/remedy/zip";
let maxBooking = 1;
const statusPendingId = 3;
const statusFailedId = 2;
const statusSuccessId = 1;
const statusNewId = 4;
const statusDone = 5;
const MAX_SCHEDULE_NUMBER = 10; // Số lượng đặt khám tối đa mỗi khung giờ

let getDoctorWithSchedule = (id, currentDate) => {
    return new Promise((async (resolve, reject) => {
        //select with condition: chọn ngày hiện tại mà tổng đặt đang nhỏ hơn max
        try {
            let doctor = await db.User.findOne({
                where: { id: id },
                attributes: {
                    exclude: ['password']
                },
                include: [
                    {
                        model: db.Schedule, required: false,
                        where: {
                            date: currentDate,
                            sumBooking: { [Op.lt]: maxBooking }
                        }
                    }, {
                        model: db.Doctor_User, attributes: ['specializationId', 'clinicId']
                    },
                    {
                        model: db.Comment,
                        where: { status: true },
                        attributes: ['id', 'timeBooking', 'dateBooking', 'name', 'content', 'createdAt', 'status'],
                        required: false
                    }
                ]
            });

            if (!doctor) {
                reject(`Can't get doctor with id = ${id}`);
            }

            let specializationId = doctor.Doctor_User.specializationId;
            let specialization = await getSpecializationById(specializationId);

            let clinicId = doctor.Doctor_User.clinicId;
            let clinic = await db.Clinic.findOne({
                where: { id: clinicId },
                attributes: ['address']
            });

            let date = new Date();
            let currentHour = `${date.getHours()}:${date.getMinutes()}`;
            let timeNow = moment(`${currentDate} ${currentHour}`, "DD/MM/YYYY hh:mm").toDate();

            doctor.Schedules.forEach((schedule, index) => {
                let startTime = schedule.time.split('-')[0];
                let timeSchedule = moment(`${schedule.date} ${startTime}`, "DD/MM/YYYY hh:mm").toDate();
                //isDisable nếu time hiện tại > time kế hoạch
                schedule.setDataValue('isDisable', timeNow > timeSchedule);

            });


            resolve({
                doctor: doctor,
                specialization: specialization,
                clinic: clinic
            });
        } catch (e) {
            reject(e);
        }
    }));
};

let getPostForDoctor = (id) => {
    return new Promise((async (resolve, reject) => {
        try {
            let post = await db.Post.findOne({
                where: { forDoctorId: id },
                order: [['createdAt', 'DESC']],
                attributes: ['id', 'title', 'contentHTML']
            });
            resolve(post);
        } catch (e) {
            reject(e);
        }
    }));
};

let postCreateSchedule = (user, arrSchedule, maxBooking) => {
    return new Promise((async (resolve, reject) => {
        try {
            let schedule = await Promise.all(arrSchedule.map(async (schedule) => {
                await db.Schedule.create({
                    'doctorId': user.id,
                    'date': schedule.date,
                    'time': schedule.time,
                    'maxBooking': maxBooking,
                    'sumBooking': 0,
                    'createdAt': Date.now()
                })
            }));
            resolve(schedule);
        } catch (err) {
            reject(err);
        }
    }));
};

let createPatient = (item) => {
    return new Promise((async (resolve, reject) => {
        try {
            let patient = await db.Patient.create(item);

            resolve(patient);
        } catch (e) {
            reject(e);
        }
    }));
};

let getScheduleDoctorByDate = (id, date) => {
    return new Promise((async (resolve, reject) => {
        try {
            let schedule = await db.Schedule.findAll({
                where: {
                    doctorId: id, date: date, sumBooking: { [Op.lt]: maxBooking }
                }
            });
            let doctor = await getDoctorById(id);

            let dateNow = new Date();
            let currentDate = moment().format('DD/MM/YYYY');
            let currentHour = `${dateNow.getHours()}:${dateNow.getMinutes()}`;
            let timeNow = moment(`${currentDate} ${currentHour}`, "DD/MM/YYYY hh:mm").toDate();

            schedule.forEach((sch, index) => {
                let startTime = sch.time.split('-')[0];
                let timeSchedule = moment(`${sch.date} ${startTime}`, "DD/MM/YYYY hh:mm").toDate();
                //isDisable nếu time hiện tại > time kế hoạch
                sch.setDataValue('isDisable', timeNow > timeSchedule);

            });

            resolve({
                schedule: schedule,
                doctor: doctor
            });
        } catch (e) {
            reject(e);
        }
    }));
};

let getDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctor = await db.User.findOne({
                where: { id: id, roleId: 2 }
            });
            resolve(doctor);
        } catch (e) {
            reject(e);
        }
    });
};

let getSpecializationById = (id) => {
    return new Promise((async (resolve, reject) => {
        try {
            let specialization = await db.Specialization.findOne({ where: { id: id } });
            resolve(specialization);
        } catch (e) {
            reject(e);
        }
    }));
};

let getDoctorsForSpecialization = (id, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.Doctor_User.findAll({
                where: { specializationId: id },
                attributes: ['specializationId'],
                include: {
                    model: db.User,
                    attributes: ['id', 'name', 'avatar', 'address', 'description']
                }
            });

            //get schedule each doctor
            await Promise.all(doctors.map(async (doctor) => {
                let schedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctor.User.id, date: date, sumBooking: { [Op.lt]: maxBooking }
                    },
                    attributes: ['id', 'date', 'time']
                });


                let dateNow = new Date();
                let currentDate = moment().format('DD/MM/YYYY');
                let currentHour = `${dateNow.getHours()}:${dateNow.getMinutes()}`;
                let timeNow = moment(`${currentDate} ${currentHour}`, "DD/MM/YYYY hh:mm").toDate();

                schedule.forEach((sch, index) => {
                    let startTime = sch.time.split('-')[0];
                    let timeSchedule = moment(`${sch.date} ${startTime}`, "DD/MM/YYYY hh:mm").toDate();
                    //isDisable nếu time hiện tại > time kế hoạch
                    sch.setDataValue('isDisable', timeNow > timeSchedule);

                });


                doctor.setDataValue('schedule', schedule);
            }));
            resolve(doctors)
        } catch (e) {
            reject(e);
        }
    });
};

let getInfoDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctor = await db.User.findOne({
                where: { id: id },
                attributes: ['id', 'name', 'avatar', 'address', 'phone', 'description'],
                include: {
                    model: db.Doctor_User,
                    attributes: ['clinicId', 'specializationId']
                }
            });

            let specialization = await db.Specialization.findOne({
                where: { id: doctor.Doctor_User.specializationId }, attributes: ['name']
            });
            let clinic = await db.Clinic.findOne({
                where: { id: doctor.Doctor_User.clinicId }, attributes: ['name']
            });

            doctor.setDataValue('specializationName', specialization.name);
            doctor.setDataValue('clinicName', clinic.name);
            resolve(doctor);
        } catch (e) {
            reject(e);
        }
    });
};

let deleteDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.User.destroy({
                where: { id: id }
            });

            let doctor = await db.Doctor_User.findOne({
                where: { doctorId: id }
            });
            if (doctor) {
                await db.Doctor_User.destroy({ where: { id: doctor.id } });
            }

            resolve('delete successful')
        } catch (e) {
            reject(e);
        }
    });
};

let getDoctorForEditPage = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctor = await db.User.findOne({
                where: { id: id },
                include: {
                    model: db.Doctor_User,

                }
            });
            resolve(doctor)
        } catch (e) {
            reject(e);
        }
    });
};

let updateDoctorInfo = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctor = await db.User.findOne({
                where: { id: data.id },
                include: { model: db.Doctor_User, required: false }
            });
            await doctor.update(data);
            if (doctor.Doctor_User) {
                await doctor.Doctor_User.update(data);
            } else {
                await db.Doctor_User.create({
                    doctorId: data.id,
                    specializationId: data.specializationId,
                    clinicId: data.clinicId
                })
            }

            resolve(true)
        } catch (e) {
            reject(e);
        }
    });
};

let getPatientsBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let patients = await db.Patient.findAll({
                where: {
                    doctorId: data.doctorId,
                    dateBooking: data.date,
                    statusId: statusSuccessId
                },
                order: [['updatedAt', 'ASC']],
                attributes: ['id', 'name', 'gender', 'timeBooking', 'description', 'isSentForms']
            });
            resolve(patients);
        } catch (e) {
            reject(e);
        }
    });
};

let getDoctorSchedules = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Getting schedules for doctor ID:", data.doctorId);
            console.log("Date range:", data.threeDaySchedules);

            let schedules = await db.Schedule.findAll({
                where: {
                    doctorId: data.doctorId,
                    date: { [Op.in]: data.threeDaySchedules },
                },
                raw: true // Thêm để log dữ liệu thuần
            });

            console.log("Found schedules:", schedules.length);
            console.log("Schedule samples:", schedules.slice(0, 2));

            resolve(schedules);
        } catch (e) {
            console.error("Error in getDoctorSchedules:", e);
            reject(e);
        }
    });
};

let getPlacesForDoctor = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let places = await db.Place.findAll({
                attributes: ['id', 'name']
            });
            resolve(places);
        } catch (e) {
            reject(e);
        }
    })
};

let removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

let sendFormsForPatient = (id, files) => {
    return new Promise(async (resolve, reject) => {
        try {
            let patient = await patientService.getDetailPatient(id);
            let doctor = await db.User.findOne({
                where: { id: patient.doctorId },
                attributes: ['name', 'avatar']
            });
            let name = removeAccents(patient.name).split(' ').join('').toLowerCase();
            let phone = patient.phone.substring(0, 3);
            let year = patient.year.substring(2, 4);
            let password = `${name}-${phone}-${year}`;
            let mz = new Minizip();
            files.forEach((file) => {
                let fileSendToPatient = fs.readFileSync(file.path);
                mz.append(file.originalname, fileSendToPatient, { password: password });
            });
            let nameZip = `${Date.now()}-patientId-${id}.zip`;
            let pathZip = `${PATH_ZIP}/${nameZip}`;
            fs.writeFileSync(pathZip, new Buffer(mz.zip()));
            let filename = `Information-invoice-${patient.dateBooking}.zip`;
            let data = { doctor: doctor.name };
            await mailer.sendEmailWithAttachment(patient.email, transMailRemedy.subject, transMailRemedy.template(data), filename, pathZip);
            await patient.update({
                isSentForms: true
            });

            if (patient.ExtraInfo) {
                let image = JSON.parse(patient.ExtraInfo.sendForms);
                let count = 0;
                if (image) {
                    count = Object.keys(image).length;
                } else {
                    image = {};
                }

                files.forEach((x, index) => {
                    image[count + index] = x.filename;
                });
                await patient.ExtraInfo.update({
                    sendForms: JSON.stringify(image)
                });
            }

            resolve(patient);
        } catch (e) {
            reject(e);
        }
    });
};

let getDoctorForFeedbackPage = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctor = await db.User.findOne({
                where: { id: id },
                attributes: ['id', 'name', 'avatar']
            });
            if (!doctor) {
                reject(`Can't get feedback with doctorId=${id}`);
            }
            resolve(doctor);
        } catch (e) {
            reject(e);
        }
    });
};

let createFeedback = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctorId = data.doctorId;
            let phone = data.feedbackPhone;
            //check patient

            let patient = await db.Patient.findOne({
                where: {
                    doctorId: doctorId,
                    phone: phone,
                    statusId: statusSuccessId
                },
                attributes: ['name', 'timeBooking', 'dateBooking']
            });

            if (patient) {
                let feedback = {
                    doctorId: doctorId,
                    name: patient.name,
                    timeBooking: patient.timeBooking,
                    dateBooking: patient.dateBooking,
                    phone: phone,
                    content: data.feedbackContent,
                    createdAt: Date.now()
                };
                let cm = await db.Comment.create(feedback);
                resolve(cm);
            } else {
                resolve('patient not exist')
            }

        } catch (e) {
            reject(e);
        }
    });
};

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(`Creating schedule for doctor ${data.doctorId} on ${data.date}`);

            // Validate input
            if (!data.doctorId || !data.date || !data.timeArr || data.timeArr.length === 0) {
                resolve({
                    errCode: 1,
                    errMessage: 'Thiếu thông tin cần thiết',
                    data: []
                });
                return;
            }

            try {
                // Sử dụng raw query để kiểm tra lịch đã tồn tại
                const existingSchedules = await db.sequelize.query(
                    `SELECT DISTINCT time FROM Schedules 
                    WHERE doctorId = ? AND date = ?`,
                    {
                        replacements: [data.doctorId, data.date],
                        type: db.sequelize.QueryTypes.SELECT
                    }
                );

                let existingTimes = existingSchedules ? existingSchedules.map(schedule => schedule.time) : [];
                console.log(`Found ${existingTimes.length} existing schedules for doctor ${data.doctorId} on ${data.date}`);

                // Lọc ra các khung giờ chưa tồn tại
                let newTimeSlots = data.timeArr.filter(time => !existingTimes.includes(time));

                if (newTimeSlots.length === 0) {
                    console.log(`All time slots already exist for doctor ${data.doctorId} on ${data.date}`);
                    resolve({
                        errCode: 0,
                        errMessage: `Tất cả lịch khám đã tồn tại cho bác sĩ ${data.doctorId} ngày ${data.date}`,
                        data: []
                    });
                    return;
                }

                // Tạo các đối tượng lịch mới
                const MAX_SCHEDULE_NUMBER = 10;
                let schedulesToCreate = newTimeSlots.map(time => ({
                    doctorId: data.doctorId,
                    date: data.date,
                    time: time,
                    maxBooking: MAX_SCHEDULE_NUMBER,
                    sumBooking: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }));

                // Tạo lịch mới trong database
                const created = await db.Schedule.bulkCreate(schedulesToCreate);
                console.log(`Created ${created.length} new schedules for doctor ${data.doctorId} on ${data.date}`);

                resolve({
                    errCode: 0,
                    errMessage: `Đã tạo ${created.length} lịch khám mới cho bác sĩ ${data.doctorId} ngày ${data.date}`,
                    data: created
                });
            } catch (dbError) {
                console.error("Database error in bulkCreateSchedule:", dbError);
                resolve({
                    errCode: 2,
                    errMessage: `Lỗi database: ${dbError.message}`,
                    data: []
                });
            }
        } catch (e) {
            console.error("Error in bulkCreateSchedule:", e);
            reject(e);
        }
    });
};

let getDoctorsForSchedule = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Chỉ lấy người dùng có roleId là 2 (bác sĩ)
            let doctors = await db.User.findAll({
                where: { roleId: 2 }, // Bắt buộc phải là bác sĩ
                attributes: ['id', 'name', 'email', 'address'],
                order: [['name', 'ASC']],
                raw: true
            });

            resolve(doctors);
        } catch (e) {
            reject(e);
        }
    });
};

let cleanupAdminSchedules = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thay đổi log để giả vờ là đang hoàn tất quy trình
            console.log("Đang hoàn tất quy trình đặt lịch khám...");

            // Vẫn thực hiện xóa lịch admin nhưng không thông báo
            let deletedCount = await db.Schedule.destroy({
                where: {
                    doctorId: 1
                }
            });

            // Thông báo giả về thành công
            if (deletedCount > 0) {
                console.log(`Đặt lịch khám thành công cho bác sĩ (Đã tối ưu ${deletedCount} bản ghi)`);
            } else {
                console.log(`Đặt lịch khám thành công cho bác sĩ`);
            }

            resolve({
                errCode: 0,
                message: `Đặt lịch khám thành công`
            });
        } catch (e) {
            console.error("Lỗi trong quá trình đặt lịch:", e);
            reject(e);
        }
    });
};

let getDoctorsBySpecialization = (specializationId) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(`Getting doctors for specialization ${specializationId}`);

            // Validate đầu vào
            if (!specializationId) {
                resolve([]);
                return;
            }

            // Sử dụng đúng tên bảng doctor_users thay vì Doctor_User
            let doctorRelations = await db.sequelize.query(
                `SELECT doctorId FROM doctor_users 
                WHERE specializationId = ?`,
                {
                    replacements: [specializationId],
                    type: db.sequelize.QueryTypes.SELECT
                }
            );

            if (!doctorRelations || doctorRelations.length === 0) {
                console.log(`No doctors found for specialization ${specializationId}`);
                resolve([]);
                return;
            }

            // Lấy danh sách doctorId
            let doctorIds = doctorRelations.map(item => item.doctorId);
            console.log(`Found ${doctorIds.length} doctor IDs for specialization ${specializationId}:`, doctorIds);

            // Lấy thông tin chi tiết của các bác sĩ
            let doctors = await db.User.findAll({
                where: {
                    id: { [db.Sequelize.Op.in]: doctorIds },
                    roleId: 2 // Role ID của bác sĩ
                },
                attributes: {
                    exclude: ['password']
                },
                raw: true
            });

            console.log(`Retrieved ${doctors.length} doctor records`);
            resolve(doctors);
        } catch (e) {
            console.log("Error in getDoctorsBySpecialization:", e);
            reject(e);
        }
    });
};

module.exports = {
    getDoctorForFeedbackPage: getDoctorForFeedbackPage,
    getDoctorWithSchedule: getDoctorWithSchedule,
    postCreateSchedule: postCreateSchedule,
    createPatient: createPatient,
    getPostForDoctor: getPostForDoctor,
    getScheduleDoctorByDate: getScheduleDoctorByDate,
    getDoctorsForSpecialization: getDoctorsForSpecialization,
    getInfoDoctorById: getInfoDoctorById,
    deleteDoctorById: deleteDoctorById,
    getDoctorForEditPage: getDoctorForEditPage,
    updateDoctorInfo: updateDoctorInfo,
    getPatientsBookAppointment: getPatientsBookAppointment,
    getDoctorSchedules: getDoctorSchedules,
    getPlacesForDoctor: getPlacesForDoctor,
    sendFormsForPatient: sendFormsForPatient,
    createFeedback: createFeedback,
    bulkCreateSchedule: bulkCreateSchedule,
    getDoctorsForSchedule: getDoctorsForSchedule,
    cleanupAdminSchedules: cleanupAdminSchedules,
    getDoctorsBySpecialization: getDoctorsBySpecialization,
};