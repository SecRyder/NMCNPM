var loadFile = function (event) {
    var output = $("#image-preview");
    if ($('#image-clinic').val()) {
        output.removeClass('d-none');
        output.addClass('d-block');
        output.attr('src', URL.createObjectURL(event.target.files[0]));
    }
};

function loadImageUserSetting() {
    var output = $("#img-user-setting");
    if ($('#update-avatar').val()) {
        output.attr('src', URL.createObjectURL(event.target.files[0]));
    }
}



function createNewPost(markdown, converter) {
    $('#createNewPost').on('click', function (event) {
        let formData = new FormData($('form#formCreateNewPost')[0]);
        let contentMarkdown = markdown.value();
        let contentHTML = converter.makeHtml(contentMarkdown);
        formData.append('contentMarkdown', contentMarkdown);
        formData.append('contentHTML', contentHTML);
        formData.append('title', $('#title-post').val());

        let data = {};
        for (let pair of formData.entries()) {
            data[pair[0]] = pair[1]
        }
        $.ajax({
            method: "POST",
            url: `${window.location.origin}/supporter/manage/post/create`,
            data: data,
            success: function (data) {
                alert('A new post is created successfully!');
                window.location.href = `${window.location.origin}/supporter/manage/posts`;
            },
            error: function (error) {
                alertify.error('An error occurs, please try again later!');
                console.log(error)
            }
        });

    });
}

function deleteClinicById() {
    $('.delete-specific-clinic').bind('click', function (e) {
        e.preventDefault();
        if (!confirm('Delete this clinic?')) {
            return
        }

        let id = $(this).data('clinic-id');
        let node = this;
        $.ajax({
            method: 'DELETE',
            url: `${window.location.origin}/admin/delete/clinic`,
            data: { id: id },
            success: function (data) {
                node.closest("tr").remove();
                alertify.success('Delete succeed!');
            },
            error: function (err) {
                alertify.error('An error occurs, please try again later!');
                console.log(err)
            }
        });
    });
}

// Ham xoa comment
function deleteCommentById() {
    $('.delete-comment').on('click', function (e) {
        if (!confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
            return
        }
        let id = $(this).attr('data-comment-id');
        let node = this;
        $.ajax({
            method: 'DELETE',
            url: `${window.location.origin}/admin/delete/comment`,
            data: { id: id },
            success: function (data) {
                node.closest("tr").remove();
                alertify.success('Xóa thành công!');
            },
            error: function (err) {
                alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
                console.log(err)
            }
        });
    });
}

function createNewClinic(markdownIntroClinic, converter) {
    $("#createNewClinic").on('click', function (e) {
        let formData = new FormData($('form#formCreateNewClinic')[0]);
        let contentMarkdown = markdownIntroClinic.value();
        let contentHTML = converter.makeHtml(contentMarkdown);

        //contain file upload
        if ($('#image-clinic').val()) {
            formData.append('introductionMarkdown', contentMarkdown);
            formData.append('introductionHTML', contentHTML);
            formData.append('image', document.getElementById('image-clinic').files[0]);
            handleCreateClinicNormal(formData);
        } else {
            // create without file upload
            let data = {
                introductionMarkdown: contentMarkdown,
                introductionHTML: contentHTML
            };
            for (let pair of formData.entries()) {
                data[pair[0]] = pair[1]
            }
            handleCreateClinicWithoutFile(data);
        }
    });
}

function handleCreateClinicWithoutFile(data) {
    $.ajax({
        method: "POST",
        url: `${window.location.origin}/admin/clinic/create-without-file`,
        data: data,
        success: function (data) {
            alert('A new clinic is created successfully');
            window.location.href = `${window.location.origin}/users/manage/clinic`;
        },
        error: function (error) {
            alertify.error('An error occurs, please try again later!');
            console.log(error)
        }
    });
}

function handleCreateClinicNormal(formData) {
    $.ajax({
        method: "POST",
        url: `${window.location.origin}/admin/clinic/create`,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            alert('A new clinic is created successfully');
            window.location.href = `${window.location.origin}/users/manage/clinic`;
        },
        error: function (error) {
            alertify.error('An error occurs, please try again later!');
            console.log(error);
        }
    });
}

function updateClinic(markdownIntroClinic, converter) {
    $('#btnUpdateClinic').on('click', function (e) {
        let clinicId = $('#btnUpdateClinic').data('clinic-id');
        let formData = new FormData($('form#formUpdateClinic')[0]);
        let contentMarkdown = markdownIntroClinic.value();
        let contentHTML = converter.makeHtml(contentMarkdown);

        //contain file upload
        if ($('#image-clinic').val()) {
            formData.append('introductionMarkdown', contentMarkdown);
            formData.append('introductionHTML', contentHTML);
            formData.append('image', document.getElementById('image-clinic').files[0]);
            formData.append('id', clinicId);
            handleUpdateClinicNormal(formData);
        } else {
            // create without file upload
            let data = {
                id: clinicId,
                introductionMarkdown: contentMarkdown,
                introductionHTML: contentHTML
            };
            for (let pair of formData.entries()) {
                data[pair[0]] = pair[1]
            }
            handleUpdateClinicWithoutFile(data);
        }
    });
}

function handleUpdateClinicNormal(formData) {
    $.ajax({
        method: "PUT",
        url: `${window.location.origin}/admin/clinic/update`,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            alert('Update succeeds');
            window.location.href = `${window.location.origin}/users/manage/clinic`;
        },
        error: function (error) {
            alertify.error('An error occurs, please try again later!');
            console.log(error);
        }
    });
}

function handleUpdateClinicWithoutFile(data) {
    $.ajax({
        method: "PUT",
        url: `${window.location.origin}/admin/clinic/update-without-file`,
        data: data,
        success: function (data) {
            alert('Update succeed');
            window.location.href = `${window.location.origin}/users/manage/clinic`;
        },
        error: function (error) {
            alertify.error('An error occurs, please try again later!');
            console.log(error);
        }
    });
}

function showModalInfoClinic() {
    $('.info-specific-clinic').on('click', function (e) {
        e.preventDefault();
        let id = $(this).data('clinic-id');

        $.ajax({
            method: 'POST',
            url: `${window.location.origin}/api/get-info-clinic-by-id`,
            data: { id: id },
            success: function (data) {
                $('#imageClinic').empty();
                $('#name').val(data.clinic.name);
                if (data.clinic.phone) {
                    $('#phone').val(data.clinic.phone);
                } else {
                    $('#phone').val('Has not been updated');
                }
                if (data.clinic.address) {
                    $('#address').val(data.clinic.address);
                } else {
                    $('#address').val('Has not been updated');
                }

                if (data.clinic.image) {
                    $('#imageClinic').prepend(`<img class="img-info-clinic" src="/images/clinics/${data.clinic.image}" />`)
                } else {
                    $('#imageClinic').text('Has not been updated')
                }

                $('#modalInfoClinic').modal('show');
            },
            error: function (error) {
                alertify.error('An error occurs, please try again later!');
                console.log(error);
            }
        });
    });
}

function showModalSettingUser() {
    $('.user-setting').on('click', function (e) {
        e.preventDefault();
        $('#modalSettingUser').modal('show');

    });
}

