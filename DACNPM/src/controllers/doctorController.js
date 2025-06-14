import doctorService from "../services/doctorService";
import userService from "../services/userService";
import _ from "lodash";
import moment from "moment";
import multer from "multer";

// Chỉ dùng một cách import nhất quán
// Chọn cách dùng ES6 import vì bạn đang dùng syntax này trong file
import db from "../models";

const MAX_BOOKING = 2;

function stringToDate(_date, _format, _delimiter) {
    let formatLowerCase = _format.toLowerCase();
    let formatItems = formatLowerCase.split(_delimiter);
    let dateItems = _date.split(_delimiter);
    let monthIndex = formatItems.indexOf("mm");
    let dayIndex = formatItems.indexOf("dd");
    let yearIndex = formatItems.indexOf("yyyy");
    let month = parseInt(dateItems[monthIndex]);
    month -= 1;
    return new Date(dateItems[yearIndex], month, dateItems[dayIndex]);

}

let getSchedule = async (req, res) => {
    try {
        let threeDaySchedules = [];
        for (let i = 0; i < 3; i++) {
            let date = moment(new Date()).add(i, 'days').locale('en').format('DD/MM/YYYY');
            threeDaySchedules.push(date);
        }
        let data = {
            threeDaySchedules: threeDaySchedules,
            doctorId: req.user.id
        };
        let schedules = await doctorService.getDoctorSchedules(data);

        schedules.forEach((x) => {
            x.date = Date.parse(stringToDate(x.date, "dd/MM/yyyy", "/"))
        });

        schedules = _.sortBy(schedules, x => x.date);

        schedules.forEach((x) => {
            x.date = moment(x.date).format("DD/MM/YYYY")
        });

        return res.render("main/users/admins/schedule.ejs", {
            user: req.user,
            schedules: schedules,
            threeDaySchedules: threeDaySchedules
        })
    } catch (e) {
        console.log(e)
    }
};

let getCreateSchedule = (req, res) => {
    return res.render("main/users/admins/createSchedule.ejs", {
        user: req.user
    })
};

let postCreateSchedule = async (req, res) => {
    await doctorService.postCreateSchedule(req.user, req.body.schedule_arr, MAX_BOOKING);
    return res.status(200).json({
        "status": 1,
        "message": 'success'
    })
};

