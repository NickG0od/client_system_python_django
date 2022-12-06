let cPlayerData = {};
function LoadPlayerOne(id = null) {
    let data = {'get_player': 1, 'id': id};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "/players/players_api",
            success: function (res) {
                if (res.success) {
                    cPlayerData = res.data;
                } else {
                    cPlayerData = {};
                }
            },
            error: function (res) {
                cPlayerData = {};
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
                RenderPlayerOne(cPlayerData);
            }
        });
}

function RenderPlayerOne(data = {}) {
    $('.cnt-center-block').find('.form-control').prop('disabled', true);
    $('.cnt-center-block').find('.form-control').removeClass('req-empty');

    $('.cnt-center-block').find('[name="surname"]').val(data.surname);
    $('.cnt-center-block').find('[name="name"]').val(data.name);
    $('.cnt-center-block').find('[name="patronymic"]').val(data.patronymic);
    $('.cnt-center-block').find('.img-photo').attr('src', data.photo ? data.photo : '#');

    $('.cnt-center-block').find('.edit-field').each((ind, elem) => {
        let key = $(elem).attr('name');
        if ($(elem).attr('type') != "hidden") {
            $(elem).val(data[key] ? data[key] : "");
        }
    });

    $('.cnt-center-block').find('[name="characteristics_stars"]').attr('data-val', '');
    $('.cnt-center-block').find('[name="characteristics_stars"]').find('span').removeClass('star-checked');
    $('.cnt-center-block').find('td.characteristic-compare').text('-');
    for (let ind in data.characteristics) {
        let characteristic = data.characteristics[ind];
        let fRow = $('.cnt-center-block').find(`.characteristic-elem[data-id="${characteristic.row_id}"]`);
        $(fRow).find('[name="characteristics_stars"]').attr('data-val', `${characteristic.value}`);
        $(fRow).find('[name="characteristics_stars"]').find(`span[data-num="${characteristic.value}"]`).addClass('star-checked');
        $(fRow).find('[name="characteristics_stars"]').find(`span[data-num="${characteristic.value}"]`).prevAll().addClass('star-checked');
        $(fRow).find('[name="characteristics_notes"]').val(characteristic.notes);
        $(fRow).find('.characteristic-compare').text(characteristic.diff);
    }
    for (let ind in data.questionnaires) {
        let questionnaire = data.questionnaires[ind];
        let fRow = $('.cnt-center-block').find(`.questionnaire-elem[data-id="${questionnaire.row_id}"]`);
        $(fRow).find('[name="questionnaires_notes"]').val(questionnaire.notes);
    }
}

function LoadCardSections() {
    let data = {'get_card_sections': 1};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/players/players_api",
        success: function (res) {
            if (res.success) {
                window.cardSettings = res.data;
            } else {
                window.cardSettings = {};
            }
        },
        error: function (res) {
            window.cardSettings = {};
            console.error(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            if (!window.cardSettings.mode || window.cardSettings.mode != "nfb") {
                $('#cardSectionsEdit').find('.btns-control').html('');
            }
            RenderCardSections(window.cardSettings);
        }
    });
}