function createNewDoctor() {
    $('#createNewDoctor').on('click', function (e) {
        e.preventDefault();
        let formData = new FormData($('form#formCreateNewDoctor')[0]);
        let data = {};
        for (let pair of formData.entries()) {
            data[pair[0]] = pair[1]
        }
        $.ajax({
            method: "POST",
            url: `${window.location.origin}/admin/doctor/create`,
            data: data,
            success: function (data) {
                alert('Create a new doctor succeeds');
                window.location.href = `${window.location.origin}/users/manage/doctor`;
            },
            error: function (error) {
                alertify.error('An error occurs, please try again later!');
                console.log(error);
            }
        });
    });
}

function deleteDoctorById() {
    $('.delete-doctor-info').on('click', function (e) {
        if (!confirm('Delete this doctor?')) {
            return
        }

        let id = $(this).data('doctor-id');
        let node = this;
        $.ajax({
            method: 'DELETE',
            url: `${window.location.origin}/admin/delete/doctor`,
            data: { id: id },
            success: function (data) {
                node.closest("tr").remove();
                alertify.success('Delete succeeds');
            },
            error: function (err) {
                alertify.error('An error occurs, please try again later!');
                console.log(err)
            }
        });
    });
}

function showModalInfoDoctor() {
    $('.show-doctor-info').on('click', function (e) {
        e.preventDefault();
        let id = $(this).data('doctor-id');

        $.ajax({
            method: 'POST',
            url: `${window.location.origin}/api/get-info-doctor-by-id`,
            data: { id: id },
            success: function (data) {
                $('#imageDoctor').empty();

                $('#nameDoctor').val(data.doctor.name);
                if (data.doctor.phone) {
                    $('#phoneDoctor').val(data.doctor.phone);
                } else {
                    $('#phoneDoctor').val('Has not been updated');
                }
                if (data.doctor.address) {
                    $('#addressDoctor').val(data.doctor.address);
                } else {
                    $('#addressDoctor').val('Has not been updated');
                }
                $('#specializationDoctor').val(data.doctor.specializationName);
                $('#clinicDoctor').val(data.doctor.clinicName);
                if (data.doctor.avatar) {
                    $('#imageDoctor').prepend(`<img class="img-info-clinic" src="/images/users/${data.doctor.avatar}" />`)
                } else {
                    $('#imageDoctor').text('Has not been updated')
                }

                $('#modalInfoDoctor').modal('show');
            },
            error: function (error) {
                alertify.error('An error occurs, please try again later!');
                console.log(error);
            }
        });
    });

}

function updateDoctor() {
    $('#btnUpdateDoctor').on('click', function (e) {
        let doctorId = $('#btnUpdateDoctor').data('doctor-id');

        let formData = new FormData($('form#formUpdateDoctor')[0]);
        //contain file upload
        if ($('#image-clinic').val()) {
            formData.append('avatar', document.getElementById('image-clinic').files[0]);
            formData.append('id', doctorId);
            handleUpdateDoctorNormal(formData);
        } else {
            // create without file upload
            let data = {
                id: doctorId,
            };
            for (let pair of formData.entries()) {
                data[pair[0]] = pair[1]
            }
            handleUpdateDoctorWithoutFile(data);
        }
    });
}

function handleUpdateDoctorNormal(formData) {
    $.ajax({
        method: "PUT",
        url: `${window.location.origin}/admin/doctor/update`,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            alert('Update succeeds');
            window.location.href = `${window.location.origin}/users/manage/doctor`;
        },
        error: function (error) {
            alertify.error('An error occurs, please try again later!');
            console.log(error);
        }
    });
}

function handleUpdateDoctorWithoutFile(data) {
    $.ajax({
        method: "PUT",
        url: `${window.location.origin}/admin/doctor/update-without-file`,
        data: data,
        success: function (data) {
            alert('Update succeeds');
            window.location.href = `${window.location.origin}/users/manage/doctor`;
        },
        error: function (error) {
            alertify.error('An error occurs, please try again later!');
            console.log(error);
        }
    });
}

function deleteSpecializationById() {
    $('.delete-specialization').on('click', function (e) {
        if (!confirm('Delete this specialist?')) {
            return
        }
        let id = $(this).data('specialization-id');
        let node = this;
        $.ajax({
            method: 'DELETE',
            url: `${window.location.origin}/admin/delete/specialization`,
            data: { id: id },
            success: function (data) {
                node.closest("tr").remove();
                alertify.success('Delete succeeds');
            },
            error: function (err) {
                alertify.error('An error occurs, please try again later!');
                console.log(err)
            }
        });
    });
}

function showPostsForSupporter() {
    let currentPage = 1;
    let total = $('#paginationForPost').data('total');
    if (total === 1) {
        $(' .li-next').addClass('disabled');
    }
    $('.page-post-next').on('click', function (e) {
        e.preventDefault();
        currentPage++;
        $(' .li-pre').removeClass('disabled');

        if (currentPage === total) {
            $(' .li-next').addClass('disabled');
        }
        if (currentPage > total) return;
        generateTablePostPagination(currentPage);
    });

    $('.page-post-pre').on('click', function (e) {
        e.preventDefault();
        currentPage--;
        $(' .li-next').removeClass('disabled');
        if (currentPage === 1) {
            $(' .li-pre').addClass('disabled');
        }
        if (currentPage === 0) return;
        generateTablePostPagination(currentPage);
    });
}

function generateTablePostPagination(page) {
    $.ajax({
        url: `${window.location.origin}/supporter/pagination/posts?page=${page}`,
        method: 'GET',
        success: function (data) {
            $("#listPostsTable tbody").empty();
            let html = '';
            data.posts.rows.forEach((post) => {
                html += `
                 <tr>
                        <td> ${post.id}</td>
                        <td>${post.title}</td>
                        <td>${post.writerName}</td>
                        <td>${post.dateClient}</td>
                        <td class="">
                            <a class=" " href="/supporter/post/edit/${post.id}" title="Edit info"><i class="fas fa-pen-square mx-3"></i></a>
                            <a class="delete-post" href="#" data-post-id="${post.id}" title="Delete"><i class="fas fa-trash"></i></a>
                        </td>
                   </tr>
                `;
            });
            $("#listPostsTable tbody").append(html);
        },
        error: function (err) {
            alertify.error('An error occurs, please try again later!');
            console.log(err)
        }
    });
}

function deletePostById() {
    $('.delete-post').on('click', function (e) {
        if (!confirm('Delete this post?')) {
            return
        }
        let id = $(this).data('post-id');
        let node = this;
        $.ajax({
            method: 'DELETE',
            url: `${window.location.origin}/admin/delete/post`,
            data: { id: id },
            success: function (data) {
                node.closest("tr").remove();
                alertify.success('Delete succeeds');
            },
            error: function (err) {
                alertify.error('An error occurs, please try again later!');
                console.log(err)
            }
        });
    });
}

function updatePost(markdown, converter) {
    $('#btnUpdatePost').on('click', function (e) {
        let postId = $('#btnUpdatePost').data('post-id');
        let formData = new FormData($('form#formUpdatePost')[0]);
        let contentMarkdown = markdown.value();
        let contentHTML = converter.makeHtml(contentMarkdown);
        formData.append('contentMarkdown', contentMarkdown);
        formData.append('contentHTML', contentHTML);
        formData.append('title', $('#titlePost').val());

        let data = {
            id: postId
        };
        for (let pair of formData.entries()) {
            data[pair[0]] = pair[1]
        }
        $.ajax({
            method: "PUT",
            url: `${window.location.origin}/supporter/post/update`,
            data: data,
            success: function (data) {
                alert('Update succeeds');
                window.location.href = `${window.location.origin}/supporter/manage/posts`;
            },
            error: function (error) {
                alertify.error('An error occurs, please try again later!');
                console.log(error)
            }
        });

    });
}

