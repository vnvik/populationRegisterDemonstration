$(document).ready(function () {
    $("#btnGetDataRN").click(function () {
        let identif = $("#identif").val();
        if (identif != null && identif != "") {
            $(".sectionHide").hide();
            $(".tableAnswer").empty();
            $(".tableAnswer").append($(' <table id="tableAnswer" class="table table-striped table-bordered" style="width:100%">\n' +
                '                </table>'))
            sign(identif);
        } else {
            alert("введите идентификатор");
        }

    })

    let signature;
    let sign = function (identif) {

        avcmx().connectionAsync(function (error, conn) {
            if (error !== undefined) {
                return error;
            } else {

                let text2 = "{\n" +
                    "  \"cover\": {\n" +
                    "    \"message_id\": \"4D7961DF-3057-4587-A498-5D995C733D80\",\n" +
                    "    \"message_type\": {\n" +
                    "      \"code\": \"-2\",\n" +
                    "      \"type\": 300\n" +
                    "    },\n" +
                    "    \"message_time\": \"2011-12-07T13:22:09.619+03:00\",\n" +
                    "    \"message_source\": {\n" +
                    "      \"code\": \"17120\",\n" +
                    "      \"type\": 80\n" +
                    "    },\n" +
                    "    \"agreement\": {\n" +
                    "      \"operator_info\": \"НКФО ЕРИП ул. Толстого,д. 6\",\n" +
                    "      \"target\": \"верификация персональных данных\",\n" +
                    "      \"rights\": [\n" +
                    "      201, \n" +
                    "      703, \n" +
                    "      208,\n" +
                    "      480,\n" +
                    "      481,\n" +
                    "      482,\n" +
                    "      490,\n" +
                    "      491,\n" +
                    "      527,\n" +
                    "      528,\n" +
                    "      252,\n" +
                    "      465,\n" +
                    "      466,\n" +
                    "      516,\n" +
                    "      517\n" +
                    "      ],\n" +
                    "      \"issue_date\": \"2019-12-07T13:22:09.619+03:00\",\n" +
                    "      \"expiry_date\": \"2023-12-07T13:22:09.619+03:00\",\n" +
                    "      \"assignee_persons\": [\n" +
                    "        \"инспектор Иванов Иван Иванович\",\n" +
                    "        \"зам. начальника отдела Петров Иван Петрович\"\n" +
                    "      ]\n" +
                    "    },\n" +
                    "    \"dataset\": [\n" +
                    "  7\n" +
                    "    ]\n" +
                    "  },\n" +
                    "  \"request\": {\n" +
                    "    \"person_request\": [\n" +
                    "      {\n" +
                    "        \"request_id\": \"реб1\",\n" +
                    "        \"identif_number\": \"4220466H095PB7\"\n" +
                    "      }\n" +
                    "    ]\n" +
                    "  }\n" +
                    "}\n";


                let text3 = "{\n" +
                    "  \"cover\": {\n" +
                    "    \"message_id\": \"4D7961DF-3057-4587-A498-5D995C733D80\",\n" +
                    "    \"message_type\": {\n" +
                    "      \"code\": \"-2\",\n" +
                    "      \"type\": 300\n" +
                    "    },\n" +
                    "    \"message_time\": \"2021-01-14T11:08:11.495Z\",\n" +
                    "    \"message_source\": {\n" +
                    "      \"code\": \"17120\",\n" +
                    "      \"type\": 80\n" +
                    "    },\n" +
                    "    \"agreement\": {\n" +
                    "      \"operator_info\": \"НКФО ЕРИП ул. Толстого,д. 6\",\n" +
                    "      \"target\": \"верификация персональных данных\",\n" +
                    // "      \"rights\": [\n" +
                    // "      201, \n" +
                    // "      703, \n" +
                    // "      208,\n" +
                    // "      480,\n" +
                    // "      481,\n" +
                    // "      482,\n" +
                    // "      490,\n" +
                    // "      491,\n" +
                    // "      527,\n" +
                    // "      528,\n" +
                    // "      252,\n" +
                    // "      465,\n" +
                    // "      466,\n" +
                    // "      516,\n" +
                    // "      517\n" +
                    // "      ],\n" +
                    "      \"issue_date\": \"2019-12-07T13:22:09.619+03:00\",\n" +
                    "      \"expiry_date\": \"2023-12-07T13:22:09.619+03:00\",\n" +
                    "      \"assignee_persons\": [\n" +
                    "      ]\n" +
                    "    },\n" +
                    "    \"dataset\": [\n" +
                    "  15\n" +
                    "    ]\n" +
                    "  },\n" +
                    "  \"request\": {\n" +
                    "    \"person_request\": [\n" +
                    "      {\n" +
                    "        \"request_id\": \"реб1\",\n" +
                    "        \"identif_number\": \"" + identif + "\" \n" +
                    "      }\n" +
                    "    ]\n" +
                    "  }\n" +
                    "}\n";

                let text4 = "Я, ТЕСТОВ СЕРГЕЙ ГЕННАДЬЕВИЧ, даю согласие в Ошмянский районный исполнительный комитет на получение сведений о моей регистрации по месту жительства (пребывания) из АИС «Регистрационный учет» Министерства внутренних дел посредством ОАИС. 20.01.2021 16:31:30."


                // var aq = conn.message(avcmx().blob().text(text3)).sign(AVCMF_ADD_SIGN_CERT).val().base64();
                conn.message(avcmx().blob().utf8text(text3)).signAsync(AVCMF_ADD_SIGN_CERT, function (errors, signm) {
                    if (errors !== undefined) {
                        return;
                    }
                    signature = signm.val().base64();
                    sendRequest(signature);
                })
            }
        });
    };

    function sendRequest(signature) {
        $.ajax({
            url: '/cloud/Response',
            type: 'POST',
            data: signature,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: false,
            success: function (data) {
                if (data.error && data.error == 1) {
                    alert("ошибка получения данных: " + data.message);
                    return;
                } else if (data.response.personal_data.length > 1) {
                    alert("ошибка полученных данных: найдено больше, чем 1 personal_data")
                } else {
                    let identif = data.response.personal_data[0].data.identif;
                    let surname = data.response.personal_data[0].data.last_name;
                    let name = data.response.personal_data[0].data.name;
                    let patname = data.response.personal_data[0].data.patronymic;
                    let finishData = [[identif, surname, name, patname]];
                    openDataAnswer(finishData);
                }
            }
        });
    }

    function openDataAnswer(dataAnswer) {
        let columns = [{title: "Идентификационный номер"}, {title: "Фамилия"}, {title: "Имя"}, {title: "Отчество"}];
        let tableAnswer = $('#tableAnswer').DataTable({
            data: dataAnswer,
            searching: false,
            paging: false,
            info: false,
            columns: columns,
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
            }
        });
        tableAnswer.columns.adjust().draw();
        $(".sectionHide").show();

    }

});