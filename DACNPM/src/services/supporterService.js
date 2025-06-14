import db from "./../models";
import removeMd from "remove-markdown";
import syncElastic from "./syncsElaticService";
import helper from "../helper/client";

let getAllPosts = () => {
    return new Promise((async (resolve, reject) => {
        try {
            let posts = await db.Post.findAll({
                attributes: ['id', 'title', 'writerId', 'createdAt'],
            });
            await Promise.all(posts.map(async (post) => {
                let supporter = await helper.getSupporterById(post.writerId);
                let dateClient = helper.convertDateClient(post.createdAt);
                post.setDataValue('writerName', supporter.name);
                post.setDataValue('dateClient', dateClient);
                return post;
            }));

            resolve(posts);
        } catch (e) {
            reject(e);
        }
    }));
};

let postCreatePost = (item) => {
    return new Promise((async (resolve, reject) => {
        try {
            let post = await db.Post.create(item);

            // ko đồng bộ các bài đăng dành giới thiệu bác sĩ or chuyên khoa or phòng khám
            //syncs to elastic
            if (item.forDoctorId === '-1' && item.forClinicId === '-1' && item.forClinicId === '-1') {
                let plainText = removeMd(item.contentMarkdown);
                plainText.replace(/(?:\r\n|\r|\\n)/g, ' ');
                let data = {
                    'postId': post.id,
                    'writerId': post.writerId,
                    'title': item.title,
                    'content': plainText,
                };
                await syncElastic.createPost(data);
            }
            resolve(post);
        } catch (e) {
            reject(e);
        }
    }));
};

let getDetailPostPage = (id) => {
    console.log('⚠️ ĐANG GỌI getDetailPostPage');
    return new Promise((async (resolve, reject) => {
        try {
            let post = await db.Post.findOne({
                where: { id: id },
                attributes: ['id', 'title', 'contentHTML', 'contentMarkdown', 'forDoctorId', 'forSpecializationId', 'forClinicId']
            });
            if (!post) {
                reject(`Can't get post with id=${id}`);
            }
            resolve(post);
        } catch (e) {
            reject(e);
        }
    }));
};

let getDetailHandbook = (id) => {
    console.log('✅ ĐANG GỌI getDetailHandbook');
    return new Promise(async (resolve, reject) => {
        try {
            let handbook = await db.Handbook.findOne({
                where: { id: id },
                attributes: ['id', 'title', 'contentHTML', 'contentMarkdown', 'forDoctorId', 'forSpecializationId', 'forClinicId']
            });
            if (!handbook) {
                reject(`Can't get handbook with id=${id}`);
            }
            resolve(handbook);
        } catch (e) {
            reject(e);
        }
    });
};


let getAllSupporters = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let supporters = await db.User.findAll({
                where: { roleId: 3 }
            });

            resolve(supporters);

        } catch (e) {
            reject(e);
        }
    });
};

// Post
let getPostsPagination = (page, limit, role) => {
    return new Promise(async (resolve, reject) => {
        try {
            let posts = "";
            //only get bài đăng y khoa
            if (role === "admin") {
                posts = await db.Post.findAndCountAll({
                    offset: (page - 1) * limit,
                    limit: limit,
                    attributes: ['id', 'title', 'contentMarkdown', 'contentHTML', 'createdAt', 'writerId'],
                    order: [
                        ['createdAt', 'DESC']
                    ],
                });
            } else {
                posts = await db.Post.findAndCountAll({
                    // where: {
                    //     forDoctorId: -1,
                    //     forSpecializationId: -1,
                    //     forClinicId: -1
                    // },
                    offset: (page - 1) * limit,
                    limit: limit,
                    attributes: ['id', 'title', 'contentMarkdown', 'contentHTML', 'createdAt', 'writerId'],
                    order: [
                        ['createdAt', 'DESC']
                    ],
                });
            }

            let total = Math.ceil(posts.count / limit);

            await Promise.all(posts.rows.map(async (post) => {
                let supporter = await helper.getSupporterById(post.writerId);
                let dateClient = helper.convertDateClient(post.createdAt);
                post.setDataValue('writerName', supporter.name);
                post.setDataValue('dateClient', dateClient);
                return post;
            }));

            resolve({
                posts: posts,
                total: total
            });
        } catch (e) {
            reject(e);
        }
    });
};