function createScheduleByDoctor(scheduleArr) {
    $("#createNewScheduleDoctor").on("click", function () {
        if (scheduleArr.length === 0) {
            alertify.error('Have not selected a plan to save');
            return
        }

        $.ajax({
            method: 'POST',
            url: `${window.location.origin}/doctor/manage/schedule/create`,
            data: { 'schedule_arr': scheduleArr },
            success: function (data) {
                if (data.status === 1) {
                    alertify.success('Add a successful appointment');
                }
            },
            error: function (error) {
                alertify.error('An error occurs, please try again later!');
                console.log(error)
            }

        });
    });
}

function handleBtnSchedule() {
    let scheduleArr = [];
    $('.btn-schedule').unbind('click').bind('click', function (e) {
        let idBtn = $(this).attr('id');
        $(`#${idBtn}`).toggleClass('btn btn-css');

        let time = $(`#${idBtn}`).attr("value");
        let date = $("#datepicker").val();

        //check có class thì add new row, else try to remove
        if ($(`#${idBtn}`).hasClass("btn-css")) {

            let item = {
                'date': date,
                'time': time,
                'id': `${idBtn}-${date}`
            };
            scheduleArr.push(item);
            $('#tableCreateSchedule tbody').append(
                ` <tr id="row-${idBtn}">
                         <td>${time}</td>
                         <td>${date}</td>
                  </tr>`);
        } else {
            let count = -1;
            let timeCheck = $(`#${idBtn}`).attr("value");
            let dateCheck = $("#datepicker").val();
            scheduleArr.forEach((x, index) => {
                if (x.time === timeCheck && x.date === dateCheck) {
                    count = index;
                }
            });
            if (count > -1) scheduleArr.splice(count, 1);

            $(`table#tableCreateSchedule tr#row-${idBtn}`).remove();
        }

        scheduleArr.sort(function (a, b) {
            return a.time.localeCompare(b.time)
        });
    });

    return scheduleArr;
}

function handleChangeDatePicker(currentDate) {
    $('#datepicker').datepicker().on('changeDate', function (event) {
        let date = $("#datepicker").val();
        let dateConvert = stringToDate(date, "dd/MM/yyyy", "/");
        let currentDateConvert = stringToDate(currentDate, "dd/MM/yyyy", "/");
        if (dateConvert >= currentDateConvert) {
            //continue, refresh button
            $('.btn-schedule').removeClass('btn-css').addClass('btn');
        } else {
            $('#datepicker').datepicker("setDate", new Date());
            alertify.error('Cant create a medical plan for the past');
        }
    });
}

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

function loadNewPatientsForSupporter() {
    $.ajax({
        url: `${window.location.origin}/supporter/get-patients-for-tabs`,
        method: 'POST',
        success: function (data) {
            let countNew = data.object.newPatients.length;
            let countPending = data.object.pendingPatients.length;
            let countConfirmed = data.object.confirmedPatients.length;
            let countCanceled = data.object.canceledPatients.length;

            $('#count-new').text(`${countNew}`);
            $('#count-need').text(`${countPending}`);
            $('#count-confirmed').text(`${countConfirmed}`);
            $('#count-canceled').text(`${countCanceled}`);

            let htmlNew, htmlPending, htmlConfirmed, htmlCanceled = '';
            data.object.newPatients.forEach((patient) => {
                htmlNew += `
                <tr>
                    <td> ${patient.id} - ${patient.name}   </td>
                    <td> ${patient.phone}     </td>
                    <td> ${patient.email}     </td>
                    <td>${convertStringToDateClient(patient.updatedAt)}      </td>
                    <td> 
                    <button type="button"  data-patient-id="${patient.id}" class="ml-3 btn btn-primary btn-new-patient-ok"> Receive</button>
                    <button  type="button" data-patient-id="${patient.id}" class="ml-3 btn btn-danger btn-new-patient-cancel"> Cancel </button>
                    </td>
                </tr>
                `;
            });

            data.object.pendingPatients.forEach((patient) => {
                htmlPending += `
                <tr>
                    <td> ${patient.id} - ${patient.name}   </td>
                    <td> ${patient.phone}     </td>
                    <td> ${patient.email}     </td>
                    <td> ${convertStringToDateClient(patient.updatedAt)}      </td>
                    <td> 
                    <button  data-patient-id="${patient.id}"  class="ml-3 btn btn-warning btn-pending-patient">Confirm</button>
                    <button  type="button" data-patient-id="${patient.id}" class="ml-3 btn btn-danger btn-pending-patient-cancel"> Cancel </button>
                    </td>
                </tr>
                `;
            });

            data.object.confirmedPatients.forEach((patient) => {
                htmlConfirmed += `
                <tr>
                    <td> ${patient.id} - ${patient.name}   </td>
                    <td> ${patient.phone}     </td>
                    <td> ${patient.email}     </td>
                    <td> ${convertStringToDateClient(patient.updatedAt)}     </td>
                    <td> 
                    <button  type="button" data-patient-id="${patient.id}"  class="ml-3 btn btn-info btn-confirmed-patient"> Information</button>
                    </td>
                </tr>
                `;
            });

            data.object.canceledPatients.forEach((patient) => {
                htmlCanceled += `
                <tr>
                    <td> ${patient.id} - ${patient.name}   </td>
                    <td> ${patient.phone}     </td>
                    <td> ${patient.email}     </td>
                    <td> ${convertStringToDateClient(patient.updatedAt)} </td>
                    <td> 
                    <button   data-patient-id="${patient.id}"  class="ml-3 btn btn-primary btn-history-cancel-patient">History</button>
                    </td>
                </tr>
                `;
            });

            $('#tableNewPatients tbody').append(htmlNew);
            $('#tableNeedConfirmPatients tbody').append(htmlPending);
            $('#tableConfirmedPatients tbody').append(htmlConfirmed);
            $('#tableCancelPatients tbody').append(htmlCanceled);
        },
        error: function (error) {
            console.log(error);
            alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
        }
    });
}

function handleBtnNewPatientOk() {
    $("#tableNewPatients").on("click", ".btn-new-patient-ok", function (e) {
        if (!confirm('Bạn có muốn xác nhận bệnh nhân này không?')) {
            return
        }
        let countNew = +$('#count-new').text();
        let countPending = +$('#count-need').text();
        let patientId = $(this).data('patient-id');
        this.closest("tr").remove();
        countNew--;
        countPending++;
        $('#count-new').text(countNew);
        $('#count-need').text(countPending);

        $.ajax({
            url: `${window.location.origin}/supporter/change-status-patient`,
            method: 'POST',
            data: { patientId: patientId, status: 'pending' },
            success: function (data) {
                let patient = data.patient;
                addNewRowTablePending(patient);
            },
            error: function (error) {
                console.log(error);
                alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
            }
        });
    });
}

function handleBtnNewPatientCancel() {
    $("#tableNewPatients").on("click", ".btn-new-patient-cancel", function (e) {
        $('#btnCancelBookingPatient').attr('data-patient-id', $(this).data('patient-id'));
        $('#btnCancelBookingPatient').attr('data-type', 'new-patient-cancel');
        $('#modalCancelBooking').modal('show');
    });
}

