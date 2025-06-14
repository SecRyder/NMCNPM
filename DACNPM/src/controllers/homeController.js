require("dotenv").config();
const homeService = require('../services/homeService');
import db from '../models';  // Thêm dòng này
import specializationService from "./../services/specializationService";
import doctorService from "./../services/doctorService";
import userService from "./../services/userService";
import supporterService from "./../services/supporterService";
import clinicService from "./../services/clinicService";
import elasticService from "./../services/syncsElaticService";
import patientService from "./../services/patientService";
import moment from "moment";
// striptags to remove HTML
import striptags from "striptags";

import multer from "multer";

let LIMIT_POST = 5;

const statusPendingId = 3;
const statusFailedId = 2;
const statusSuccessId = 1;
const statusNewId = 4;

let getHomePage = async (req, res) => {
    try {
        let specializations = await homeService.getSpecializations();
        let clinics = await homeService.getClinics();
        let doctors = await userService.getInfoDoctors();
        let posts = await homeService.getPosts(LIMIT_POST);

        return res.render("main/homepage/homepage.ejs", {
            user: req.user,
            specializations: specializations,
            clinics: clinics,
            doctors: doctors,
            posts: posts,
            pageId: process.env.PAGE_ID
        });
    } catch (e) {
        console.error('Error:', e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getUserPage = (req, res) => {
    let currentMonth = new Date().getMonth() + 1;
    res.render("main/users/home.ejs", {
        user: req.user,
        currentMonth: currentMonth
    });
};

let getDetailSpecializationPage = async (req, res) => {
    try {
        let object = await specializationService.getSpecializationById(req.params.id);
        // using date to get schedule of doctors
        let currentDate = moment().format('DD/MM/YYYY');
        let doctors = await doctorService.getDoctorsForSpecialization(req.params.id, currentDate);
        let sevenDaySchedule = [];
        for (let i = 0; i < 5; i++) {
            let date = moment(new Date()).add(i, 'days').locale('en').format('dddd - DD/MM/YYYY');
            sevenDaySchedule.push(date);
        }

        let listSpecializations = await specializationService.getAllSpecializations();
        return res.render("main/homepage/specialization.ejs", {
            specialization: object.specialization,
            post: object.post,
            doctors: doctors,
            places: object.places,
            sevenDaySchedule: sevenDaySchedule,
            listSpecializations: listSpecializations
        });

    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getDetailDoctorPage = async (req, res) => {
    try {
        let currentDate = moment().format('DD/MM/YYYY');
        let sevenDaySchedule = [];
        for (let i = 0; i < 5; i++) {
            let date = moment(new Date()).add(i, 'days').locale('en').format('dddd - DD/MM/YYYY');
            sevenDaySchedule.push(date);
        }

        let object = await doctorService.getDoctorWithSchedule(req.params.id, currentDate);

        let places = await doctorService.getPlacesForDoctor();
        let postDoctor = await doctorService.getPostForDoctor(req.params.id);


        return res.render("main/homepage/doctor.ejs", {
            doctor: object.doctor,
            sevenDaySchedule: sevenDaySchedule,
            postDoctor: postDoctor,
            specialization: object.specialization,
            places: places,
            clinic: object.clinic
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getBookingPage = (req, res) => {
    res.render("main/homepage/bookingPage.ejs")
};


let getDetailPostPage = async (req, res) => {
    try {
        let post = await supporterService.getDetailPostPage(req.params.id);
        res.render("main/homepage/post.ejs", {
            post: post
        })
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

//
let getDetailHandbook = async (req, res) => {
    try {
        let handbook = await supporterService.getDetailHandbook(req.params.id);
        res.render('main/homepage/handbook.ejs', {
            handbook: handbook
        });

    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};


let getDetailClinicPage = async (req, res) => {
    try {
        let currentDate = moment().format('DD/MM/YYYY');
        let sevenDaySchedule = [];
        for (let i = 0; i < 5; i++) {
            let date = moment(new Date()).add(i, 'days').locale('en').format('dddd - DD/MM/YYYY');
            sevenDaySchedule.push(date);
        }
        let object = await clinicService.getDetailClinicPage(req.params.id, currentDate);

        res.render("main/homepage/clinic.ejs", {
            clinic: object.clinic,
            doctors: object.doctors,
            sevenDaySchedule: sevenDaySchedule,
            places: object.places
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let getContactPage = (req, res) => {
    return res.render('main/homepage/contact.ejs');
};

let getPostsWithPagination = async (req, res) => {
    let role = 'nope';
    let object = await supporterService.getPostsPagination(1, +process.env.LIMIT_GET_POST, role);
    return res.render("main/homepage/allPostsPagination.ejs", {
        posts: object.posts,
        total: object.total,
        striptags: striptags
    })
};
//
let getHandbookPaginationAPI = async (req, res) => {
    try {
        let role = 'nope';
        let page = +req.query.page || 1;
        let object = await supporterService.getHandbookPagination(page, +process.env.LIMIT_GET_POST, role);
        return res.json({
            handbooks: object.handbooks,
            total: object.total
        });
    } catch (e) {
        console.log("🔥 Lỗi getHandbookPaginationAPI:", e);
        return res.status(500).json({ error: "Server error" });
    }
};

let getHandbookWithPagination = async (req, res) => {
    let role = 'nope';
    let page = +req.query.page || 1;
    let object = await supporterService.getHandbookPagination(page, +process.env.LIMIT_GET_POST, role);
    return res.render("main/homepage/allHandbookPagination.ejs", {
        handbooks: object.handbooks.rows,
        total: object.total,
        striptags: striptags,
        current: page // Thêm biến current để đánh dấu trang hiện tại
    })
}

let getPostSearch = async (req, res) => {
    try {
        let keyword = req.query.q || req.query.keyword || '';
        let page = +req.query.page || 1;
        
        const { Op } = require('sequelize');
        
        const limit = +process.env.LIMIT_GET_POST || 10;
        const offset = (page - 1) * limit;
        
        // Tìm kiếm handbooks
        const results = await db.Handbook.findAndCountAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${keyword}%` } },
                    { contentHTML: { [Op.like]: `%${keyword}%` } },
                    { contentMarkdown: { [Op.like]: `%${keyword}%` } }
                ]
            },
            order: [['createdAt', 'DESC']],
            raw: true,
            limit: limit,
            offset: offset
        });
        
        // Sử dụng trang all-handbook hiện có để hiển thị kết quả tìm kiếm
        return res.render("main/homepage/allHandbookPagination.ejs", {
            handbooks: results.rows,
            total: Math.ceil(results.count / limit),
            striptags: striptags,
            searchTerm: keyword,
            isSearchResults: true,
            current: page,
            // Xóa biến hiển thị số kết quả
        });
    } catch (e) {
        console.error("Lỗi khi tìm kiếm:", e);
        
        return res.render("main/homepage/allHandbookPagination.ejs", {
            handbooks: [],
            total: 0,
            striptags: striptags,
            searchTerm: req.query.q || req.query.keyword || "",
            isSearchResults: true,
            current: 1
        });
    }
};

let getInfoBookingPage = async (req, res) => {
    try {
        let patientId = req.params.id;
        let patient = await patientService.getInfoBooking(patientId);
        return res.render('main/homepage/infoBooking.ejs', {
            patient: patient
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let postBookingDoctorPageWithoutFiles = async (req, res) => {
    try {
        let item = req.body;
        item.statusId = statusNewId;
        item.historyBreath = req.body.breath;
        item.moreInfo = req.body.extraOldForms;
        if (item.places === 'none') item.placeId = 0;
        item.placeId = item.places;
        item.createdAt = Date.now();

        let patient = await patientService.createNewPatient(item);
        return res.status(200).json({
            status: 1,
            message: 'success',
            patient: patient
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let postBookingDoctorPageNormal = (req, res) => {
    imageImageOldForms(req, res, async (err) => {
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

            let item = req.body;
            let imageOldForm = req.files;
            let image = {};
            imageOldForm.forEach((x, index) => {
                image[index] = x.filename;
            });

            item.statusId = statusNewId;
            item.historyBreath = req.body.breath;
            item.moreInfo = req.body.extraOldForms;
            if (item.places === 'none') item.placeId = 0;
            item.placeId = item.places;
            item.oldForms = JSON.stringify(image);
            item.createdAt = Date.now();

            let patient = await patientService.createNewPatient(item);
            return res.status(200).json({
                status: 1,
                message: 'success',
                patient: patient
            })

        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    });
};

let storageImageOldForms = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/patients");
    },
    filename: (req, file, callback) => {
        let imageName = `${Date.now()}-${file.originalname}`;
        callback(null, imageName);
    }
});

let imageImageOldForms = multer({
    storage: storageImageOldForms,
    limits: { fileSize: 1048576 * 20 }
}).array("oldForms");

let getDetailPatientBooking = async (req, res) => {
    try {
        let patient = await patientService.getDetailPatient(req.body.patientId);
        return res.status(200).json(patient);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getFeedbackPage = async (req, res) => {
    try {
        let doctor = await doctorService.getDoctorForFeedbackPage(req.params.id);
        return res.render("main/homepage/feedback.ejs", {
            doctor: doctor
        });
    } catch (e) {
        console.log(e);
        return res.render('main/homepage/pageNotFound.ejs');
    }
};

let postCreateFeedback = async (req, res) => {
    try {
        let feedback = await doctorService.createFeedback(req.body.data);
        return res.status(200).json({
            message: "send feedback success",
            feedback: feedback
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getPageForPatients = (req, res) => {
    return res.render("main/homepage/forPatients.ejs");
};

let getPageForDoctors = (req, res) => {
    return res.render("main/homepage/forDoctors.ejs");
};

let postSearchHomePage = async (req, res) => {
    try {
        let result = await homeService.postSearchHomePage(req.body.keyword);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

let getPageAllClinics = async (req, res) => {
    try {
        let clinics = await homeService.getDataPageAllClinics();

        return res.render("main/homepage/allClinics.ejs", {
            clinics: clinics
        })
    } catch (e) {
        console.log(e);
    }
};

let getPageAllDoctors = async (req, res) => {
    try {
        let doctors = await homeService.getDataPageAllDoctors();
        return res.render("main/homepage/allDoctors.ejs", {
            doctors: doctors
        })
    } catch (e) {
        console.log(e);
    }
};

let getPageAllSpecializations = async (req, res) => {
    try {
        let specializations = await homeService.getDataPageAllSpecializations();
        return res.render("main/homepage/allSpecializations.ejs", {
            specializations: specializations
        })
    } catch (e) {
        console.log(e);
    }
};

let getPostSearchDebug = async (req, res) => {
    try {
        // Kiểm tra đường dẫn đến thư mục views
        console.log("📁 Views directory:", app.get('views'));
        console.log("📁 Current directory:", __dirname);
        
        // Kiểm tra file template tồn tại không
        const fs = require('fs');
        const path = require('path');
        const viewPath = path.join(app.get('views'), 'main', 'handbook', 'search-results.ejs');
        
        console.log("📄 Checking if view exists:", viewPath);
        console.log("📄 View exists:", fs.existsSync(viewPath) ? "Yes" : "No");
        
        // Tiếp tục code...
    } catch (e) {
        // Xử lý lỗi...
    }
};

// Tìm hàm xử lý hiển thị trang chi tiết chuyên khoa
let getSpecialization = async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            console.log('Missing specialization ID');
            return res.render('main/404.ejs');
        }
        
        console.log("Finding specialization with ID:", id);
        
        // Lấy thông tin chuyên khoa
        let specialization = await specializationService.getSpecializationById(id);
        // Lấy danh sách tất cả chuyên khoa để hiển thị sidebar
        let listSpecializations = await specializationService.getAllSpecializations();
        
        // Lấy danh sách bác sĩ thuộc chuyên khoa này
        let doctors = [];
        try {
            // Thêm code lấy danh sách bác sĩ theo chuyên khoa
            doctors = await doctorService.getDoctorsBySpecialization(id);
            console.log(`Found ${doctors.length} doctors for specialization ${id}`);
        } catch (e) {
            console.log('Error getting doctors by specialization:', e);
            doctors = [];
        }
        
        if (!specialization) {
            console.log('No specialization found with ID:', id);
            return res.render('main/404.ejs');
        }
        
        // Render trang với dữ liệu đầy đủ, bao gồm danh sách bác sĩ
        return res.render('main/homepage/specialization.ejs', {
            specialization: specialization,
            listSpecializations: listSpecializations || [],
            doctors: doctors || []
        });
    } catch (e) {
        console.log('Error in getSpecialization:', e);
        return res.status(500).render('main/500.ejs', { error: e.message });
    }
};

module.exports = {
    getHomePage: getHomePage,
    getUserPage: getUserPage,
    getDetailSpecializationPage: getDetailSpecializationPage,
    getDetailDoctorPage: getDetailDoctorPage,
    getBookingPage: getBookingPage,
    getDetailPostPage: getDetailPostPage,
    getDetailClinicPage: getDetailClinicPage,
    getContactPage: getContactPage,
    getPostsWithPagination: getPostsWithPagination,
    getPostSearch: getPostSearch,
    getInfoBookingPage: getInfoBookingPage,
    postBookingDoctorPageWithoutFiles: postBookingDoctorPageWithoutFiles,
    postBookingDoctorPageNormal: postBookingDoctorPageNormal,
    getDetailPatientBooking: getDetailPatientBooking,
    getFeedbackPage: getFeedbackPage,
    postCreateFeedback: postCreateFeedback,
    getPageForPatients: getPageForPatients,
    getPageForDoctors: getPageForDoctors,
    postSearchHomePage: postSearchHomePage,
    getPageAllClinics: getPageAllClinics,
    getPageAllDoctors: getPageAllDoctors,
    getPageAllSpecializations: getPageAllSpecializations,
    getDetailHandbook: getDetailHandbook, //
    getHandbookWithPagination: getHandbookWithPagination, //
    getHandbookPaginationAPI: getHandbookPaginationAPI,//
    getSpecialization: getSpecialization
};