// Hanbook
let getHandbookPagination = (page, limit, role) => {
    return new Promise(async (resolve, reject) => {
        try {
            let handbooks;

            // Chỉ lấy bài handbook — có thể lọc theo role nếu cần
            if (role === "admin") {
                handbooks = await db.Handbook.findAndCountAll({
                    offset: (page - 1) * limit,
                    limit: limit,
                    attributes: ['id', 'title', 'contentMarkdown', 'contentHTML', 'createdAt', 'writerId'],
                    order: [['createdAt', 'DESC']],
                });
            } else {
                handbooks = await db.Handbook.findAndCountAll({
                    // Bạn có thể mở filter nếu muốn giới hạn loại bài
                    offset: (page - 1) * limit,
                    limit: limit,
                    attributes: ['id', 'title', 'contentMarkdown', 'contentHTML', 'createdAt', 'writerId'],
                    order: [['createdAt', 'DESC']],
                });
            }

            let total = Math.ceil(handbooks.count / limit);

            await Promise.all(handbooks.rows.map(async (item) => {
                let supporter = await helper.getSupporterById(item.writerId);
                let dateClient = helper.convertDateClient(item.createdAt);
                item.setDataValue('writerName', supporter.name);
                item.setDataValue('dateClient', dateClient);
                return item;
            }));

            resolve({
                handbooks: handbooks,
                total: total
            });
        } catch (e) {
            reject(e);
        }
    });
};


let deletePostById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await db.Post.findOne({
                where: { id: id },
                attributes: ['id', 'forDoctorId', 'forSpecializationId', 'forClinicId']
            });

            // chỉ delete bài đăng y khoa
            //sync to elasticsearch
            if (post.forDoctorId === -1 && post.forClinicId === -1 && post.forClinicId === -1) {
                await syncElastic.deletePost(post.id);
            }

            await post.destroy();
            resolve(true);
        } catch (e) {
            reject(e);
        }
    });
};

// Ham xoa Comment
let deleteCommentById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let comment = await db.Comment.findOne({
                where: { id: id }
            });

            if (!comment) {
                return resolve(false); // không tìm thấy comment
            }

            await comment.destroy();
            resolve(true);
        } catch (e) {
            reject(e);
        }
    });
};


let putUpdatePost = (item) => {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await db.Post.findOne({
                where: { id: item.id },
                attributes: ['id', 'forDoctorId', 'forSpecializationId', 'forClinicId']
            });
            await post.update(item);

            //chỉ update bài đăng y khoa
            //sync to elasticsearch
            if (item.forDoctorId === '-1' && item.forClinicId === '-1' && item.forClinicId === '-1') {
                let plainText = removeMd(item.contentMarkdown);
                plainText.replace(/(?:\r\n|\r|\\n)/g, ' ');
                let data = {
                    'postId': post.id,
                    'writerId': post.writerId,
                    'title': item.title,
                    'content': plainText,
                };
                await syncElastic.updatePost(data);
            }

            resolve(true);
        } catch (e) {
            reject(e);
        }
    });
};

let doneComment = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let comment = await db.Comment.findOne({
                where: { id: id }
            });
            await comment.update({ status: true });
            resolve(comment);
        } catch (e) {
            reject(e)
        }
    });
};

module.exports = {
    postCreatePost: postCreatePost,
    getAllPosts: getAllPosts,
    getDetailPostPage: getDetailPostPage,
    getAllSupporters: getAllSupporters,
    getPostsPagination: getPostsPagination,
    deletePostById: deletePostById,
    putUpdatePost: putUpdatePost,
    doneComment: doneComment,
    getDetailHandbook: getDetailHandbook, //
    getHandbookPagination: getHandbookPagination, //
    deleteCommentById: deleteCommentById,//
};