function callAjaxRenderModalInfo(patientId, option) {
    $.ajax({
        method: 'POST',
        url: `${window.location.origin}/api/get-detail-patient-by-id`,
        data: { patientId: patientId },
        success: function (data) {
            $('#patientName').val(data.name);
            $('#btn-confirm-patient-done').attr('data-patient-id', data.id);
            $('#patientPhone').val(data.phone);
            $('#patientEmail').val(data.email);
            $('#patientDate').val(data.dateBooking);
            $('#patientTime').val(data.timeBooking);
            $('#patientReason').text(data.description);
            $('#patientAddress').text(data.address);
            if (data.ExtraInfo) {
                $('#patientHistoryBreath').text(data.ExtraInfo.historyBreath);
                $('#patientMoreInfo').text(data.ExtraInfo.moreInfo);
            }
            if (option) {
                $('#btn-confirm-patient-done').css('display', 'none');
                $('#btn-cancel-patient').text("OK");
            }
            $('#modalDetailPatient').modal('show');
        },
        error: function (err) {
            console.log(error);
            alertify.error('An error occurs, please try again later!');
        }
    });
}

function handleBtnPendingPatient() {
    $("#tableNeedConfirmPatients").on("click", ".btn-pending-patient", function (e) {
        let patientId = $(this).data('patient-id');
        let option = false;
        callAjaxRenderModalInfo(patientId, option);
    });
}

function handleBtnPendingCancel() {
    $("#tableNeedConfirmPatients").on("click", ".btn-pending-patient-cancel", function (e) {
        $('#btnCancelBookingPatient').attr('data-patient-id', $(this).data('patient-id'));
        $('#btnCancelBookingPatient').attr('data-type', 'pending-patient-cancel');
        $('#modalCancelBooking').modal('show');
    });
}

function addNewRowTablePending(patient) {
    let htmlPending = `
                 <tr>
                    <td> ${patient.id} - ${patient.name}   </td>
                    <td> ${patient.phone}     </td>
                    <td> ${patient.email}     </td>
                    <td> ${convertStringToDateClient(patient.updatedAt)}     </td>
                    <td> 
                    <button  data-patient-id="${patient.id}"  class="ml-3 btn btn-warning btn-pending-patient">Confirm</button>
                    <button  type="button" data-patient-id="${patient.id}" class="ml-3 btn btn-danger btn-pending-patient-cancel"> Cancel </button>
                    </td>
                </tr>
               
                `;
    $('#tableNeedConfirmPatients tbody').prepend(htmlPending);
}

function addNewRowTableConfirmed(patient) {
    let htmlConfirmed = `
                <tr>
                    <td> ${patient.id} - ${patient.name}   </td>
                    <td> ${patient.phone}     </td>
                    <td> ${patient.email}     </td>
                    <td> ${convertStringToDateClient(patient.updatedAt)}     </td>
                    <td> 
                    <button  type="button" data-patient-id="${patient.id}"  class="ml-3 btn btn-info btn-confirmed-patient"> Information</button>
                    </td>
                </tr>
                `;
    $('#tableConfirmedPatients tbody').prepend(htmlConfirmed);

}

function addNewRowTableCanceled(patient) {
    let htmlPending = `
                  <tr>
                    <td> ${patient.id} - ${patient.name}   </td>
                    <td> ${patient.phone}     </td>
                    <td> ${patient.email}     </td>
                    <td> ${convertStringToDateClient(patient.updatedAt)} </td>
                    <td> 
                    <button   data-patient-id="${patient.id}"  class="ml-3 btn btn-primary btn-history-cancel-patient">History</button>
                    </td>
                </tr>
               
                `;
    $('#tableCancelPatients tbody').prepend(htmlPending);
}

function convertStringToDateClient(string) {
    return moment(Date.parse(string)).format("DD/MM/YYYY, HH:mm A");
}

function handleAfterCallingPatient() {
    $('#btn-confirm-patient-done').on('click', function (e) {
        if (!confirm('Bạn đã gọi điện thoại để xác nhận xem bệnh nhân có cuộc hẹn hay không?')) {
            return;
        }
        let countPending = +$('#count-need').text();
        let countConfirmed = +$('#count-confirmed').text();
        countPending--;
        countConfirmed++;
        $('#modalDetailPatient').modal('hide');
        let patientId = $('#btn-confirm-patient-done').attr('data-patient-id');
        $('#tableNeedConfirmPatients tbody').find(`.btn-pending-patient[data-patient-id=${patientId}]`).closest("tr").remove();
        $('#count-need').text(countPending);
        $('#count-confirmed').text(countConfirmed);

        $.ajax({
            url: `${window.location.origin}/supporter/change-status-patient`,
            method: 'POST',
            data: { patientId: patientId, status: 'confirmed' },
            success: function (data) {
                console.log(data)
                let patient = data.patient;
                addNewRowTableConfirmed(patient);
            },
            error: function (error) {
                console.log(error);
                alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
            }
        });
    });
}

function handleViewInfoPatientBooked() {
    $("#tableConfirmedPatients").on("click", ".btn-confirmed-patient", function (e) {
        let patientId = $(this).data('patient-id');
        let option = true;
        callAjaxRenderModalInfo(patientId, option);
    });
}

function handleCancelBtn() {
    $('#btnCancelBookingPatient').on('click', function (e) {
        let formData = new FormData($('form#formCancelBooking')[0]);
        let data = {};
        let text = '';
        for (let pair of formData.entries()) {
            data[pair[0]] = pair[1]
        }

        if (data.reasonCancel === 'reason3') {
            if (!$('#otherReason').val()) {
                alert('Vui lòng điền thêm thông tin vì lí do khác');
                return;
            }
            text = `Lí do khác: ${$('#otherReason').val()} `;
        } else if (data.reasonCancel === 'reason2') {
            text = 'Bệnh nhân đã hủy đặt lịch';
        } else {
            text = 'Lịch khám bị Spam, không có thật'
        }

        let patientId = $('#btnCancelBookingPatient').attr('data-patient-id');

        let type = $('#btnCancelBookingPatient').attr('data-type');

        if (type === 'pending-patient-cancel') {
            let countPending = +$('#count-need').text();
            let countCancel = +$('#count-canceled').text();
            countPending--;
            countCancel++;
            $('#tableNeedConfirmPatients tbody').find(`.btn-pending-patient-cancel[data-patient-id=${patientId}]`).closest("tr").remove();
            $('#count-need').text(countPending);
            $('#count-canceled').text(countCancel);
        } else {
            let countNew = +$('#count-new').text();
            let countCancel = +$('#count-canceled').text();
            countNew--;
            countCancel++;
            $('#tableNewPatients tbody').find(`.btn-new-patient-cancel[data-patient-id=${patientId}]`).closest("tr").remove();
            $('#count-new').text(countNew);
            $('#count-canceled').text(countCancel);
        }

        $('#modalCancelBooking').modal('hide');

        $.ajax({
            url: `${window.location.origin}/supporter/change-status-patient`,
            method: 'POST',
            data: { patientId: patientId, status: 'failed', reason: text },
            success: function (data) {
                let patient = data.patient;
                addNewRowTableCanceled(patient);
            },
            error: function (error) {
                console.log(error);
                alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
            }
        });

    });
}

