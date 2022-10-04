$(document).ready(function () {
    let table = $('#table').DataTable({
        ajax: {
            url: '/admin/allUsers',
            dataSrc: ''
        },
        "scrollX": true,
        "pageLength": 25,
        language: {
            "decimal": "",
            "emptyTable": "Нет данных в таблице",
            "info": "Отображено от _START_ до _END_ из _TOTAL_ записей",
            "infoEmpty": "Отображено от 0 до 0 из 0 записей",
            "infoFiltered": "(filtered from _MAX_ total entries)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Показывать _MENU_ записей",
            "loadingRecords": "Загрузка...",
            "processing": "Обработка...",
            "search": "Поиск:",
            "zeroRecords": "Записей не найдено",
            "paginate": {
                "first": "Первая",
                "last": "Последняя",
                "next": "Следующая",
                "previous": "Предыдущая"
            },
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            }
        },

        columns: [
            {data: 'id'},
            {data: 'username'},
            {
                "mData": 0, //or address field
                "mRender": function (data, type, full) {
                    return full['surname'] + ' ' + full['name'];
                }

            },
            {data: 'entry_date'},
            {data: 'roles'},
        ],

        "columnDefs": [
            {
                targets: 3, render: function (data) {
                    return moment(data).format('DD.MM.YYYY');
                }
            },
        ]
    });

    $('#table').on('mouseover', 'tbody tr', function () {
        $(this).addClass('info');
    });
    $('#table').on('mouseout', 'tbody tr', function () {
        $(this).removeClass('info');
    });
    let userId;
    let username;
    let surname;
    let firstname;
    let patname;
    $('#table tbody').on('click', 'tr', function () {
        if ($(this).hasClass('success')) {
            $(this).removeClass('success')
            $("#editBtn").attr('disabled', 'disabled');
        } else {
            table.$('tr.success').removeClass('success');
            $(this).addClass('success');
            $("#editBtn").removeAttr('disabled');
            userId = table.$('tr.success').find('td')[0].textContent;
            username = table.$('tr.success').find('td')[1].textContent;
            surname = table.$('tr.success').find('td')[2].textContent.split(' ')[0];
            firstname = table.$('tr.success').find('td')[2].textContent.split(' ')[1];
            // patname = table.$('tr.success').find('td')[2].textContent.split(' ')[2];
        }
    });
    // add data to editform
    // $('#editBtn').on('click', function () {
    //     $('#userId2').val(userId);
    //     $('#username2').val(username);
    //     $('#surname2').val(surname);
    //     $('#firstname2').val(firstname);
    //     $('#patname2').val(patname);
    //     $('#post2').val(post);
    //     $('#birthDate2').val(birthDate);
    //     $('#phone2').val(phone);
    //     $('#identif2').val(identif);
    //     if (enabled == "1") {
    //         $('#block_check2').attr("checked", "checked");
    //     } else {
    //         $('#block_check2').removeAttr("checked");
    //     }
    // })


    // Password checker
    let errors = {
        error1: "пароли не совпадают",
        error2: "пароль должен быть не менее 8 символов",
        error3: "пароль должен содержать хотя бы одну букву в верхнем регистре",
        error4: "пароль должен содержать хотя бы одну цифру",
        error5: "пароль не может содержать пробелов"
    };
    $("#password, #passwordCheck").keyup(function () {
        checkPassword("");
    });
    $("#password2, #passwordCheck2").keyup(function () {
        checkPassword("2");
    });
    $('#newUser_modal, #newUser_modal2').on('hidden.bs.modal', function () {
        $("#password, #passwordCheck"
            // ", #password2, #passwordCheck2" +
            ).val("");
        checkPassword("");
        // checkPassword("2");
    })

    function checkPassword(n) {
        let password_1 = $("#password" + n).val();
        let password_2 = $("#passwordCheck" + n).val();
        errorDelete(n);
            switch(true){
                case (password_1 === "" || password_2 === ""): return; break;
                case (password_1 !== password_2): return errorRedPas(n, errors.error1); break;
                case (password_1.length < 8): return errorRedPas(n, errors.error2); break;
                case (password_1.search(/[A-ZА-Я]/) < 0): return errorRedPas(n, errors.error3); break;
                case (password_1.search(/[0-9]/) < 0): return errorRedPas(n, errors.error4); break;
                case (password_1.search(/\s/) !== -1): return errorRedPas(n, errors.error5); break;
            }
    }

    function errorRedPas(n, error) {
        $("#password" + n).css("background", "#ffcab2");
        $("#passwordCheck" + n).css("background", "#ffcab2");
        if (!$('div').is("#smallPas" + n)) {
            $("#formPassword1Check" + n).append($("<div id='smallPas" + n + "' class='col-sm-8 right'><small style='color: red;'>" + error + "</small></div>"));
        }
        $("#btnSave" + n).attr('disabled', 'disabled');
    }

    function errorDelete(n) {
        $("#password" + n).css("background", "none");
        $("#passwordCheck" + n).css("background", "none");
        $("#smallPas" + n).detach();
        $("#btnSave" + n).removeAttr('disabled');
    }

    $("#registration").click(function () {
        
    })

});