function LoadMatchEditModal(id) {
    let data = {'get_match': 1, 'id': id};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "matches_api",
        success: function (res) {
            if (res.success) {
                $('#matchEditModal').find('.modal-body').attr('data-id', id);
                for (key in res.data) {
                    $('#matchEditModal').find(`.form-control[name="${key}"]`).val(res.data[key]);
                }
                $('#matchEditModal').find('.form-control[name="opponent_name"]').prop('disabled', false);
                $('#matchEditModal').find('.form-control[name="opponent_team"]').prop('disabled', false);
                $('#matchEditModal').find('.add-title').toggleClass('d-none', true);
                $('#matchEditModal').find('.edit-title').toggleClass('d-none', false);
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderMatchEditModal(id = null, data = null) {
    $('#matchEditModal').find('.form-control').val('');
    let cTeamName = $('#select-team').find('option[selected=""]').text();
    $('#matchEditModal').find('.form-control[name="team_name"]').val(cTeamName);
    $('#matchEditModal').find('.form-control[name="m_type"]').val('0');
    $('#matchEditModal').find('.form-control[name="opponent_name"]').prop('disabled', false);
    $('#matchEditModal').find('.form-control[name="opponent_team"]').prop('disabled', false);
    $('#matchEditModal').find('.form-control[type="number"]').val('0');
    $('#matchEditModal').find('.add-title').toggleClass('d-none', false);
    $('#matchEditModal').find('.edit-title').toggleClass('d-none', true);

    $('#matchEditModal').find('.modal-body').attr('data-id', "");
    if (data == null) {
        LoadMatchEditModal(id);
    } else {
        $('#matchEditModal').find('.modal-body').attr('data-id', id);
        for (key in data) {
            $('#matchEditModal').find(`.form-control[name="${key}"]`).val(data[key]);
        }
        $('#matchEditModal').find('.form-control[name="opponent_name"]').prop('disabled', false);
        $('#matchEditModal').find('.form-control[name="opponent_team"]').prop('disabled', false);
        $('#matchEditModal').find('.add-title').toggleClass('d-none', true);
        $('#matchEditModal').find('.edit-title').toggleClass('d-none', false);
    }
    
}

function ToggleMatchEditFields(state = true) {
    $('#matchEditModal').find('.form-control').prop('disabled', !state);
}



$(function() {

    $('#matchEditModal').on('change', '.form-control[name="opponent_team"]', (e) => {
        let val = $(e.currentTarget).val();
        let teamName = $(e.currentTarget).find(`option[value="${val}"]`).text();
        $('#matchEditModal').find('.form-control[name="opponent_name"]').val(teamName);
    });
    $('#matchEditModal').on('keyup', '.form-control[name="opponent_name"]', (e) => {
        $('#matchEditModal').find('.form-control[name="opponent_team"]').val('');
    });
    $('#matchEditModal').on('click change', '.form-control', (e) => {
        $(e.currentTarget).removeClass('not-valid');
    });
    $('#matchEditModal').on('click', '.btn[name="save"]', (e) => {
        let dataToSend = {};
        let wasValidated = true;
        $('#matchEditModal').find('.form-control').removeClass('not-valid');
        $('#matchEditModal').find('.form-control').each((ind, elem) => {
            if ($(elem).attr('required') && $(elem).val() == "") {
                $(elem).addClass('not-valid');
                wasValidated = false;
            }
            if ($(elem).attr('type') == "number") {
                let tNumVal = parseInt($(elem).val());
                if (isNaN(tNumVal) || tNumVal < 0) {
                    $(elem).val('0');
                    $(elem).addClass('not-valid');
                    wasValidated = false;
                }
            }
            dataToSend[$(elem).attr('name')] = $(elem).val();
        });

        if (wasValidated) {
            let cId = $('#matchEditModal').find('.modal-body').attr('data-id');
            let data = {'edit_match': 1, 'data': JSON.stringify(dataToSend), 'id': cId};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "matches_api",
                success: function (res) {
                    if (res.success) {
                        swal("Готово", "Матч успешно создан / изменен.", "success")
                        .then((value) => {
                            $('.page-loader-wrapper').fadeIn();
                            window.location.reload();
                        });
                    } else {
                        swal("Ошибка", `При создании / изменении матча произошла ошибка (${res.err}).`, "error");
                    }
                },
                error: function (res) {
                    swal("Ошибка", "Матч не удалось создать / изменить.", "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }
    });

});