function RenderCardSections(data) {
    let headers = [], rows = {};
    for (let i = 0; i < data.sections.length; i++) {
        let section = data.sections[i];
        if (section.parent == null) {
            headers.push(section);
        } else {
            if (rows[section.parent] && Array.isArray(rows[section.parent])) {
                rows[section.parent].push(section);
            } else {
                rows[section.parent] = [section];
            }
        }
    }
    let sections1 = "", sections2 = "";
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i];
        if (header.visible) {
            sections1 += `
                <div class="d-flex justify-content-center">
                    <button type="button" class="btn btn-primary btn-sm btn-block" data-id="${header.id}">
                        ${header.title}
                    </button>
                </div>
            `;
        }
        sections2 += `
            <tr class="section-elem parent" data-id="${header.id}" data-parent="${header.parent}" data-root="1">
                <td class=""></td>
                <td class="">
                    <input name="title" class="form-control form-control-sm" type="text" value="${header.title}" placeholder="" autocomplete="off" disabled="">
                </td>
                <td class="">
                    <input name="text_id" class="form-control form-control-sm" type="text" value="${header.text_id ? header.text_id : ""}" placeholder="" autocomplete="off" disabled="">
                </td>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input" name="visible" ${header.visible == true ? 'checked' : ''}>
                </td>
            </tr>
        `;
        if (rows[header.id] && Array.isArray(rows[header.id])) {
            for (let j = 0; j < rows[header.id].length; j++) {
                let row = rows[header.id][j];
                if (header.visible && row.visible) {
                    sections1 += `
                        <div class="d-flex justify-content-center">
                            <button type="button" class="btn btn-outline-primary btn-sm btn-block section-toggle" data-id="${row.id}" data-text-id="${row.text_id}">
                                ${row.title}
                            </button>
                        </div>
                    `;
                }
                sections2 += `
                    <tr class="section-elem" data-id="${row.id}" data-parent="${row.parent}" data-root="0">
                        <td class=""></td>
                        <td class="">
                            <input name="title" class="form-control form-control-sm w-75 ml-5" type="text" value="${row.title}" placeholder="" autocomplete="off" disabled="">
                        </td>
                        <td class="">
                            <input name="text_id" class="form-control form-control-sm" type="text" value="${row.text_id ? row.text_id : ""}" placeholder="" autocomplete="off" disabled="">
                        </td>
                        <td class="text-center">
                            <input type="checkbox" class="form-check-input" name="visible" ${row.visible == true ? 'checked' : ''}>
                        </td>
                    </tr>
                `;
            }
        }
    }
    $('.card-sections').html(sections1);
    $('#cardSectionsEdit').find('.sections-body').html(sections2);

    // Controlling of center content
    $('.cnt-center-block').find('.center-content').fadeOut(0);
    $('.card-sections').find('.section-toggle').removeClass('selected');
    $('.cnt-center-block').find('.center-content[data-id="card"]').fadeIn(0);
    $('.card-sections').find('.section-toggle[data-text-id="card"]').addClass('selected');
}