function handleBtnViewHistory() {
    $('#tableCancelPatients').on('click', '.btn-history-cancel-patient', function () {
        let patientId = $(this).data('patient-id');
        $('#btn-view-history').attr('data-patient-id', patientId);
        $.ajax({
            url: `${window.location.origin}/supporter/get-logs-patient`,
            method: 'POST',
            data: { patientId: patientId },
            success: function (data) {
                $("#contentHistory").empty();

                let html = '';
                data.forEach((log) => {
                    html += `
                     <div class="form-row mb-3">
                            <div class="col-6">
                                <input type="text"  class="form-control" id="historyStatus" value="${log.content}">
                            </div>
                            <div class="col-3">
                                <input type="text"  class="form-control" id="personDone" value="${log.supporterName}">
                            </div>
                            <div class="col-3">
                                <input type="text"  class="form-control" id="timeDone" value="${convertStringToDateClient(log.createdAt)} ">
                            </div>
                        </div>
                    
                    `;
                });
                $('#contentHistory').append(html);
                $('#modalHistoryBooking').modal('show');
            },
            error: function (error) {
                console.log(error);
                alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
            }
        });
    })
}

function handleDoctorViewInfoPatient() {
    $('.doctor-view-detail').on('click', function (e) {
        let patientId = $(this).attr('data-patient-id');
        $.ajax({
            method: 'POST',
            url: `${window.location.origin}/api/get-detail-patient-by-id`,
            data: { patientId: patientId },
            success: function (data) {
                $('#imageOldForms').empty();
                $('#patientName').val(data.name);
                $('#patientPhone').val(data.phone);
                $('#patientEmail').val(data.email);
                $('#patientDate').val(data.dateBooking);
                $('#patientTime').val(data.timeBooking);
                $('#patientReason').text(data.description);
                $('#patientAddress').text(data.address);
                if (data.ExtraInfo) {
                    $('#patientHistoryBreath').text(data.ExtraInfo.historyBreath);
                    $('#patientMoreInfo').text(data.ExtraInfo.moreInfo);
                    if (data.ExtraInfo.oldForms) {
                        let images = JSON.parse(data.ExtraInfo.oldForms);
                        let html = '';
                        for (let [key, value] of Object.entries(images)) {
                            html += `
                              <a href="/images/patients/${value}" class="mr-3" target="_blank" title="Click to show the image">
                                <span>${value}</span>
                              </a>
                            `;
                        }

                        $('#imageOldForms').append(html)
                    } else {
                        $('#imageOldForms').append(`<span>No information</span>`)
                    }
                }

                $('#modalDetailPatientForDoctor').modal('show');
            },
            error: function (err) {
                console.log(error);
                alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
            }
        });
    });
}

function showModalSendForms() {
    $('.doctor-send-forms').on('click', function (e) {
        let patientId = $(this).attr('data-patient-id');
        let isSend = $(this).attr('data-is-send-forms');

        $.ajax({
            url: `${window.location.origin}/api/get-detail-patient-by-id`,
            method: "POST",
            data: { patientId: patientId },
            success: function (data) {
                let html = '';
                $('#divGenerateFilesSend').empty();
                $('#emailPatient').val(data.email);
                $('#btnSendFilesForms').attr('data-patient-id', patientId);
                if (data.ExtraInfo) {
                    if (data.ExtraInfo.sendForms) {
                        let images = JSON.parse(data.ExtraInfo.sendForms);
                        for (let [key, value] of Object.entries(images)) {
                            html += `
                              <div class="form-row">
                                <div class="form-group col-9">
                                    <a type="text" class="form-control" id="nameFileSent" target="_blank" href="/images/patients/remedy/${value}" readonly="true" title="${value}" >
                               ${value}
                                </a>
                                </div>
                             </div>`;
                        }
                    } else {
                        html = `
                          <div class="form-row">
                            <div class="form-group col-9">
                                <label class="col-form-label text-label" for="nameFileSent"> File's name:</label>
                                <input type="text" class="form-control" id="nameFileSent" name="nameFileSent" disabled>
                            </div>
                         </div>`
                    }
                }
                $('#divGenerateFilesSend').append(html);
                $('#modalSendForms').modal('show');
            },
            error: function (error) {
                console.log(error);
                alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
            }
        });
    });
}

function handleSendFormsForPatient() {
    $('#btnSendFilesForms').on("click", function (e) {
        if (!$('#filesSend').val()) {
            alert("Vui lòng chọn file trước khi nhấn gửi!");
            return;
        }
        $(this).prop('disabled', true);
        $('#processLoadingAdmin').removeClass('d-none');
        let formData = new FormData($('form#formSendFormsForPatient')[0]);
        formData.append('patientId', $(this).attr('data-patient-id'));

        $.ajax({
            method: "POST",
            url: `${window.location.origin}/doctor/send-forms-to-patient`,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                $('#modalSendForms').modal('hide');
                $('#processLoadingAdmin').addClass('d-none');
                $('#btnSendFilesForms').prop('disabled', false);
                $(`.fa-exclamation-circle[data-patient-id=${data.patient.id}]`).css('color', '#36b9cc');
                $(`.fa-exclamation-circle[data-patient-id=${data.patient.id}]`).removeClass('fa-exclamation-circle').addClass('fa-check-circle')
                alertify.success('Sending remedies succeeds');
            },
            error: function (error) {
                alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
                console.log(error);
            }
        });
    });
}

function resetModal() {
    $(`#modalDetailPatient`).on('hidden.bs.modal', function (e) {
        $(this).find("input,textarea,select").val('').end().find("input[type=checkbox], input[type=radio]").prop("checked", "").end();
    });

    $(`#modalHistoryBooking`).on('hidden.bs.modal', function (e) {
        $(this).find("input,textarea,select").val('').end().find("input[type=checkbox], input[type=radio]").prop("checked", "").end();
    });

    $(`#modalDetailPatientForDoctor`).on('hidden.bs.modal', function (e) {
        $(this).find("input,textarea,select").val('').end().find("input[type=checkbox], input[type=radio]").prop("checked", "").end();
    });

    $(`#modalSendForms`).on('hidden.bs.modal', function (e) {
        $(this).find("input,textarea,select").val('').end().find("input[type=checkbox], input[type=radio]").prop("checked", "").end();
    });
    $(`#modalCancelBooking`).on('hidden.bs.modal', function (e) {
        $(this).find("input,textarea,select").val('').end().find("input[type=checkbox], input[type=radio]").prop("checked", "").end();
        $('#inputDefaultReason').prop('checked', true);
    });
}

function doneComment() {
    $(".done-comment").on('click', function (e) {
        if (confirm("Xác nhận lưu phản hồi của bệnh nhân?")) {
            let commentId = $(this).attr('data-comment-id');
            node = this;
            $.ajax({
                method: 'POST',
                url: `${window.location.origin}/supporter/done-comment`,
                data: { commentId: commentId },
                success: function (data) {
                    node.closest("tr").remove();
                    console.log(data);
                    alertify.success('Lưu phản hồi thành công!');
                },
                error: function (error) {
                    alertify.error('Xảy ra lỗi. Vui lòng thử lại sau!');
                    console.log(error);
                }
            })
        }

    })
}

function statisticalAdmin(month) {
    $.ajax({
        method: "POST",
        url: `${window.location.origin}/admin/statistical`,
        data: { month: month },
        success: function (data) {
            $('#sumPatient').text(data.patients.count);
            $('#sumDoctor').text(data.doctors.count);
            $('#sumPost').text(data.posts.count);

            if (data.bestDoctor === '') {
                $('#bestDoctor').text(`No information`);
            } else {
                $('#bestDoctor').text(`${data.bestDoctor.name} (${data.bestDoctor.count})`);
            }
            if (data.bestSupporter === '') {
                $('#bestSupporter').text(`No information`);
            } else {
                $('#bestSupporter').text(`${data.bestSupporter.name} (${data.bestSupporter.count})`);
            }
        },
        error: function (error) {
            alertify.error('An error occurred while getting statistical information, please try again later');
            console.log(error);
        }
    })
}

