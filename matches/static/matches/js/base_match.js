function LoadMatchOne(id = null) {
    if (id == null || id == undefined) {
        swal("Ошибка", "Матч не найден.", "error");
        return;
    }
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
                RenderMatchOne(res.data);
                RenderMatchEditModal(id, res.data);
            } else {id = null;}
        },
        error: function (res) {
            id = null;
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    }).then(() => {
        LoadProtocolMatch(id, true);
    });
}

function RenderMatchOne(data) {
    $('.card-body').find('.toggle-collapse[data-target="#collapse-team"]').text(data.team_name);
    $('.card-body').find('.toggle-collapse[data-target="#collapse-opponent"]').text(data.opponent_name);
    $('#openVideoMatch').toggleClass('btn-empty', !data.videos_count > 0);
}

function RenderProtocolInMatch(data, selectedRow = -1) {
    try {
        $('#team_players').DataTable().clear().destroy();
        $('#opponent_players').DataTable().clear().destroy();
    } catch(e) {}
    $('#team_players').find('tbody').html('');
    $('#opponent_players').find('tbody').html('');
    if (Array.isArray(data)) {
        let teamPlayersHtml = "";
        let opponentPlayersHtml = "";
        for (ind in data) {
            let elem = data[ind];
            let protocolStatusesElem = $('#protocolStatuses').parent().clone();
            $(protocolStatusesElem).find('select').attr('id', ''); $(protocolStatusesElem).find('select').attr('name', 'status');
            if ($(protocolStatusesElem).find(`option[value="${elem.p_status}"]`).length > 0) {
                $(protocolStatusesElem).find(`option[selected]`).removeAttr('selected');
                $(protocolStatusesElem).find(`option[value="${elem.p_status}"]`).attr('selected', "");
                if (elem.status_red == 1) {
                    $(protocolStatusesElem).find('select').css('color', 'red');
                }
            }
            protocolStatusesElem = $(protocolStatusesElem).html();
            let rowClasses = "";
            if (elem.border_red == 1) {rowClasses += "border-red-bottom ";}
            if (elem.border_black == 1) {rowClasses += "border-black-bottom ";}
            let tmpHtml = `
                <tr class="protocol-row ${rowClasses}" data-id="${elem.id}">
                    <td>
                        ${protocolStatusesElem}
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="p_num" type="text" value="${elem.p_num ? elem.p_num : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <div class="row mx-0 justify-content-between">
                            <div class="col-10 px-0 text-left">
                                ${elem.player_name}
                            </div>
                            <div class="col-2 px-0 text-right">
                                ${elem.is_goalkeeper ? `<span title="Вратарь"> [G.] </span>` : ''}
                                ${elem.is_captain ? `<span title="Капитан"> [К] </span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="minute_from" type="text" value="${elem.minute_from ? elem.minute_from : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="minute_to" type="text" value="${elem.minute_to ? elem.minute_to : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="goal" type="text" value="${elem.goal ? elem.goal : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="penalty" type="text" value="${elem.penalty ? elem.penalty : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="p_pass" type="text" value="${elem.p_pass ? elem.p_pass : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="yellow_card" type="text" value="${elem.yellow_card ? elem.yellow_card : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="red_card" type="text" value="${elem.red_card ? elem.red_card : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <input class="form-control form-control-sm" name="estimation" type="text" value="${elem.estimation ? elem.estimation : ''}" placeholder="" autocomplete="off">
                    </td>
                    <td>
                        <input class="form-control form-control-sm" type="checkbox" name="dislike" ${elem.dislike ? "checked": ""}>
                    </td>
                    <td>
                        <input class="form-control form-control-sm" type="checkbox" name="like" ${elem.like ? "checked": ""}>
                    </td>
                    <td class="text-center">
                    <button type="button" class="btn btn-sm btn-secondary video-player-protocol ${elem.videos_count > 0 ? '' : 'btn-empty'}">
                        Видео
                    </button>
                    </td>
                </tr>
            `;
            if (!elem.is_opponent) {
                teamPlayersHtml += tmpHtml;
            } else {
                opponentPlayersHtml += tmpHtml;
            }
        }
        $('#team_players').find('tbody').html(teamPlayersHtml);
        $('#opponent_players').find('tbody').html(opponentPlayersHtml);
        let isView = $('#saveMatchAll').hasClass('d-none');
        $('.row.players-content').find('.form-control').prop('disabled', isView);
        $('.card-body').find('.collapse-block').addClass('d-block');
        let tableOptions = {
            language: {
                url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
            },
            dom: "<'row'<'col-sm-12 col-md '><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'f>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>",
            serverSide: false,
            processing: false,
            paging: false,
            ordering: false,
            searching: false,
            select: false,
            drawCallback: function( settings ) {
            },
            "columnDefs": [
                {"width": "20%", "targets": 0},
                {"width": "28%", "targets": 2},
                {"width": "5%", "targets": [1, 3, 4, 5, 6, 7, 8, 9, 10]},
                {"width": "2%", "targets": [11, 12]},
                {"className": "dt-vertical-center", "targets": "_all"}
            ]
        };
        $('#team_players').DataTable(tableOptions);
        $('#opponent_players').DataTable(tableOptions);
        $('.players-content').find(`tr.protocol-row[data-id="${selectedRow}"]`).addClass('selected');
        setTimeout(() => {
            $('.card-body').find('.collapse-block').removeClass('d-block');
        }, 500);
    }
}

function LoadPlayersInTeam(id) {
    $('#addPlayerInProtocolModal').find('.players-list-adding > ul').html('');
    try {
        id = parseInt(id);
    } catch(e) {}
    if (isNaN(id) || !Number.isInteger(id)) {return;}
    let data = {'get_players_json': 1, 'team_id': id};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/players/players_api",
        success: function (res) {
            if (res.success) {
                let htmlList = "";
                if (Array.isArray(res.data)) {
                    for (let i in res.data) {
                        let elem = res.data[i];
                        htmlList += `
                            <li class="list-group-item player-row py-1" data-id="${elem.id}">
                                <input type="checkbox" name="selected">
                                <span>${elem.surname} ${elem.name} ${elem.patronymic}</span>
                            </li>
                        `;
                    }
                }
                $('#addPlayerInProtocolModal').find('.players-list-adding > ul').html(htmlList);
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

function AddOrDeletePlayersInProtocol(dataArr, matchId, toAdd = true) {
    if (!Array.isArray(dataArr) || dataArr.length == 0) {
        return;
    }
    let cTeamId = $('#addPlayerInProtocolModal').find('#teamListForAdd').val();
    let isOpponentTeam = $('.card-body').find('.toggle-collapse[data-target="#collapse-opponent"]').hasClass('active') ? 1 : 0;
    let data = {
        'add_players_protocol': toAdd ? 1 : 0,
        'delete_players_protocol': !toAdd ? 1 : 0,
        'data': JSON.stringify(dataArr),
        'match_id': matchId,
        'team_id': cTeamId,
        'is_opponent': isOpponentTeam
    };
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "matches_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Операция прошла успешно.", "success")
                .then((value) => {
                    $('.page-loader-wrapper').fadeIn();
                    window.location.reload();
                });
            } else {
                swal("Ошибка", "Возникла проблема при выполнении данной операции.", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Возникла проблема при выполнении данной операции.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ChangePlayersProtocolOrder(isToUp = true, id) {
    let visibleRows = $('.players-content').find('.protocol-row:visible');
    let fRow = $('.players-content').find('.protocol-row.selected:visible').first();
    let selectedRowId = $(fRow).attr('data-id');
    if (fRow.length > 0 && visibleRows.length > 1) {
        if (isToUp) {
            let prevElem = $(fRow).prev();
            if (prevElem.length > 0) {
                $(prevElem).before(fRow);
            } else {
                prevElem = $(visibleRows).last();
                $(prevElem).after(fRow);
            }
        } else {
            let nextElem = $(fRow).next();
            if (nextElem.length > 0) {
                $(nextElem).after(fRow);
            } else {
                nextElem = $(visibleRows).first();
                $(nextElem).before(fRow);
            }
        }
        let protocols = [];
        $('.players-content').find('.protocol-row:visible').each((ind, elem) => {
            protocols.push($(elem).attr('data-id'));
        });
        let data = {
            'edit_players_protocol_order': 1,
            'protocols': protocols
        };
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "matches_api",
            success: function (res) {
                if (res.success) {
                    LoadProtocolMatch(id, true, selectedRowId);
                } else {
                    $('.page-loader-wrapper').fadeOut();
                }
            },
            error: function (res) {
                $('.page-loader-wrapper').fadeOut();
                console.log(res);
            },
            complete: function (res) {
            }
        });
    }
}



$(function() {
    
    let searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('id')) {
        LoadMatchOne(searchParams.get('id'));
    } else {
        swal("Ошибка", "Матч не найден.", "error");
    }

    ToggleMatchEditFields(false);
    $('#editMatchModalOpen').on('click', (e) => {
        $('#matchEditModal').modal('show');
    });

    $('#editMatchAll').on('click', (e) => {
        ToggleMatchEditFields(true);
        ToggleMatchVideoFields(true);
        $('.players-load').removeClass('d-none');
        $(e.currentTarget).addClass('d-none');
        $('#saveMatchAll').removeClass('d-none');
        $('.row.players-content').find('.form-control').prop('disabled', false);
    });
    $('#saveMatchAll').on('click', (e) => {
        $('.page-loader-wrapper').fadeIn();
        window.location.reload();
    });

    $('.card-body').on('click', '.toggle-collapse', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('.card-body').find('.toggle-collapse').removeClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
        $('.card-body').find('.collapse-block').collapse('hide');
    });

    $('#teamListForAdd').val('');
    LoadPlayersInTeam('');
    $('#addPlayerInProtocolModal').on('hide.bs.modal', (e) => {
        $('#teamListForAdd').val('');
        LoadPlayersInTeam('');
    });
    $('#teamListForAdd').on('change', (e) => {
        let val = $(e.currentTarget).val();
        LoadPlayersInTeam(val);
    });
    $('#addPlayerInProtocolModal').on('click', '.player-row', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
        $(e.currentTarget).find('input[name="selected"]').prop('checked', !isActive);
    });
    $('#addPlayerInProtocolModal').on('click', 'button[name="at_all"]', (e) => {
        let players = [];
        $('#addPlayerInProtocolModal').find('.player-row').each((ind, elem) => {
            players.push($(elem).attr('data-id'));
        });
        AddOrDeletePlayersInProtocol(players, searchParams.get('id'));
    });
    $('#addPlayerInProtocolModal').on('click', 'button[name="at_selected"]', (e) => {
        let players = [];
        $('#addPlayerInProtocolModal').find('.player-row.active').each((ind, elem) => {
            players.push($(elem).attr('data-id'));
        });
        AddOrDeletePlayersInProtocol(players, searchParams.get('id'));
    });

    $('#deletePlayerInProtocolModal').on('click', 'button[name="at_all"]', (e) => {
        let protocols = [];
        $('.players-content').find('.protocol-row:visible').each((ind, elem) => {
            protocols.push($(elem).attr('data-id'));
        });
        AddOrDeletePlayersInProtocol(protocols, searchParams.get('id'), false);
    });
    $('#deletePlayerInProtocolModal').on('click', 'button[name="at_selected"]', (e) => {
        let protocols = [];
        $('.players-content').find('.protocol-row.selected:visible').each((ind, elem) => {
            protocols.push($(elem).attr('data-id'));
        });
        AddOrDeletePlayersInProtocol(protocols, searchParams.get('id'), false);
    });

    $('#upPlayerInProtocol').on('click', (e) => {
        ChangePlayersProtocolOrder(true, searchParams.get('id'));
    });
    $('#downPlayerInProtocol').on('click', (e) => {
        ChangePlayersProtocolOrder(false, searchParams.get('id'));
    });

    $('#setCaptainToPlayer').on('click', (e) => {
        let fRow = $('.players-content').find('.protocol-row.selected:visible').first();
        if (fRow.length > 0) {
            let protocolId = $(fRow).attr('data-id');
            let data = {
                'edit_players_protocol': 1,
                'protocol_id': protocolId,
                'key': "is_captain",
            };
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "matches_api",
                success: function (res) {
                    if (res.success) {
                        LoadProtocolMatch(searchParams.get('id'), true, protocolId);
                    }
                },
                error: function (res) {
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        } else {
            swal("Внимание!", "Выберите игрока из протокола.", "warning");
        }
    });
    $('#setGoalKeeperToPlayer').on('click', (e) => {
        let fRow = $('.players-content').find('.protocol-row.selected:visible').first();
        if (fRow.length > 0) {
            let protocolId = $(fRow).attr('data-id');
            let data = {
                'edit_players_protocol': 1,
                'protocol_id': protocolId,
                'key': "is_goalkeeper",
            };
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "matches_api",
                success: function (res) {
                    if (res.success) {
                        LoadProtocolMatch(searchParams.get('id'), true, protocolId);
                    }
                },
                error: function (res) {
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        } else {
            swal("Внимание!", "Выберите игрока из протокола.", "warning");
        }
    });

    $('#setBlackBorder').on('click', (e) => {
        let fRow = $('.players-content').find('.protocol-row.selected:visible').first();
        if (fRow.length > 0) {
            let protocolId = $(fRow).attr('data-id');
            let data = {
                'edit_players_protocol': 1,
                'protocol_id': protocolId,
                'key': "border_black",
            };
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "matches_api",
                success: function (res) {
                    if (res.success) {
                        LoadProtocolMatch(searchParams.get('id'), true, protocolId);
                    }
                },
                error: function (res) {
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        } else {
            swal("Внимание!", "Выберите игрока из протокола.", "warning");
        }
    });
    $('#setRedBorder').on('click', (e) => {
        let fRow = $('.players-content').find('.protocol-row.selected:visible').first();
        if (fRow.length > 0) {
            let protocolId = $(fRow).attr('data-id');
            let data = {
                'edit_players_protocol': 1,
                'protocol_id': protocolId,
                'key': "border_red",
            };
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "matches_api",
                success: function (res) {
                    if (res.success) {
                        LoadProtocolMatch(searchParams.get('id'), true, protocolId);
                    }
                },
                error: function (res) {
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        } else {
            swal("Внимание!", "Выберите игрока из протокола.", "warning");
        }
    });

    $('.protocol-players').on('change', '.form-control', (e) => {
        let protocolId = $(e.currentTarget).parent().parent().attr('data-id');
        let cKey = $(e.currentTarget).attr('name');
        if (cKey == "like" || cKey == "dislike") {
            $(e.currentTarget).val($(e.currentTarget).prop('checked') ? 1 : 0);
        }
        let data = {
            'edit_players_protocol': 1,
            'protocol_id': protocolId,
            'key': cKey,
            'value': $(e.currentTarget).val()
        };
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "matches_api",
            success: function (res) {
                if (res.success) {
                    for (let key in res.data) {
                        if (key == "p_status") {
                            LoadProtocolMatch(searchParams.get('id'), true);
                            break;
                        }
                        $(e.currentTarget).parent().parent().find(`.form-control[name="${key}"]`).val(res.data[key] ? res.data[key] : "");
                        if (key == "like" || key == "dislike") {
                            $(e.currentTarget).parent().parent().find(`.form-control[name="${key}"]`).prop('checked', res.data[key] == 1);
                        }
                    }
                }
            },
            error: function (res) {
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('.protocol-players').on('click', '.protocol-row', (e) => {
        if ($(e.target).hasClass('form-control')) {return;}
        let isSelected = $(e.currentTarget).hasClass('selected');
        $('.protocol-players').find('.protocol-row').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !isSelected);
    });

    // Video in match or in players protocol
    $('#openVideoMatch').on('click', (e) => {
        OpenMatchVideoModal("event", searchParams.get('id'));
    });
    $('.players-content').on('click', '.video-player-protocol', (e) => {
        let protocolId = $(e.currentTarget).parent().parent().attr('data-id');
        OpenMatchVideoModal("protocol", protocolId);
    });


    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

});