function ToggleFolderOrder(dir) {
    let activeElem = $('#cardSectionsEdit').find(`.section-elem.selected`);
    if (activeElem.length > 0) {
        let cID = $(activeElem).attr('data-id');
        let cParentID = $(activeElem).attr('data-parent');
        let isRoot = $(activeElem).attr('data-root');
        if (isRoot == '1') {
            let elems = $('#cardSectionsEdit').find(`.section-elem[data-root="1"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            let children = $('#cardSectionsEdit').find(`.section-elem[data-root="0"]`);
            $('#cardSectionsEdit').find(`.section-elem[data-root="0"]`).remove();
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
            for (let i = children.length - 1; i >= 0; i--) {
                let elem = children[i];
                let parentId = $(elem).attr('data-parent');
                $('#cardSectionsEdit').find(`.section-elem[data-id="${parentId}"]`).after(elem);
            }
        } else {
            let elems = $('#cardSectionsEdit').find(`.section-elem[data-parent="${cParentID}"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
        }
    }
}

function LoadPlayerCharacteristics(nfb_characteristics = false) {
    let data = {'get_characteristics_rows': 1, 'nfb': nfb_characteristics == true ? 1 : 0};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/players/players_api",
        success: function (res) {
            if (res.success) {
                window.characteristicsRows = res.data;
            } else {
                window.characteristicsRows = {};
            }
        },
        error: function (res) {
            window.characteristicsRows = {};
            console.error(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            if (!window.characteristicsRows.mode || window.characteristicsRows.mode != "nfb") {
                if (nfb_characteristics) {
                    $('#characteristicsRowsEdit').find('.btns-control').html('');
                    $('#characteristicsRowsEdit').find('[name="save"]').addClass('d-none');
                } else {
                    $('#characteristicsRowsEdit').find('.btns-control').html(`
                        <span class="badge badge-success characteristics-add" title="Добавить элемент">
                            <i class="fa fa-plus" aria-hidden="true"></i>
                        </span>
                        <span class="badge badge-secondary characteristics-edit" title="Изменить элемент">
                            <i class="fa fa-pencil" aria-hidden="true"></i>
                        </span>
                        <span class="badge badge-danger characteristics-delete" title="Удалить элемент">
                            <i class="fa fa-trash-o" aria-hidden="true"></i>
                        </span>
                        <span class="badge badge-info characteristics-up" title="Move up">
                            <i class="fa fa-arrow-up" aria-hidden="true"></i>
                        </span>
                        <span class="badge badge-info characteristics-down" title="Move down">
                            <i class="fa fa-arrow-down" aria-hidden="true"></i>
                        </span>
                    `);
                    $('#characteristicsRowsEdit').find('[name="save"]').removeClass('d-none');
                }
            }
            $('#characteristicsRowsEdit').find('[name="copy"]').toggleClass('d-none', !nfb_characteristics);
            $('#characteristicsRowsEdit').find('[name="save"]').attr('data-nfb', nfb_characteristics ? '1' : '0');
            $('#characteristicsRowsEdit').find('.characteristics-user').toggleClass('badge-pill', !nfb_characteristics);
            $('#characteristicsRowsEdit').find('.characteristics-nfb').toggleClass('badge-pill', nfb_characteristics);
            RenderCharacteristicsRows(window.characteristicsRows, nfb_characteristics);
        }
    });
}

function RenderCharacteristicsRows(data, nfb_characteristics) {
    let headers = [], rows = {};
    for (let i = 0; i < data.characteristics.length; i++) {
        let characteristic = data.characteristics[i];
        if (characteristic.parent == null) {
            headers.push(characteristic);
        } else {
            if (rows[characteristic.parent] && Array.isArray(rows[characteristic.parent])) {
                rows[characteristic.parent].push(characteristic);
            } else {
                rows[characteristic.parent] = [characteristic];
            }
        }
    }
    let characteristics1 = ""; let characteristics2 = "";
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i];
        characteristics1 += `
            <tr class="characteristic-elem parent" data-id="${header.id}" data-parent="${header.parent}" data-root="1">
                <td class=""></td>
                <td class="">
                    <input name="title" class="form-control form-control-sm" type="text" value="${header.title}" placeholder="" autocomplete="off" disabled="">
                </td>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input" name="visible" ${header.visible == true ? 'checked' : ''}>
                </td>
            </tr>
        `;
        characteristics2 += `
            <tr class="characteristic-elem parent" data-id="${header.id}" data-parent="${header.parent}" data-root="1">
                <td class="font-weight-bold">${header.title}</td>
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>
            </tr>
        `;
        if (rows[header.id] && Array.isArray(rows[header.id])) {
            for (let j = 0; j < rows[header.id].length; j++) {
                let row = rows[header.id][j];
                characteristics1 += `
                    <tr class="characteristic-elem" data-id="${row.id}" data-parent="${row.parent}" data-root="0">
                        <td class=""></td>
                        <td class="">
                            <input name="title" class="form-control form-control-sm w-75 ml-5" type="text" value="${row.title}" placeholder="" autocomplete="off" disabled="">
                        </td>
                        <td class="text-center">
                            <input type="checkbox" class="form-check-input" name="visible" ${row.visible == true ? 'checked' : ''}>
                        </td>
                    </tr>
                `;
                characteristics2 += `
                    <tr class="characteristic-elem" data-id="${row.id}" data-parent="${row.parent}" data-root="0">
                        <td class="">${row.title}</td>
                        <td class="characteristic-mark text-center">
                            <input name="characteristics_id" class="form-control form-control-sm edit-field" type="hidden" value="${row.id}" placeholder="" autocomplete="off" disabled="">
                            <div class="edit-field disabled" name="characteristics_stars" data-val="">
                                <span class="fa fa-star star-select" data-num="1"></span>
                                <span class="fa fa-star star-select" data-num="2"></span>
                                <span class="fa fa-star star-select" data-num="3"></span>
                                <span class="fa fa-star star-select" data-num="4"></span>
                            </div>
                        </td>
                        <td class="characteristic-compare text-center">-</td>
                        <td class="text-center">
                            <input name="characteristics_notes" class="form-control form-control-sm edit-field" type="text" value="" placeholder="" autocomplete="off" disabled="">
                        </td>
                    </tr>
                `;
            }
        }
    }
    $('#characteristicsRowsEdit').find('.characteristics-body').html(characteristics1);
    if (!nfb_characteristics) {
        $('#playerCharacteristicsTable').find('tbody').html(characteristics2);
    }
}