function handleFindStatisticalAdmin() {
    $('#findStatisticalAdmin').on('click', function () {
        statisticalAdmin($('#monthAnalyse').val())
    })
}

$(document).ready(function (e) {
    // $('.modal').on('hidden.bs.modal', function(e) {
    //     $(this).removeData();
    // });

    let markdownIntroClinic = new SimpleMDE({
        element: document.getElementById("intro-clinic"),
        placeholder: 'Introductory content...',
        spellChecker: false
    });
    let markdownPost = new SimpleMDE({
        element: document.getElementById("contentMarkdown"),
        placeholder: 'Post content...',
        spellChecker: false
    });
    let converter = new showdown.Converter();
    //create datepicker, doctor create schedule
    $('#datepicker').datepicker({
        format: 'dd/mm/yyyy',
        weekStart: 1,
        daysOfWeekHighlighted: "6,0",
        autoclose: true,
        todayHighlight: true,
    });
    $('#datepicker').datepicker("setDate", new Date());

    //create datepicker, doctor-appointment
    $('#dateDoctorAppointment').datepicker({
        format: 'dd/mm/yyyy',
        weekStart: 1,
        daysOfWeekHighlighted: "6,0",
        autoclose: true,
        todayHighlight: true,
    });

    loadFile(e);
    loadImageUserSetting(e);
    createNewClinic(markdownIntroClinic, converter);
    deleteClinicById();
    updateClinic(markdownIntroClinic, converter);
    showModalInfoClinic();
    showModalSettingUser();
    createNewDoctor();
    deleteDoctorById();
    showModalInfoDoctor();
    updateDoctor();
    deleteSpecializationById();
    showPostsForSupporter();
    deletePostById();
    createNewPost(markdownPost, converter);
    updatePost(markdownPost, converter);

    deleteCommentById();


    let arr = handleBtnSchedule();
    createScheduleByDoctor(arr);
    let currentDate = $("#datepicker").val();
    handleChangeDatePicker(currentDate);
    loadNewPatientsForSupporter();
    handleBtnNewPatientOk();
    handleBtnNewPatientCancel();
    handleBtnPendingPatient();
    handleBtnPendingCancel();
    resetModal();
    handleAfterCallingPatient();
    handleViewInfoPatientBooked();
    handleCancelBtn();
    handleBtnViewHistory();

    handleDoctorViewInfoPatient();
    showModalSendForms();
    handleSendFormsForPatient();
    doneComment();

    let month = new Date().getMonth();
    statisticalAdmin(month + 1);
    handleFindStatisticalAdmin();

    // Xử lý nút xem thông tin chuyên khoa
    $('.view-specialization-info').on('click', function (e) {
        e.preventDefault();
        const id = $(this).data('id');

        $.ajax({
            url: `${window.location.origin}/admin/get-specialization-by-id`,
            method: "POST",
            data: { id: id },
            success: function (response) {
                if (response.errCode === 0) {
                    $('#specialization-info-modal .modal-title').text('Thông tin chuyên khoa');
                    $('#specialization-info-modal .specialization-name').text(response.data.name);
                    $('#specialization-info-modal .specialization-description').html(response.data.description);
                    if (response.data.image) {
                        $('#specialization-info-modal .specialization-image').attr('src', `/images/specializations/${response.data.image}`);
                    }
                    $('#specialization-info-modal').modal('show');
                } else {
                    alertify.error(response.errMessage || 'Không thể lấy thông tin chuyên khoa');
                }
            },
            error: function (error) {
                console.error(error);
                alertify.error('Đã xảy ra lỗi khi tải thông tin chuyên khoa');
            }
        });
    });

    // Sửa việc chuyển hướng đến trang edit từ nút chỉnh sửa
    $('.edit-specialization').on('click', function (e) {
        e.preventDefault();
        const id = $(this).data('id');

        // Kiểm tra ID
        if (!id || isNaN(parseInt(id))) {
            alert('Lỗi: ID chuyên khoa không hợp lệ');
            return;
        }

        console.log("Redirecting to edit page with ID:", id);
        window.location.href = `/admin/edit-specialization/${id}`;
    });

    // Đã có xử lý xóa chuyên khoa nên không cần thêm
});