let getScheduleDoctorByDate = async (req, res) => {
    try {
        let object = await doctorService.getScheduleDoctorByDate(req.body.doctorId, req.body.date);
        let data = object.schedule;
        let doctor = object.doctor;
        return res.status(200).json({
            status: 1,
            message: data,
            doctor: doctor
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json(e);
    }
};

let getInfoDoctorById = async (req, res) => {
    try {
        let doctor = await doctorService.getInfoDoctorById(req.body.id);
        return res.status(200).json({
            'message': 'success',
            'doctor': doctor
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getManageAppointment = async (req, res) => {
    // let date = "30/03/2020";
    let currentDate = moment().format('DD/MM/YYYY');
    let canActive = false;
    let date = '';
    if (req.query.dateDoctorAppointment) {
        date = req.query.dateDoctorAppointment;
        if (date === currentDate) canActive = true;
    } else {
        //get currentDate
        date = currentDate;
        canActive = true;
    }

    let data = {
        date: date,
        doctorId: req.user.id
    };

    let appointments = await doctorService.getPatientsBookAppointment(data);
    // sort by range time
    let sort = _.sortBy(appointments, x => x.timeBooking);
    //group by range time
    let final = _.groupBy(sort, function (x) {
        return x.timeBooking;
    });

    return res.render("main/users/admins/manageAppointment.ejs", {
        user: req.user,
        appointments: final,
        date: date,
        active: canActive
    })
};

let getManageChart = (req, res) => {
    return res.render("main/users/admins/manageChartDoctor.ejs", {
        user: req.user
    })
};


let postSendFormsToPatient = (req, res) => {
    FileSendPatient(req, res, async (err) => {
        if (err) {
            console.log(err);
            if (err.message) {
                console.log(err.message);
                return res.status(500).send(err.message);
            } else {
                console.log(err);
                return res.status(500).send(err);
            }
        }
        try {

            let patient = await doctorService.sendFormsForPatient(req.body.patientId, req.files);
            return res.status(200).json({
                status: 1,
                message: 'sent files success',
                patient: patient
            })
        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    });
};

let storageFormsSendPatient = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/patients/remedy");
    },
    filename: (req, file, callback) => {
        let imageName = `${Date.now()}-${file.originalname}`;
        callback(null, imageName);
    }
});

let FileSendPatient = multer({
    storage: storageFormsSendPatient,
    limits: { fileSize: 1048576 * 20 }
}).array("filesSend");

let postCreateChart = async (req, res) => {
    try {
        let object = await userService.getInfoDoctorChart(req.body.month);
        return res.status(200).json(object);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let postAutoCreateAllDoctorsSchedule = async (req, res) => {
    try {
        let data = await userService.createAllDoctorsSchedule();
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
}

let getDoctorsForSchedule = async (req, res) => {
    try {
        // Lấy danh sách bác sĩ từ database (roleId = 2 là bác sĩ)
        let doctors = await db.User.findAll({
            where: { roleId: 2 },
            attributes: ['id', 'name', 'email', 'address'],
            order: [['name', 'ASC']],
            raw: true
        });

        return res.status(200).json({
            errCode: 0,
            data: doctors,
            errMessage: 'Success'
        });
    } catch (e) {
        console.error('Error getting doctors:', e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server: ' + e.message
        });
    }
};

let createSchedule = async (req, res) => {
    try {
        console.log("Request body received:", req.body);

        // Lấy thông tin từ request
        let doctorId = req.body.doctorId;
        let date = req.body.date;
        let timeArr = req.body.schedules || req.body.timeArr;

        // QUAN TRỌNG: Kiểm tra nếu doctorId trùng với admin ID, không thực hiện
        if (req.user.roleId == 1 && doctorId == req.user.id) {
            return res.status(200).json({
                errCode: 5,
                errMessage: 'Không thể tạo lịch cho tài khoản admin'
            });
        }

        // Xử lý tiếp theo...
        let response = await doctorService.bulkCreateSchedule({
            doctorId: doctorId,
            date: date,
            timeArr: timeArr
        });

        return res.status(200).json(response);
    } catch (e) {
        console.error('Error creating schedule:', e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server: ' + e.message
        });
    }
};

let autoCreateAllDoctorsSchedule = async (req, res) => {
    try {
        // Lấy danh sách CHỈ các bác sĩ (không phải admin)
        let doctors = await db.User.findAll({
            where: {
                roleId: 2,  // Chỉ lấy bác sĩ
                id: { [db.Sequelize.Op.ne]: 1 }  // Loại trừ admin (ID=1)
            },
            attributes: ['id', 'name'],
            raw: true
        });

        console.log("Creating schedules for doctors:", doctors.map(d => d.id));

        // Code tạo lịch tiếp theo...
    } catch (e) {
        // Xử lý lỗi...
    }
};

module.exports = {
    getSchedule: getSchedule,
    getCreateSchedule: getCreateSchedule,
    postCreateSchedule: postCreateSchedule,
    getScheduleDoctorByDate: getScheduleDoctorByDate,
    getInfoDoctorById: getInfoDoctorById,
    getManageAppointment: getManageAppointment,
    getManageChart: getManageChart,
    postSendFormsToPatient: postSendFormsToPatient,
    postCreateChart: postCreateChart,
    postAutoCreateAllDoctorsSchedule: postAutoCreateAllDoctorsSchedule,
    getDoctorsForSchedule: getDoctorsForSchedule,
    createSchedule: createSchedule,
    autoCreateAllDoctorsSchedule: autoCreateAllDoctorsSchedule
};