function ToggleCharacteristicsRowsOrder(dir) {
    let activeElem = $('#characteristicsRowsEdit').find(`.characteristic-elem.selected`);
    if (activeElem.length > 0) {
        let cID = $(activeElem).attr('data-id');
        let cParentID = $(activeElem).attr('data-parent');
        let isRoot = $(activeElem).attr('data-root');
        if (isRoot == '1') {
            let elems = $('#characteristicsRowsEdit').find(`.characteristic-elem[data-root="1"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            let children = $('#characteristicsRowsEdit').find(`.characteristic-elem[data-root="0"]`);
            $('#characteristicsRowsEdit').find(`.characteristic-elem[data-root="0"]`).remove();
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
            for (let i = children.length - 1; i >= 0; i--) {
                let elem = children[i];
                let parentId = $(elem).attr('data-parent');
                $('#characteristicsRowsEdit').find(`.characteristic-elem[data-id="${parentId}"]`).after(elem);
            }
        } else {
            let elems = $('#characteristicsRowsEdit').find(`.characteristic-elem[data-parent="${cParentID}"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
        }
    }
}

function LoadPlayerQuestionnaires() {
    let data = {'get_questionnaires_rows': 1};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/players/players_api",
        success: function (res) {
            if (res.success) {
                window.questionnairesRows = res.data;
            } else {
                window.questionnairesRows = {};
            }
        },
        error: function (res) {
            window.questionnairesRows = {};
            console.error(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            RenderQuestionnairesRows(window.questionnairesRows);
        }
    });
}

function RenderQuestionnairesRows(data) {
    let headers = [], rows = {};
    for (let i = 0; i < data.questionnaires.length; i++) {
        let questionnaire = data.questionnaires[i];
        if (questionnaire.parent == null) {
            headers.push(questionnaire);
        } else {
            if (rows[questionnaire.parent] && Array.isArray(rows[questionnaire.parent])) {
                rows[questionnaire.parent].push(questionnaire);
            } else {
                rows[questionnaire.parent] = [questionnaire];
            }
        }
    }
    let questionnaires1 = ""; let questionnaires2 = "";
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i];
        questionnaires1 += `
            <tr class="questionnaire-elem parent" data-id="${header.id}" data-parent="${header.parent}" data-root="1">
                <td class=""></td>
                <td class="">
                    <input name="title" class="form-control form-control-sm" type="text" value="${header.title}" placeholder="" autocomplete="off" disabled="">
                </td>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input" name="visible" ${header.visible == true ? 'checked' : ''}>
                </td>
            </tr>
        `;
        questionnaires2 += `
            <tr class="questionnaire-elem parent" data-id="${header.id}" data-parent="${header.parent}" data-root="1">
                <td class="">
                    ${header.title}
                    <input name="questionnaires_ids" class="form-control form-control-sm edit-field" type="hidden" value="${header.id}" placeholder="" autocomplete="off" disabled="">
                </td>
                <td class="">
                    <input name="questionnaires_notes" class="form-control form-control-sm edit-field" type="text" value="" placeholder="" autocomplete="off" disabled="">
                </td>
            </tr>
        `;
        if (rows[header.id] && Array.isArray(rows[header.id])) {
            for (let j = 0; j < rows[header.id].length; j++) {
                let row = rows[header.id][j];
                questionnaires1 += `
                    <tr class="questionnaire-elem" data-id="${row.id}" data-parent="${row.parent}" data-root="0">
                        <td class=""></td>
                        <td class="">
                            <input name="title" class="form-control form-control-sm w-75 ml-5" type="text" value="${row.title}" placeholder="" autocomplete="off" disabled="">
                        </td>
                        <td class="text-center">
                            <input type="checkbox" class="form-check-input" name="visible" ${row.visible == true ? 'checked' : ''}>
                        </td>
                    </tr>
                `;
                questionnaires2 += `
                    <tr class="questionnaire-elem" data-id="${row.id}" data-parent="${row.parent}" data-root="0">
                        <td class="">
                            ${row.title}
                            <input name="questionnaires_ids" class="form-control form-control-sm edit-field" type="hidden" value="${row.id}" placeholder="" autocomplete="off" disabled="">
                        </td>
                        <td class="">
                            <input name="questionnaires_notes" class="form-control form-control-sm edit-field" type="text" value="" placeholder="" autocomplete="off" disabled="">
                        </td>
                    </tr>
                `;
            }
        }
    }
    $('#questionnaireRowsEdit').find('.questionnaires-body').html(questionnaires1);
    $('#playerQuestionnaireTable').find('tbody').html(questionnaires2);
}