// Thêm event handler cho nút xem chi tiết chuyên khoa
$(document).ready(function () {
    $('.view-specialization-info').on('click', function (e) {
        e.preventDefault();
        const id = $(this).data('id');

        if (!id) {
            alertify.error('Không tìm thấy ID chuyên khoa');
            return;
        }

        console.log("Viewing specialization with ID:", id);

        $.ajax({
            url: `${window.location.origin}/admin/get-specialization-by-id`,
            method: "POST",
            data: { id: id },
            success: function (response) {
                if (response.errCode === 0) {
                    // Hiển thị thông tin trong modal
                    $('#modal-specialization-name').text(response.data.name);
                    $('#modal-specialization-description').html(response.data.description || 'Không có mô tả');

                    if (response.data.image) {
                        $('#modal-specialization-image')
                            .attr('src', `/images/specializations/${response.data.image}`)
                            .show();
                    } else {
                        $('#modal-specialization-image').hide();
                    }

                    $('#viewSpecializationModal').modal('show');
                } else {
                    alertify.error(response.errMessage || 'Không thể lấy thông tin chuyên khoa');
                }
            },
            error: function (error) {
                console.error('Error fetching specialization:', error);
                alertify.error('Đã xảy ra lỗi khi tải thông tin chuyên khoa');
            }
        });
    });

    // Xử lý nút xóa chuyên khoa
    $('.delete-specific-specialization').on('click', function (e) {
        e.preventDefault();
        const id = $(this).data('id');
        const name = $(this).data('name');

        if (!id) {
            alertify.error('Không tìm thấy ID chuyên khoa');
            return;
        }

        // Hiển thị xác nhận trước khi xóa
        alertify.confirm(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa chuyên khoa "${name || 'này'}"?`,
            function () {
                // Nếu người dùng xác nhận xóa
                $.ajax({
                    url: `${window.location.origin}/admin/delete-specialization`,
                    method: "DELETE",
                    data: { id: id },
                    success: function (response) {
                        if (response.errCode === 0) {
                            alertify.success('Xóa chuyên khoa thành công');
                            // Reload trang sau khi xóa thành công
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        } else {
                            alertify.error(response.errMessage || 'Không thể xóa chuyên khoa');
                        }
                    },
                    error: function (error) {
                        console.error('Error deleting specialization:', error);
                        alertify.error('Đã xảy ra lỗi khi xóa chuyên khoa');
                    }
                });
            },
            function () {
                // Nếu người dùng hủy xóa
                alertify.message('Đã hủy thao tác xóa');
            }
        );
    });
});

$('#btn-confirm-bulk-schedule').on('click', function () {
    // Thêm hiển thị loading
    $('#processLoading').removeClass('d-none');

    // Lấy thông tin ngày đã chọn
    const selectedDates = ['17/04/2025', '18/04/2025', '19/04/2025']; // Hoặc lấy từ form
    const timeSlots = [
        '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
        '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'
    ]; // Hoặc lấy từ form

    // Log để debug
    console.log("Creating bulk schedule with dates:", selectedDates);
    console.log("Time slots:", timeSlots);

    // Tạo lịch cho từng bác sĩ thay vì cố gắng tạo tất cả cùng lúc
    let doctorIds = [2, 3, 4, 5, 6, 7];
    let successCount = 0;
    let promises = [];

    doctorIds.forEach(doctorId => {
        selectedDates.forEach(date => {
            let promise = $.ajax({
                url: '/api/bulk-create-schedule',
                method: 'POST',
                data: {
                    doctorId: doctorId,
                    date: date,
                    timeArr: timeSlots
                },
                success: function (res) {
                    if (res.errCode === 0) {
                        successCount++;
                    } else {
                        console.error(`Failed for doctor ${doctorId}, date ${date}: ${res.errMessage}`);
                    }
                }
            });
            promises.push(promise);
        });
    });

    // Xử lý sau khi tất cả requests hoàn tất
    Promise.all(promises).then(() => {
        $('#processLoading').addClass('d-none');

        if (successCount > 0) {
            alertify.success(`Đã tạo lịch khám thành công cho ${successCount} bác sĩ`);
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            alertify.error('Không thể tạo lịch khám. Vui lòng thử lại.');
        }
    }).catch(error => {
        $('#processLoading').addClass('d-none');
        alertify.error('Đã xảy ra lỗi: ' + error.message);
    });
});

// Thêm xử lý cho nút OK trong modal xác nhận
$('#ok-btn').on('click', function () {
    // Hiện loading
    $('#processLoading').removeClass('d-none');

    // Gọi API tạo lịch hàng loạt
    $.ajax({
        url: '/api/bulk-create-schedule',
        method: 'POST',
        success: function (res) {
            // Ẩn loading
            $('#processLoading').addClass('d-none');

            if (res.errCode === 0) {
                // Thông báo thành công
                alertify.success(res.errMessage);

                // Tự động tải lại trang sau 1.5 giây
                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                // Thông báo lỗi
                alertify.error(res.errMessage || 'Đã có lỗi xảy ra khi tạo lịch khám');
            }
        },
        error: function (err) {
            // Ẩn loading
            $('#processLoading').addClass('d-none');

            // Thông báo lỗi
            alertify.error('Đã có lỗi xảy ra: ' + (err.responseJSON?.errMessage || 'Không thể kết nối với server'));
        }
    });
});

// Tìm và sửa đoạn xử lý nút OK
$(document).ready(function () {
    $('#ok-btn, .confirm-ok-btn, .btn-ok, #OK').on('click', function () {
        // Hiển thị loading
        $('#processLoading').removeClass('d-none');

        console.log("OK button clicked - Creating schedules for all doctors");

        // Lấy danh sách ngày (3 ngày tới)
        const today = new Date();
        const dates = [];

        for (let i = 0; i < 3; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);

            // Format: DD/MM/YYYY
            const day = String(nextDay.getDate()).padStart(2, '0');
            const month = String(nextDay.getMonth() + 1).padStart(2, '0');
            const year = nextDay.getFullYear();
            dates.push(`${day}/${month}/${year}`);
        }

        // Danh sách khung giờ mặc định
        const timeSlots = [
            '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
            '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'
        ];

        // Gọi API để tạo lịch hàng loạt
        $.ajax({
            url: '/api/bulk-create-schedule',
            method: 'POST',
            data: {
                dates: dates,
                timeSlots: timeSlots
            },
            success: function (response) {
                // Ẩn loading
                $('#processLoading').addClass('d-none');

                // Đóng modal nếu đang mở
                $('.modal').modal('hide');

                if (response.errCode === 0) {
                    alertify.success(response.errMessage || "Đã tạo lịch khám thành công cho tất cả bác sĩ!");

                    // Tải lại trang sau 1.5 giây
                    setTimeout(function () {
                        location.reload();
                    }, 1500);
                } else {
                    alertify.error(response.errMessage || "Đã xảy ra lỗi khi tạo lịch khám.");
                }
            },
            error: function (err) {
                // Ẩn loading
                $('#processLoading').addClass('d-none');
                $('.modal').modal('hide');

                alertify.error("Đã xảy ra lỗi: " + (err.responseJSON?.errMessage || "Không thể kết nối với server"));
            }
        });
    });
});

// Xử lý nút OK trong hộp thoại xác nhận
$(".modal-confirm .btn-primary").on("click", function () {
    // Hiển thị trạng thái đang xử lý
    $("#processLoading").removeClass("d-none");

    // Gọi API tạo lịch hàng loạt
    $.ajax({
        url: "/api/bulk-create-schedule",
        method: "POST",
        success: function (response) {
            // Ẩn trạng thái xử lý
            $("#processLoading").addClass("d-none");

            if (response.errCode === 0) {
                // Đóng modal
                $(".modal").modal("hide");

                // Hiển thị thông báo thành công
                alertify.success(response.errMessage);

                // Tải lại trang sau 1.5 giây
                setTimeout(function () {
                    window.location.reload();
                }, 1500);
            } else {
                // Hiển thị thông báo lỗi
                alertify.error(response.errMessage || "Đã xảy ra lỗi khi tạo lịch khám");
            }
        },
        error: function (xhr, status, error) {
            // Ẩn trạng thái xử lý
            $("#processLoading").addClass("d-none");

            // Hiển thị thông báo lỗi
            alertify.error("Đã xảy ra lỗi: " + error);
        }
    });
});

// Hàm hiển thị thông báo thành công với chi tiết
function showSuccessNotification(createdCount, errorCount) {
    let message = `Đã tạo ${createdCount} lịch khám thành công`;

    if (errorCount > 0) {
        message += `, ${errorCount} thất bại`;
    }

    // Tạo một div thông báo đẹp mắt hơn
    const notification = $(`
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Hoàn tất!</strong> ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `);

    // Thêm vào trang và tự động đóng sau 5 giây
    $("#notificationArea").html(notification);
    setTimeout(() => {
        notification.alert('close');
    }, 5000);
}

// Xóa tất cả handler hiện tại cho nút OK và thay bằng handler mới
$(document).ready(function () {
    // Xử lý nút OK trong modal xác nhận tạo lịch
    $(".modal-confirm .btn-primary, #ok-btn, #OK").on("click", function () {
        // Hiển thị thông báo đang xử lý
        $("#processLoading").removeClass("d-none");

        // Hiển thị modal thông báo (nếu chưa hiển thị)
        if ($('#loadingModal').length) {
            $('#loadingModal').modal('show');
        }

        // Đóng modal xác nhận nếu đang mở
        $('.modal-confirm').modal('hide');

        console.log("Sending bulk schedule creation request");

        // Gọi API để tạo lịch
        $.ajax({
            url: "/api/bulk-create-schedule",
            method: "POST",
            timeout: 60000, // Tăng timeout lên 60s vì quá trình có thể mất thời gian
            success: function (response) {
                // Ẩn thông báo đang xử lý
                $("#processLoading").addClass("d-none");

                // Đóng modal loading nếu đang mở
                if ($('#loadingModal').length) {
                    $('#loadingModal').modal('hide');
                }

                if (response.errCode === 0) {
                    const { successCount, failCount, doctorCount } = response.data;

                    // Hiển thị thông báo thành công
                    alertify.success(`Đã tạo ${successCount} lịch khám thành công cho ${doctorCount} bác sĩ`);

                    // Tải lại trang sau 2 giây
                    setTimeout(function () {
                        location.reload();
                    }, 2000);
                } else {
                    // Hiển thị thông báo lỗi
                    alertify.error(response.errMessage || "Đã xảy ra lỗi khi tạo lịch khám");
                }
            },
            error: function (xhr, status, error) {
                // Ẩn thông báo đang xử lý
                $("#processLoading").addClass("d-none");

                // Đóng modal loading nếu đang mở
                if ($('#loadingModal').length) {
                    $('#loadingModal').modal('hide');
                }

                // Hiển thị thông báo lỗi
                alertify.error("Lỗi khi tạo lịch: " + (xhr.responseJSON?.errMessage || error || "Không thể kết nối đến server"));
                console.error("Error details:", xhr.responseText);
            }
        });
    });
});

// Thêm vào phần xử lý cho nút tạo lịch hàng loạt
$(document).ready(function () {
    // Xử lý nút OK trong modal xác nhận tạo lịch
    $("#ok-btn, .modal-confirm .btn-primary, #OK").off('click').on('click', function () {
        // Ẩn modal xác nhận nếu đang mở
        $(".modal-confirm, .confirm-modal").modal('hide');

        // Hiển thị modal loading
        $('#loadingModal').modal('show');

        // Gọi API tạo lịch hàng loạt
        $.ajax({
            url: "/api/bulk-create-schedule",
            method: "POST",
            timeout: 60000, // Tăng timeout lên 60s vì quá trình có thể mất thời gian
            success: function (response) {
                // Ẩn modal loading
                $('#loadingModal').modal('hide');

                if (response.errCode === 0) {
                    const { successCount, failCount, doctorCount } = response.data || { successCount: 0, failCount: 0, doctorCount: 0 };

                    // Hiển thị thông báo thành công
                    alertify.success(`Đã tạo ${successCount} lịch khám thành công cho các bác sĩ`);

                    // Tải lại trang sau 2 giây
                    setTimeout(function () {
                        location.reload();
                    }, 2000);
                } else {
                    // Hiển thị thông báo lỗi
                    alertify.error(response.errMessage || "Đã xảy ra lỗi khi tạo lịch khám");
                }
            },
            error: function (xhr, status, error) {
                // Ẩn modal loading
                $('#loadingModal').modal('hide');

                // Hiển thị thông báo lỗi
                alertify.error("Lỗi khi tạo lịch: " + (xhr.responseJSON?.errMessage || error || "Không thể kết nối đến server"));
                console.error("Error details:", xhr.responseText);
            }
        });
    });
});

// Đây là handler nút OK duy nhất cần giữ lại
$(document).ready(function () {
    $("#ok-btn, .modal-confirm .btn-primary, #OK").off('click').on('click', function () {
        // Hiển thị loading
        $("#processLoading").removeClass("d-none");

        console.log("Creating schedules for all doctors");

        // Gọi API tạo lịch hàng loạt
        $.ajax({
            url: "/api/bulk-create-schedule",
            method: "POST",
            timeout: 60000, // Tăng timeout lên 60s
            success: function (response) {
                // Ẩn loading
                $("#processLoading").addClass("d-none");

                // Đóng tất cả modal nếu đang mở
                $(".modal").modal("hide");

                if (response.errCode === 0) {
                    const { successCount, failCount, doctorCount } = response.data ||
                        { successCount: 0, failCount: 0, doctorCount: 0 };

                    // Hiển thị thông báo thành công
                    alertify.success(`Đã tạo ${successCount} lịch khám thành công cho ${doctorCount} bác sĩ`);

                    // Tải lại trang sau 2 giây
                    setTimeout(function () {
                        location.reload();
                    }, 2000);
                } else {
                    // Hiển thị thông báo lỗi
                    alertify.error(response.errMessage || "Đã xảy ra lỗi khi tạo lịch khám");
                }
            },
            error: function (xhr, status, error) {
                // Ẩn loading
                $("#processLoading").addClass("d-none");

                // Hiển thị thông báo lỗi
                alertify.error("Lỗi khi tạo lịch: " + (xhr.responseJSON?.errMessage || error));
            }
        });
    });
});

// Thêm ở cuối file admin.js
$(document).ready(function () {
    // Kiểm tra nếu đang ở trang danh sách lịch khám
    if ($("#scheduleTable").length) {
        // Gọi API để lấy danh sách lịch khám khi trang được tải
        loadScheduleList();

        // Xử lý khi bấm nút tìm kiếm
        $('#btnSearch').on('click', function () {
            loadScheduleList();
        });
    }
});

function loadScheduleList() {
    // Lấy giá trị filter
    const doctorId = $('#doctorId').val();
    const date = $('#dateSearch').val();

    // Hiển thị loading
    $('#scheduleTable tbody').html('<tr><td colspan="3" class="text-center">Đang tải dữ liệu...</td></tr>');

    // Gọi API với filter
    $.ajax({
        url: '/api/get-schedules',
        method: 'GET',
        data: {
            doctorId: doctorId,
            date: date
        },
        success: function (response) {
            if (response.errCode === 0) {
                displaySchedules(response.data);
            } else {
                $('#scheduleTable tbody').html('<tr><td colspan="3" class="text-center text-danger">Lỗi: ' + response.errMessage + '</td></tr>');
            }
        },
        error: function (xhr, status, error) {
            $('#scheduleTable tbody').html('<tr><td colspan="3" class="text-center text-danger">Lỗi kết nối server</td></tr>');
            console.error("Error:", error);
        }
    });
}

function displaySchedules(schedules) {
    // Xóa dữ liệu cũ
    $('#scheduleTable tbody').empty();

    if (schedules && schedules.length > 0) {
        // Hiển thị từng dòng lịch
        schedules.forEach(function (schedule) {
            // Đảm bảo truy cập đúng dữ liệu bác sĩ qua alias doctorData
            const doctorName = schedule.doctorData ?
                schedule.doctorData.lastName + ' ' + schedule.doctorData.firstName :
                'Không xác định';

            const row = `
                <tr>
                    <td>${doctorName}</td>
                    <td>${schedule.date}</td>
                    <td>${schedule.time}</td>
                </tr>
            `;
            $('#scheduleTable tbody').append(row);
        });
    } else {
        $('#scheduleTable tbody').html('<tr><td colspan="3" class="text-center">Không có lịch khám nào</td></tr>');
    }
}

// Thêm ngay sau đoạn code của bước 3
function loadDoctorsList() {
    $.ajax({
        url: '/api/get-doctors',
        method: 'GET',
        success: function (response) {
            if (response.errCode === 0 && response.data) {
                const doctors = response.data;
                let options = '<option value="">Tất cả bác sĩ</option>';

                doctors.forEach(function (doctor) {
                    options += `<option value="${doctor.id}">${doctor.lastName} ${doctor.firstName}</option>`;
                });

                $('#doctorId').html(options);
            }
        },
        error: function (err) {
            console.error("Error loading doctors:", err);
        }
    });
}

// Cập nhật hàm document.ready để gọi loadDoctorsList
$(document).ready(function () {
    // Code đã có...

    // Thêm dòng này
    if ($("#scheduleTable").length) {
        loadDoctorsList(); // Thêm dòng này để load danh sách bác sĩ
        loadScheduleList();

        // Xử lý khi bấm nút tìm kiếm
        $('#btnSearch').on('click', function () {
            loadScheduleList();
        });
    }
});