function ToggleQuestionnairesRowsOrder(dir) {
    let activeElem = $('#questionnaireRowsEdit').find(`.questionnaire-elem.selected`);
    if (activeElem.length > 0) {
        let cID = $(activeElem).attr('data-id');
        let cParentID = $(activeElem).attr('data-parent');
        let isRoot = $(activeElem).attr('data-root');
        if (isRoot == '1') {
            let elems = $('#questionnaireRowsEdit').find(`.questionnaire-elem[data-root="1"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            let children = $('#questionnaireRowsEdit').find(`.questionnaire-elem[data-root="0"]`);
            $('#questionnaireRowsEdit').find(`.questionnaire-elem[data-root="0"]`).remove();
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
            for (let i = children.length - 1; i >= 0; i--) {
                let elem = children[i];
                let parentId = $(elem).attr('data-parent');
                $('#questionnaireRowsEdit').find(`.questionnaire-elem[data-id="${parentId}"]`).after(elem);
            }
        } else {
            let elems = $('#questionnaireRowsEdit').find(`.questionnaire-elem[data-parent="${cParentID}"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
        }
    }
}



$(function() {


    $('table#players').on('click', '.player-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('table#players').find('.player-row').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        LoadPlayerOne(cId);
    });


    // Change Team
    let cTeam = $('#select-team').find('option[selected=""]').text();
    $('#currentTeam').text(cTeam);
    let prevTeamVal = $('#select-team').find('option[selected=""]').prev().attr('value');
    let isPrevTeam = prevTeamVal && prevTeamVal != "" ? true : false;
    let nextTeamVal = $('#select-team').find('option[selected=""]').next().attr('value');
    let isNextTeam = nextTeamVal && nextTeamVal != "" ? true : false;
    $('#prevTeam').prop('disabled', !isPrevTeam);
    $('#nextTeam').prop('disabled', !isNextTeam);
    $('#prevTeam').on('click', (e) => {
        let prevTeamVal = $('#select-team').find('option[selected=""]').prev().attr('value');
        let isPrevTeam = prevTeamVal && prevTeamVal != "" ? true : false;
        if (isPrevTeam) {
            window.history.replaceState({}, document.title, "/players/player");
            $('#select-team').val(prevTeamVal);
            $('#select-team').change();
        }
    });
    $('#nextTeam').on('click', (e) => {
        let nextTeamVal = $('#select-team').find('option[selected=""]').next().attr('value');
        let isNextTeam = nextTeamVal && nextTeamVal != "" ? true : false;
        if (isNextTeam) {
            window.history.replaceState({}, document.title, "/players/player");
            $('#select-team').val(nextTeamVal);
            $('#select-team').change();
        }
    });


    $('.cnt-center-block').on('click', '.img-photo', (e) => {
        if (window.editingMode == true) {
            let tempClone = $(e.currentTarget).clone();
            $('#showImgPhoto').find('.photo-block > div').html(tempClone);
            $('#showImgPhoto').modal('show');
        }
    });
    $('#showImgPhoto').on('change', '#fileImgPhoto', (e) => {
        if ($(e.currentTarget)[0].files[0].size > 5097152) {
            swal("Внимание", "Файл превыщает допустимый размер (> 5Mb).", "info");
            $(e.currentTarget).val('');
            return;
        }
        if ($(e.currentTarget)[0].files && $(e.currentTarget)[0].files[0]) {
            let reader = new FileReader();
            reader.onload = (e2) => {
              $('#showImgPhoto').find('.img-photo').attr('src', e2.target.result);
            };
            reader.readAsDataURL($(e.currentTarget)[0].files[0]);
        }
    });


    window.editingMode = false;
    RenderPlayerOne();
    const urlParams = new URLSearchParams(window.location.search);
    let pId = urlParams.get('id');
    if (pId) {
        $('table#players').find(`.player-row[data-id="${pId}"]`).click();
    }

    // Add player
    $('#addPlayer').on('click', (e) => {
        $('.b-add-off').addClass('d-none');
        $('.b-add-on').removeClass('d-none');
        $('table#players').find('.player-row').removeClass('selected');
        RenderPlayerOne();
        $('.cnt-center-block').find('.edit-field').prop('disabled', false);
        $('.cnt-center-block').find('.edit-field').removeClass('disabled');
        window.editingMode = true;
        $('#showImgPhoto').find('#fileImgPhoto').val('');
    });

    // Edit player
    $('#editPlayer').on('click', (e) => {
        if ($('table#players').find('.player-row.selected').length == 0) {return;}
        $('.b-edit-off').addClass('d-none');
        $('.b-edit-on').removeClass('d-none');
        $('.cnt-center-block').find('.edit-field').prop('disabled', false);
        $('.cnt-center-block').find('.edit-field').removeClass('disabled');
        window.editingMode = true;
        $('#showImgPhoto').find('#fileImgPhoto').val('');
    });

    // Cancel editing or adding
    $('#cancelPlayer').on('click', (e) => {
        $('.b-add-on').addClass('d-none');
        $('.b-edit-on').addClass('d-none');
        $('.b-edit-off').removeClass('d-none');
        let selectedRowId = $('table#players').find('.player-row.selected').attr('data-id');
        if (selectedRowId) {LoadPlayerOne(selectedRowId);}
        else {RenderPlayerOne();}
        window.editingMode = false;
    });

    // Save Player
    $('#savePlayer').on('click', (e) => {
        let selectedRowId = $('table#players').find('.player-row.selected').attr('data-id');
        let dataToSend = new FormData();
        dataToSend.append('edit_player', 1);
        dataToSend.append('id', selectedRowId);
        let requiredErr = false;
        $('.cnt-center-block').find('.edit-field').each((ind, elem) => {
            if ($(elem).attr('required') && (!$(elem).val() || $(elem).val() == "")) {
                requiredErr = true;
                $(elem).addClass('req-empty');
            }
            if (!$(elem).hasClass('d-none') || true) {
                let name = $(elem).attr('name');
                let dataVal = $(elem).attr('data-val');
                if (typeof dataVal !== 'undefined' && dataVal !== false) {
                    dataToSend.append(`data[${name}]`, dataVal);
                } else {
                    dataToSend.append(`data[${name}]`, $(elem).val());
                }
            }
        });
        if ($('#showImgPhoto').find('#fileImgPhoto')[0].files[0]) {
            dataToSend.append('filePhoto', $('#showImgPhoto').find('#fileImgPhoto')[0].files[0]);
        }
        if (requiredErr) {
            swal("Внимание", "Не все обязательные поля заполнены.", "info");
            return;
        }
        $('.page-loader-wrapper').fadeIn();
        
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            processData: false,
            contentType: false,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Игрок успешно создан / изменён.", "success")
                    .then((value) => {
                        $('.page-loader-wrapper').fadeIn();
                        window.location.reload();
                    });
                } else {
                    swal("Ошибка", `При создании / изменении игрока произошла ошибка (${res.err}).`, "error");
                }
            },
            error: function (res) {
                swal("Ошибка", "Игрока не удалось создать / изменить.", "error");
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('.cnt-center-block').on('click', '.edit-field', (e) => {
        $(e.currentTarget).removeClass('req-empty');
    });
    $('.cnt-center-block').on('change', '.edit-field', (e) => {
        let cVal = $(e.currentTarget).val();
        if ($(e.currentTarget).attr('required')) {
            $(e.currentTarget).toggleClass('req-empty', !(cVal && cVal != ""));
        }
    });

    // Delete Player
    $('#deletePlayer').on('click', (e) => {
        swal({
            title: "Вы точно хотите удалить игрока?",
            text: "После удаления данного игрока невозможно будет восстановить!",
            icon: "warning",
            buttons: ["Отмена", "Подтвердить"],
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                let selectedRowId = $('table#players').find('.player-row.selected').attr('data-id');
                let data = {'delete_player': 1, 'id': selectedRowId};
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "players_api",
                    success: function (res) {
                        if (res.success) {
                            swal("Готово", "Игрок успешно удалён.", "success")
                            .then((value) => {
                                $('.page-loader-wrapper').fadeIn();
                                window.location.reload();
                            });
                        }
                    },
                    error: function (res) {
                        swal("Ошибка", "Игрока удалить не удалось.", "error");
                        console.error(res);
                    },
                    complete: function (res) {
                        $('.page-loader-wrapper').fadeOut();
                    }
                });
            }
        });
    });

    $('#exitCard').on('click', (e) => {
        window.location.href = "/players";
    });


    // Section Settings
    LoadCardSections();
    $('#cardSettings').on('click', (e) => {
        $('#cardSectionsEdit').modal('show');
    });

    // Edit sections
    $('#cardSectionsEdit').on('click', '.section-elem', (e) => {
        let wasActive = $(e.currentTarget).hasClass('selected');
        $('#cardSectionsEdit').find('.section-elem').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasActive);
    });
    $('#cardSectionsEdit').on('click', '.section-up', (e) => {
        ToggleFolderOrder("up");
    });
    $('#cardSectionsEdit').on('click', '.section-down', (e) => {
        ToggleFolderOrder("down");
    });
    $('#cardSectionsEdit').on('click', '.section-edit', (e) => {
        $('#cardSectionsEdit').find('input.form-control ').prop('disabled', false);
    });
    $('#cardSectionsEdit').on('click', '.section-add', (e) => {
        let activeElem = $('#cardSectionsEdit').find(`.section-elem.selected`);
        let parent = null;
        if (activeElem.length > 0 && $(activeElem).first().attr('data-root') == '1') {
            parent = $(activeElem).first().attr('data-id');
        }
        let data = {'add_card_sections': 1, 'parent': parent};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadCardSections();
                }
            },
            error: function (res) {
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#cardSectionsEdit').on('click', '.section-delete', (e) => {
        let activeElem = $('#cardSectionsEdit').find(`.section-elem.selected`);
        if (activeElem.length > 0) {
            let cId = $(activeElem).first().attr('data-id');
            let data = {'delete_card_sections': 1, 'id': cId};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "players_api",
                success: function (res) {
                    if (res.success) {
                        LoadCardSections();
                    }
                },
                error: function (res) {
                    console.error(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }
    });
    $('#cardSectionsEdit').on('click', '[name="save"]', (e) => {
        let dataToSend = [];
        $('#cardSectionsEdit').find('.section-elem').each((ind, elem) => {
            let id = $(elem).attr('data-id');
            let order = ind+1;
            let title = $(elem).find('[name="title"]').val();
            let text_id = $(elem).find('[name="text_id"]').val();
            let visible = $(elem).find('[name="visible"]').is(':checked');
            dataToSend.push({
                id, order, title, text_id, visible
            });
        });
        let data = {'edit_card_sections': 1, 'data': JSON.stringify(dataToSend)};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadCardSections();
                }
            },
            error: function (res) {
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });


    $('.card-sections').on('click', '.section-toggle', (e) => {
        let cId = $(e.currentTarget).attr('data-text-id');
        $('.cnt-center-block').find('.center-content').fadeOut(250);
        $('.card-sections').find('.section-toggle').removeClass('selected');
        $('.cnt-center-block').find(`.center-content[data-id="${cId}"]`).fadeIn(250);
        $('.card-sections').find(`.section-toggle[data-text-id="${cId}"]`).addClass('selected');
    });


    // PlayerCharacteristics
    LoadPlayerCharacteristics();
    $('#characteristicsRowsEdit').on('click', '.characteristics-user', (e) => {
        LoadPlayerCharacteristics();
    });
    $('#characteristicsRowsEdit').on('click', '.characteristics-nfb', (e) => {
        LoadPlayerCharacteristics(true);
    });
    $('.cnt-center-block').on('click', '#editCharacteristicsRows', (e) => {
        $('#characteristicsRowsEdit').modal('show');
    });
    // Edit PlayerCharacteristics
    $('#characteristicsRowsEdit').on('click', '.characteristic-elem', (e) => {
        let wasActive = $(e.currentTarget).hasClass('selected');
        $('#characteristicsRowsEdit').find('.characteristic-elem').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasActive);
    });
    $('#characteristicsRowsEdit').on('click', '.characteristics-up', (e) => {
        ToggleCharacteristicsRowsOrder("up");
    });
    $('#characteristicsRowsEdit').on('click', '.characteristics-down', (e) => {
        ToggleCharacteristicsRowsOrder("down");
    });
    $('#characteristicsRowsEdit').on('click', '.characteristics-edit', (e) => {
        $('#characteristicsRowsEdit').find('input.form-control ').prop('disabled', false);
    });
    $('#characteristicsRowsEdit').on('click', '.characteristics-add', (e) => {
        let activeElem = $('#characteristicsRowsEdit').find(`.characteristic-elem.selected`);
        let parent = null;
        if (activeElem.length > 0 && $(activeElem).first().attr('data-root') == '1') {
            parent = $(activeElem).first().attr('data-id');
        }
        let isNfb = $('#characteristicsRowsEdit').find('[name="save"]').attr('data-nfb') == '1' ? 1 : 0;
        let data = {'add_characteristics_rows': 1, 'parent': parent, 'nfb': isNfb};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadPlayerCharacteristics(res.is_nfb);
                }
            },
            error: function (res) {
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#characteristicsRowsEdit').on('click', '.characteristics-delete', (e) => {
        let activeElem = $('#characteristicsRowsEdit').find(`.characteristic-elem.selected`);
        if (activeElem.length > 0) {
            let cId = $(activeElem).first().attr('data-id');
            let isNfb = $('#characteristicsRowsEdit').find('[name="save"]').attr('data-nfb') == '1' ? 1 : 0;
            let data = {'delete_characteristics_rows': 1, 'id': cId, 'nfb': isNfb};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "players_api",
                success: function (res) {
                    if (res.success) {
                        LoadPlayerCharacteristics(res.is_nfb);
                    }
                },
                error: function (res) {
                    console.error(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }
    });
    $('#characteristicsRowsEdit').on('click', '[name="save"]', (e) => {
        let dataToSend = [];
        $('#characteristicsRowsEdit').find('.characteristic-elem').each((ind, elem) => {
            let id = $(elem).attr('data-id');
            let order = ind+1;
            let title = $(elem).find('[name="title"]').val();
            let visible = $(elem).find('[name="visible"]').is(':checked');
            dataToSend.push({
                id, order, title, visible
            });
        });
        let isNfb = $('#characteristicsRowsEdit').find('[name="save"]').attr('data-nfb') == '1' ? 1 : 0;
        let data = {'edit_characteristics_rows': 1, 'data': JSON.stringify(dataToSend), 'nfb': isNfb};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadPlayerCharacteristics(res.is_nfb);
                }
            },
            error: function (res) {
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#characteristicsRowsEdit').on('click', '[name="copy"]', (e) => {
        let data = {'copy_characteristics_rows': 1};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadPlayerCharacteristics();
                }
            },
            error: function (res) {
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });   
    // Player characteristics
    $('#playerCharacteristicsTable').on('click', 'div[name="characteristics_stars"]', (e) => {
        if ($(e.currentTarget).hasClass('disabled')) {return;}
        if ($(e.target).is('span')) {
            let cVal = $(e.currentTarget).attr('data-val');
            let cNum = $(e.target).attr('data-num');
            $(e.currentTarget).find('span').removeClass('star-checked');
            if (cVal != cNum) {
                $(e.target).addClass('star-checked');
                $(e.target).prevAll().addClass('star-checked');
                $(e.currentTarget).attr('data-val', cNum);
            } else {
                $(e.currentTarget).attr('data-val', '0');
            }
        }
    });
    $('#toggleCharacteristicsChildRows').on('click', (e) => {
        let state = $(e.currentTarget).attr('data-state');
        $('#playerCharacteristicsTable').find('.characteristic-elem[data-root="0"]').toggleClass('d-none', state != '1');
        $(e.currentTarget).attr('data-state', state == '1' ? '0' : '1');
    });
    $('#playerCharacteristicsTable').on('click', '.characteristic-elem[data-root="1"]', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#playerCharacteristicsTable').find(`.characteristic-elem[data-root="0"][data-parent="${cId}"]`).toggleClass('d-none');
    });


    // PlayerQuestionnaires
    LoadPlayerQuestionnaires();
    $('.cnt-center-block').on('click', '#editQuestionnaireRows', (e) => {
        $('#questionnaireRowsEdit').modal('show');
    });
    // Edit PlayerQuestionnaires
    $('#questionnaireRowsEdit').on('click', '.questionnaire-elem', (e) => {
        let wasActive = $(e.currentTarget).hasClass('selected');
        $('#questionnaireRowsEdit').find('.questionnaire-elem').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasActive);
    });
    $('#questionnaireRowsEdit').on('click', '.questionnaire-up', (e) => {
        ToggleQuestionnairesRowsOrder("up");
    });
    $('#questionnaireRowsEdit').on('click', '.questionnaire-down', (e) => {
        ToggleQuestionnairesRowsOrder("down");
    });
    $('#questionnaireRowsEdit').on('click', '.questionnaire-edit', (e) => {
        $('#questionnaireRowsEdit').find('input.form-control ').prop('disabled', false);
    });
    $('#questionnaireRowsEdit').on('click', '.questionnaire-add', (e) => {
        let activeElem = $('#questionnaireRowsEdit').find(`.questionnaire-elem.selected`);
        let parent = null;
        if (activeElem.length > 0 && $(activeElem).first().attr('data-root') == '1') {
            parent = $(activeElem).first().attr('data-id');
        }
        let data = {'add_questionnaires_rows': 1, 'parent': parent};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadPlayerQuestionnaires();
                }
            },
            error: function (res) {
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#questionnaireRowsEdit').on('click', '.questionnaire-delete', (e) => {
        let activeElem = $('#questionnaireRowsEdit').find(`.questionnaire-elem.selected`);
        if (activeElem.length > 0) {
            let cId = $(activeElem).first().attr('data-id');
            let data = {'delete_questionnaires_rows': 1, 'id': cId};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "players_api",
                success: function (res) {
                    if (res.success) {
                        LoadPlayerQuestionnaires();
                    }
                },
                error: function (res) {
                    console.error(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }
    });
    $('#questionnaireRowsEdit').on('click', '[name="save"]', (e) => {
        let dataToSend = [];
        $('#questionnaireRowsEdit').find('.questionnaire-elem').each((ind, elem) => {
            let id = $(elem).attr('data-id');
            let order = ind+1;
            let title = $(elem).find('[name="title"]').val();
            let visible = $(elem).find('[name="visible"]').is(':checked');
            dataToSend.push({
                id, order, title, visible
            });
        });
        let data = {'edit_questionnaires_rows': 1, 'data': JSON.stringify(dataToSend)};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadPlayerQuestionnaires();
                }
            },
            error: function (res) {
                console.error(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });



    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

});

