function ToggleUpFilter(id, state) {
    let currentList = null;
    let activeElem = null;
    let graphicsWidth = '';
    switch(id) {
        case "toggle_side_filter":
            $('div.side-filter-block').toggleClass('d-none', !state);
            break;
        case "toggle_up_filter":
            $('div.btns-tabs-second').fadeToggle(300, (e) => {});
            break;
        case "cols_size":
            if ($('.up-tabs-elem[data-id="toggle_side_filter"]').attr('data-state') == '1') {
                $('.exercises-list').find('div.gutter').toggleClass('d-none', !state);
            } else {
                swal("Внимание", "Включите сначала \"Фильтрацию\".", "info");
                $('.up-tabs-elem[data-id="cols_size"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="cols_size"]').removeClass('btn-primary');
                $('.up-tabs-elem[data-id="cols_size"]').addClass('btn-secondary');
            }
            break;
        case "nfb_folders":
            $('.up-tabs-elem[data-id="nfb_folders"]').removeClass('selected3');
            $('.exs_counter').html("(...)");

            $('.folders_nfb_list').toggleClass('d-none', true);
            $('.folders_club_list').toggleClass('d-none', false);
            $('.folders_list').toggleClass('d-none', true);
            $('.exercises-list').find('.list-group-item:not(.side-filter-elem)').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');

            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', false);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', true);

            $('#exerciseCopyModal').find('select[name="copy_mode"]').val('1');
            $('#exerciseCopyModal').find('select[name="copy_mode"]').prop('disabled', true);
            CountFilteredExs();

            $('.toggle-filter-content').removeClass('btn-custom-outline-blue');
            $('.toggle-filter-content').removeClass('btn-custom-outline-green');
            $('.toggle-filter-content').addClass('btn-custom-outline-red');
            $('.up-tabs-elem').removeClass('b-c-blue2');
            $('.up-tabs-elem').removeClass('b-c-green2');
            $('.up-tabs-elem').addClass('b-c-red2');
            CountExsInFoldersByType();
            break;
        case "club_folders":
            $('.up-tabs-elem[data-id="club_folders"]').removeClass('selected3');
            $('.exs_counter').html("(...)");

            $('.folders_nfb_list').toggleClass('d-none', true);
            $('.folders_club_list').toggleClass('d-none', true);
            $('.folders_list').toggleClass('d-none', false);

            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', false);
            CountFilteredExs();

            $('.toggle-filter-content').removeClass('btn-custom-outline-green');
            $('.toggle-filter-content').removeClass('btn-custom-outline-red');
            $('.toggle-filter-content').addClass('btn-custom-outline-blue');
            $('.up-tabs-elem').removeClass('b-c-green2');
            $('.up-tabs-elem').removeClass('b-c-red2');
            $('.up-tabs-elem').addClass('b-c-blue2');
            CountExsInFoldersByType();
            break;
        case "team_folders":
            $('.up-tabs-elem[data-id="team_folders"]').removeClass('selected3');
            $('.exs_counter').html("(...)");

            $('.folders_nfb_list').toggleClass('d-none', false);
            $('.folders_club_list').toggleClass('d-none', true);
            $('.folders_list').toggleClass('d-none', true);
            $('.exercises-list').find('.list-group-item:not(.side-filter-elem)').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');

            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', false);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', true);

            $('#exerciseCopyModal').find('select[name="copy_mode"]').prop('disabled', false);
            CountFilteredExs();

            $('.toggle-filter-content').removeClass('btn-custom-outline-blue');
            $('.toggle-filter-content').removeClass('btn-custom-outline-red');
            $('.toggle-filter-content').addClass('btn-custom-outline-green');
            $('.up-tabs-elem').removeClass('b-c-blue2');
            $('.up-tabs-elem').removeClass('b-c-red2');
            $('.up-tabs-elem').addClass('b-c-green2');
            CountExsInFoldersByType();
            break;
        case "copy":
            if ($('.exercises-list').find('.exs-elem.active').length <= 0) {
                $('.up-tabs-elem[data-id="copy"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="copy"]').attr('data-state', '0');
                swal("Внимание", "Выберите упражнение из списка.", "info");
            } else {
                $('#exerciseCopyModal').find('[name="copy_mode"]').val('1');
                if (state) {$('#exerciseCopyModal').modal('show');} 
                else {$('#exerciseCopyModal').modal('hide');}
            }
            break;
        case "move":
            if ($('.exercises-list').find('.exs-elem.active').length <= 0) {
                $('.up-tabs-elem[data-id="move"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="move"]').attr('data-state', '0');
                swal("Внимание", "Выберите упражнение из списка.", "info");
            } else {
                $('#exerciseCopyModal').find('[name="copy_mode"]').val('2');
                if (state) {$('#exerciseCopyModal').modal('show');} 
                else {$('#exerciseCopyModal').modal('hide');}
            }
            break;
        case "share":
            if ($('.exercises-list').find('.exs-elem.active').length <= 0) {
                $('.up-tabs-elem[data-id="share"]').removeClass('selected3');
                $('.up-tabs-elem[data-id="share"]').attr('data-state', '0');
                swal("Внимание", "Выберите упражнение из списка.", "info");
            } else {
                if (state) {$('#exerciseShareModal').modal('show');} 
                else {$('#exerciseShareModal').modal('hide');}
            }
            break;
        case "prev_exs":
            currentList = '.exs-list-group';
            activeElem = $(currentList).find('.exs-elem.active');
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                $(activeElem).prev().addClass('active');
            } else {
                $(currentList).find('.exs-elem').last().addClass('active');
            }
            $('.up-tabs-elem[data-id="prev_exs"]').toggleClass('selected3', false);
            LoadExerciseOneHandler();
            break;
        case "next_exs":
            currentList = '.exs-list-group';
            activeElem = $(currentList).find('.exs-elem.active');
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                $(activeElem).next().addClass('active');
            } else {
                $(currentList).find('.exs-elem').first().addClass('active');
            }
            $('.up-tabs-elem[data-id="next_exs"]').toggleClass('selected3', false);
            LoadExerciseOneHandler();
            break;
        case "toggle_markers":
            ToggleMarkersInExs();
            break;
        case "toggle_favorite":
            ToggleMarkersInExs();
            break;
        case "goal":
            ToggleIconsInExs();
            break;
        case "players":
            ToggleIconsInExs();
            break;
        default:
            break;
    }
}

function CheckLastExs() {
    let dataStr = sessionStorage.getItem('last_exs');
    try {
        window.lastExercise = JSON.parse(dataStr);
    } catch(e) {}
    sessionStorage.setItem('last_exs', '');
    if (window.lastExercise && window.lastExercise.type) {
        $('.up-tabs-elem.folders-toggle').addClass('d-none');
        $(`.up-tabs-elem[data-id="${window.lastExercise.type}"]`).removeClass('d-none');
        $('.folders-block > div').addClass('d-none');
        $(`.folders-block > div[data-id="${window.lastExercise.type}"]`).removeClass('d-none');
        setTimeout(() => {
            if (window.lastExercise.folder) {
                if (window.lastExercise.type == "team_folders") {
                    $('.folders_list').find(`.folder-elem[data-id="${window.lastExercise.folder}"]`).click();
                } else if (window.lastExercise.type == "nfb_folders") {
                    $('.folders_nfb_list').find(`.folder-nfb-elem[data-id="${window.lastExercise.folder}"]`).click();
                } else if (window.lastExercise.type == "club_folders") {
                    $('.folders_club_list').find(`.folder-club-elem[data-id="${window.lastExercise.folder}"]`).click();
                }
            }
        }, 200);
    } else {
        window.lastExercise = null;
    }
}

function RenderFilterNewExs() {
    function createElement(date, i) {
        const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        let mm = String(date.getMonth() + 1).padStart(2, '0');
        let mmName =  monthNames[date.getMonth()];
        let yyyy = date.getFullYear();
        $('.list-group[data-id="newexs"]').append(`
            <li class="side-filter-elem list-group-item py-0 px-2" data-val="${i}">
                ${mmName} ${yyyy}
            </li>
        `);
    }
    let tDate = new Date();
    for (let i = 0; i < 6; i ++) {
        createElement(tDate, -i);
        tDate.setMonth(tDate.getMonth() - 1);
    }
}

function StopAllVideos() {
    try {
        if (Array.isArray(window.videoPlayerClones)) {
            for (let i = 0; i < window.videoPlayerClones.length; i++) {
                window.videoPlayerClones[i].pause();
            }
        }
    } catch (e) {}
}



function getFormattedDateFromTodayWithDelta(delta=0) {
    let date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * delta);
    return date.getFullYear()
        + "-"
        + ("0" + (date.getMonth() + 1)).slice(-2)
        + "-"
        + ("0" + date.getDate()).slice(-2);
}



$(function() {

    $('.folders_list').toggleClass('d-none', true);
    $('.folders_nfb_list').toggleClass('d-none', false);
    $('.folders_club_list').toggleClass('d-none', false);


    // Toggle upper buttons panel
    $('button.up-tabs-elem').on('click', (e) => {
        let id = $(e.currentTarget).attr('data-id');
        let state = $(e.currentTarget).attr('data-state') == '1';
        // $(e.currentTarget).toggleClass('btn-secondary', state);
        // $(e.currentTarget).toggleClass('btn-primary', !state);
        $(e.currentTarget).toggleClass('selected3', !state);
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        ToggleUpFilter(id, !state);
    });


    // Toggle side filter elements
    $('.side-filter-block').on('click', '.side-filter-elem', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        let isFilter = $(e.currentTarget).parent().attr('data-id') == "filter";
        if (isFilter) {
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').attr('data-state', '0');
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').toggleClass('active', false);
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').find('.row > div:nth-child(2)').html('');
            let type = $(e.currentTarget).attr('data-type');
            let id = $(e.currentTarget).attr('data-id');
            if (!state) {
                $(e.currentTarget).find('.row > div:nth-child(2)').html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`);
                window.exercisesFilter[type] = id;
            } else {
                $(e.currentTarget).find('.row > div:nth-child(2)').html('');
                delete window.exercisesFilter[type];
            }
            for (ind in window.count_exs_calls) {
                window.count_exs_calls[ind].abort();
            }
            LoadFolderExercises();
            CountExsInFolder();
        }
        $(e.currentTarget).toggleClass('active', !state);
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
    });

    $('.exs-search').on('keyup', (e) => {
        let val = $(e.currentTarget).val();
        window.exercisesFilter['_search'] = val;
        for (ind in window.count_exs_calls) {
            window.count_exs_calls[ind].abort();
        }
        LoadFolderExercises();
        CountExsInFolder();
    });


    // Toggle side filter content
    $('.side-filter-block').on('click', '.toggle-filter-content', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.side-filter-block').find(`.list-group[data-id="${cId}"]`).toggleClass('d-none');
    });


    // Reset side filter
    $('#filterReset').on('click', (e) => {
        if ($($('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').hasClass('active')).length > 0 || $('.exs-search').val() != "") {
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').attr('data-state', '0');
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').toggleClass('active', false);
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').find('.row > div:nth-child(2)').html('');
            $('.exs-search').val('');
            window.exercisesFilter = {};
            LoadFolderExercises();
            CountExsInFolder();
        }
    });

    // Toggle columns size
    $('#columnsSizeInCard').on('click', (e) => {
        $('#exerciseCardModal').find('div.gutter').toggleClass('d-none');
    });


    // Toggle Names of folders:
    $('#toggleFoldersNames').on('click', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        $('.folders-block').find('.folder-elem').each((ind, elem) => {
            let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
            $(elem).find('.folder-title').text(tmpText);
        });
        $('.folders-block').find('.folder-nfb-elem').each((ind, elem) => {
            let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
            $(elem).find('.folder-title').text(tmpText);
        });
        $('.folders-block').find('.folder-club-elem').each((ind, elem) => {
            let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
            $(elem).find('.folder-title').text(tmpText);
        });
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        $(e.currentTarget).html(state ? `
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        ` : `
            <i class="fa fa-arrow-down" aria-hidden="true"></i>
        `);
        ResizeSplitCols();
    });


    // Toggle draw, video, animation
    $('.visual-block').on('click', '.graphics-block-toggle', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.visual-block').find('.graphics-block-toggle').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        $('.visual-block').find('.graphics-block').addClass('d-none');
        $('.visual-block').find(`.graphics-block[data-id=${cId}]`).removeClass('d-none');
    });
    

    $('#exerciseCardModal').on('click', '.exs-change', (e) => {
        let dir = $(e.currentTarget).attr('data-dir');
        let elems = $('.exercises-list').find('.exs-elem');
        if (elems.length > 1) {
            let activeInd = -1;
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];
                if ($(elem).hasClass('active')) {
                    activeInd = i;
                    break;
                }
            }
            if (activeInd != -1) {
                activeInd = dir == "next" ? (activeInd + 1) : dir == "prev" ? (activeInd - 1) : activeInd;
                activeInd = (activeInd < 0) ? (elems.length - 1) : (activeInd > elems.length - 1) ? 0 : activeInd;
                $(elems).removeClass('active');
                $(elems[activeInd]).addClass('active');
                let exsId = $(elems[activeInd]).attr('data-id');
                let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
                let data = {'get_exs_one': 1, 'exs': exsId, 'get_nfb': fromNfbFolder ? 1 : 0};
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'GET', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (res.success) {
                            RenderExerciseOne(res.data);
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
        }
    });


    // Open exercise's card
    $('#openCardView').on('click', (e) => {
        if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
            $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', true);
            $('#exerciseCardModal').find('.btn-only-edit').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-not-view').toggleClass('d-none', true);
            $('#exerciseCardModal').find('.add-row').toggleClass('d-none', true);
            $('#exerciseCardModal').find('.remove-row').toggleClass('d-none', true);
            document.descriptionEditor.enableReadOnlyMode('');
            $('#exerciseCardModal').modal('show');
        } else {
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
        }
    });
    $('#openCardEdit').on('click', (e) => {
        if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
            $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-only-edit').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-not-view').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.add-row').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.remove-row').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.add-row').prop('disabled', false);
            $('#exerciseCardModal').find('.remove-row').prop('disabled', true);
            $('#exerciseCardModal').find('.remove-row.btn-on').prop('disabled', false);
            document.descriptionEditor.disableReadOnlyMode('');
            $('#exerciseCardModal').modal('show');
        } else {
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
        }
    });


    $('#createExercise').on('click', (e) => {
        let folderType = $('.folders_div:not(.d-none)').attr('data-id');
        window.location.href = `/exercises/exercise?id=new&type=${folderType}`;
    });


    $('#exerciseCardModal').on('contextmenu', (e) => {
        e.preventDefault();
    });
    $('#exerciseCardModal').on('click', '#openDescription', (e) => {
        $('#exerciseCardModal').find('#openContent').removeClass('btn-success');
        $('#exerciseCardModal').find('#openContent').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-success');
        $('#exerciseCardModal').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal').find('#cardBlock > #card_description').addClass('show active');
    });
    $('#exerciseCardModal').on('click', '#openContent', (e) => {
        $('#exerciseCardModal').find('#openDescription').removeClass('btn-success');
        $('#exerciseCardModal').find('#openDescription').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-success');
        $('#exerciseCardModal').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal').find('#cardBlock > #card_content').addClass('show active');
    });


    // Go to exercise view
    $('#showOneExs').on('click', (e) => {
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        let activeExsId = $(activeExs).attr('data-id');
        if ($(activeExs).length > 0) {
            let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
            let folderType = $('.folders_div:not(.d-none)').attr('data-id');
            let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
            let data = {'type': folderType, 'folder': folder, 'exs': activeExsId};
            data = JSON.stringify(data);
            sessionStorage.setItem('last_exs', data);

            let exsList = {'list': [], 'index': -1};
            $('.exercises-list').find('.exs-elem').each((ind, elem) => {
                if ($(elem).attr('data-id') == activeExsId) {
                    exsList['index'] = ind;
                }
                exsList['list'].push($(elem).attr('data-id'));
            });
            exsList = JSON.stringify(exsList);
            sessionStorage.setItem('exs_list', exsList);

            window.location.href = `/exercises/exercise?id=${activeExsId}&nfb=${fromNfbFolder ? 1 : 0}&type=${folderType}`;
        } else {
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
        }
    });



    // Load CkEditor fields
    // editor.setData( '<p>Some text.</p>' );
    // const data = editor.getData();
    let cLang = $('#select-language').val();
    ClassicEditor
        .create(document.querySelector('#descriptionEditor'), {
            language: cLang
        })
        .then(editor => {
            document.descriptionEditor = editor;
        })
        .catch(err => {
            console.error(err);
        });
    ClassicEditor
        .create(document.querySelector('#descriptionEditorView'), {
            language: cLang
        })
        .then(editor => {
            document.descriptionEditorView = editor;
            document.descriptionEditorView.enableReadOnlyMode('');
            $(document).find('.ck-editor__top').addClass('d-none');
            $(document).find('.ck-content.ck-editor__editable').addClass('borders-off');
        })
        .catch(err => {
            console.error(err);
        });
 
    
    $('#exerciseCardModal').on('click', '#saveExs', (e) => {
        let exsId = $('#exerciseCardModal').attr('data-exs');
        let dataToSend = {'edit_exs': 1, 'exs': exsId, 'data': {}};
        $('#exerciseCardModal').find('.exs_edit_field').each((ind, elem) => {
            if (!$(elem).hasClass('d-none')) {
                let name = $(elem).attr('name');
                if (name in dataToSend.data) {
                    if (!Array.isArray(dataToSend.data[name])) {
                        let tVal = dataToSend.data[name];
                        dataToSend.data[name] = [tVal];
                    }
                    dataToSend.data[name].push($(elem).val());
                } else {
                    dataToSend.data[name] = $(elem).val();
                }
            }
        });
        dataToSend.data['description'] = document.descriptionEditor.getData();
        if (dataToSend.data.title == "") {
            swal("Внимание", "Добавьте название для упражнения.", "info");
            return;
        }
        if (dataToSend.data.folder_parent == "" || dataToSend.data.folder_main == "") {
            swal("Внимание", "Выберите папку для упражнения.", "info");
            return;
        }
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Упражнение успешно создано / изменено.", "success")
                    .then((value) => {
                        $('.page-loader-wrapper').fadeIn();
                        window.location.reload();
                    });
                } else {
                    swal("Ошибка", `При создании / изменении упражнения произошла ошибка (${res.err}).`, "error");
                }
            },
            error: function (res) {
                swal("Ошибка", "Упражнение не удалось создать / изменить.", "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#exerciseCardModal').on('change', '[name="folder_parent"]', (e) => {
        let tId = $(e.currentTarget).val();
        $('#exerciseCardModal').find('[name="folder_main"]').val('');
        $('#exerciseCardModal').find('[name="folder_main"]').find('option').addClass('d-none');
        $('#exerciseCardModal').find('[name="folder_main"]').find(`option[data-parent=${tId}]`).removeClass('d-none');
    });
    $('#exerciseCardModal').on('click', '.row-select-td', (e) => {
        if (!$(e.target).is('td')) {return;}
        let isOn = !$(e.currentTarget).parent().hasClass('active');
        $("#exerciseCardModal").find('tr.row-select').removeClass('active');
        $(e.currentTarget).parent().toggleClass('active', isOn);
    });
    $('#exerciseCardModal').on('click', '.add-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cTd = $('#exerciseCardModal').find(`td[data-id="td_${cId}"]`);
        let cloneRow = $(cTd).find('div.row').first().clone();
        $(cloneRow).find('.exs_edit_field').val('');
        $(cloneRow).find('.remove-row').addClass('btn-on');
        $(cloneRow).find('.remove-row').prop('disabled', false);
        $(cTd).append(cloneRow);
    });
    $('#exerciseCardModal').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().remove();
    });
    $('#exerciseCardModal').on('mouseup', '.exs_edit_field', (e) => {
        if ($(e.currentTarget).parent().parent().hasClass('row-select')) {
            let cVal = $(e.currentTarget).val();
            // e.which = 3 -> Right mouse buttom
            if (cVal == "" && e.which == 3 && $(e.currentTarget).parent().find('.exs_edit_field').length > 1) {
                $(e.currentTarget).remove();
            }
        }
    });


    // Delete exercise
    $('#exerciseCardModal').on('click', '#deleteExercise', (e) => {
        swal({
            title: "Вы точно хотите удалить упражнение?",
            text: "После удаления данное упражнение невозможно будет восстановить!",
            icon: "warning",
            buttons: ["Отмена", "Подтвердить"],
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                let cId = $('.exercises-list').find('.exs-elem').attr('data-id');
                let data = {'delete_exs': 1, 'exs': cId};
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "exercises_api",
                    success: function (res) {
                        if (res.success) {
                            swal("Готово", "Упражнение успешно удалено.", "success")
                            .then((value) => {
                                $('.page-loader-wrapper').fadeIn();
                                window.location.reload();
                            });
                        }
                    },
                    error: function (res) {
                        swal("Ошибка", "Упражнение удалить не удалось.", "error");
                        console.log(res);
                    },
                    complete: function (res) {
                        $('.page-loader-wrapper').fadeOut();
                        $('#exerciseCopyModal').modal('hide');
                    }
                });
            }
        });
    });


    // Copy Exs
    let foldersLoadedForCopy = false;
    $('#exerciseCopyModal').on('show.bs.modal', (e) => {
        if (!foldersLoadedForCopy) {
            let tList = $('.exercises-list').find('.folders_list').clone();
            $(tList).removeClass('d-none');
            $(tList).removeClass('folders_list');
            $(tList).addClass('folders_list_copy');
            $(tList).find('.folder-elem').addClass('folder-copy-elem');
            $(tList).find('.folder-elem').removeClass('folder-elem');
            $(tList).find('.pull-right').remove();
            $(tList).find('.list-group-item > div').each((ind, elem) => {
                let tText = `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}`;
                $(elem).find('.folder-title').html(tText);
            });
            $('#exerciseCopyModal').find('.modal-body').html(tList);
            foldersLoadedForCopy = true;
        }
    });
    $('#exerciseCopyModal').on('hidden.bs.modal', (e) => {
        $('.up-tabs-elem[data-id="copy"]').removeClass('selected3');
        $('.up-tabs-elem[data-id="copy"]').attr('data-state', '0');
        $('.up-tabs-elem[data-id="move"]').removeClass('selected3');
        $('.up-tabs-elem[data-id="move"]').attr('data-state', '0');
        $('#exerciseCopyModal').find('.folder-copy-elem').parent().removeClass('active');
    });
    $('#exerciseCopyModal').on('click', '.folder-copy-elem', (e) => {
        if ($(e.currentTarget).attr('data-root') != "1") {
            $('#exerciseCopyModal').find('.folder-copy-elem').parent().removeClass('active');
            $(e.currentTarget).parent().addClass('active');
        }
    });
    $('#exerciseCopyModal').on('change', 'select[name="copy_mode"]', (e) => {
        let val = $(e.currentTarget).val();
        $('#exerciseCopyModal').find('.info-text').toggleClass('d-none', val == '1');
    });
    $('#exerciseCopyModal').on('click', '.btn-apply', (e) => {
        if ($('#exerciseCopyModal').find('.list-group-item.active').length > 0) {
            let modeVal = $('#exerciseCopyModal').find('select[name="copy_mode"]').val();
            let exsId = $('.exs-list-group').find('.exs-elem.active').attr('data-id');
            let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
            let selectedFolder = $('#exerciseCopyModal').find('.list-group-item.active').find('.folder-copy-elem').attr('data-id');
            let folderType = $('.folders_div:not(.d-none)').attr('data-id');
            let data = {
                'move_exs': modeVal == '2' ? 1 : 0,
                'copy_exs': modeVal == '1' ? 1 : 0, 
                'exs': exsId, 
                'nfb_folder': fromNfbFolder ? 1 : 0, 
                'folder': selectedFolder,
                'type': folderType
            };
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "exercises_api",
                success: function (res) {
                    if (res.success) {
                        swal("Готово", "Обновите папку, чтобы увидеть данное упражение.", "success");
                    } else {
                        swal("Ошибка", "Упражнение не удалось скопировать / переместить.", "error");
                        console.log(res);
                    }
                },
                error: function (res) {
                    swal("Ошибка", "Упражнение не удалось скопировать / переместить.", "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                    $('#exerciseCopyModal').modal('hide');
                }
            });
        }
    });

    let startDate = getFormattedDateFromTodayWithDelta(1);
    let endDate = getFormattedDateFromTodayWithDelta(8);
    $('#exerciseShareModal').find('input[name="date"]').val(startDate);
    $('#exerciseShareModal').find('input[name="date"]').attr('min', startDate);
    $('#exerciseShareModal').find('input[name="date"]').attr('max', endDate);
    $('#exerciseShareModal').on('show.bs.modal', (e) => {
        $('#exerciseShareModal').find('input[type="checkbox"]').prop('checked', true);
        $('#exerciseShareModal').find('.form-check.form-check-inline').removeClass('d-none');

        let isScheme1Hide = $('#splitCol_2').find('#carouselSchema').find('.carousel-item').first().hasClass('d-none');
        let isScheme2Hide = $('#splitCol_2').find('#carouselSchema').find('.carousel-item').last().hasClass('d-none');
        let isVideo1Hide = $('#splitCol_2').find('#carouselVideo').find('.carousel-item').first().hasClass('d-none');
        let isVideo2Hide = $('#splitCol_2').find('#carouselVideo').find('.carousel-item').last().hasClass('d-none');
        let isAnimation1Hide = $('#splitCol_2').find('#carouselAnim').find('.carousel-item').first().hasClass('d-none');
        let isAnimation2Hide = $('#splitCol_2').find('#carouselAnim').find('.carousel-item').last().hasClass('d-none');
        $('#exerciseShareModal').find('input[type="checkbox"][name="scheme_1"]').parent().toggleClass('d-none', isScheme1Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="scheme_2"]').parent().toggleClass('d-none', isScheme2Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="video_1"]').parent().toggleClass('d-none', isVideo1Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="video_2"]').parent().toggleClass('d-none', isVideo2Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="animation_1"]').parent().toggleClass('d-none', isAnimation1Hide);
        $('#exerciseShareModal').find('input[type="checkbox"][name="animation_2"]').parent().toggleClass('d-none', isAnimation2Hide);
        
        $('#exerciseShareModal').find('.create-block').removeClass('d-none');
        $('#exerciseShareModal').find('.link-text > a').text('-');
        $('#exerciseShareModal').find('.link-text > a').attr('href', '');
        $('#exerciseShareModal').find('button.btn-share').attr('data-link', "");

        let exsId = $('.exercises-block').find('.exs-elem.active').attr('data-id');
        let folderType = $('.up-block-content').find('.folders-toggle:visible').first().attr('data-id');
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: {'get_link': 1, 'id': exsId, 'type': `exercise_${folderType}`},
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "/shared/shared_link_api",
            success: function (res) {
                if (res.success) {
                    $('#exerciseShareModal').find('.create-block').addClass('d-none');
                    $('#exerciseShareModal').find('.link-text > a').text(res.data.link);
                    $('#exerciseShareModal').find('.link-text > a').attr('href', res.data.link);
                    $('#exerciseShareModal').find('button.btn-share').attr('data-link', res.data.link);
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
    $('#exerciseShareModal').on('hidden.bs.modal', (e) => {
        $('.up-tabs-elem[data-id="share"]').removeClass('selected3');
        $('.up-tabs-elem[data-id="share"]').attr('data-state', '0');
    });
    $('#exerciseShareModal').on('click', '.btn-share', (e) => {
        let cLink = $(e.currentTarget).attr('data-link');
        if (cLink && cLink != "") {
            try {
                navigator.clipboard.writeText(cLink);
            } catch(e) {}
            swal("Готово", `Ссылка скопирована (${cLink})!`, "success");
            return;
        }
        let exsId = $('.exercises-block').find('.exs-elem.active').attr('data-id');
        let folderType = $('.up-block-content').find('.folders-toggle:visible').first().attr('data-id');
        let expireDate = $('#exerciseShareModal').find('input[name="date"]').val();
        let options = {};
        $('#exerciseShareModal').find('input[type="checkbox"]:visible').each((ind, elem) => {
            options[$(elem).attr('name')] = $(elem).prop('checked') ? 1 : 0;
        });
        let dataToSend = {
            'add_link': 1,
            'id': exsId,
            'type': `exercise_${folderType}`,
            'expire_date': expireDate,
            'options': JSON.stringify(options)
        };
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "/shared/shared_link_api",
            success: function (res) {
                if (res.success) {
                    $('#exerciseShareModal').find('.link-text > a').text(res.data.link);
                    $('#exerciseShareModal').find('.link-text > a').attr('href', res.data.link);
                    $('#exerciseShareModal').find('button.btn-share').attr('data-link', res.data.link);
                    try {
                        navigator.clipboard.writeText(res.data.link);
                    } catch(e) {}
                    swal("Готово", `Ссылка скопирована (${res.data.link})!`, "success");
                }
            },
            error: function (res) {
                if (res.type == "date") {
                    swal("Ошибка", "Дата введена не корректно!", "error");
                } else if (res.type == "link") {
                    swal("Ошибка", "Невозможно создать общую ссылку!", "error");
                }
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });

    // Open last exercise from card
    window.lastExercise = null;
    CheckLastExs();


    // Toggle marker for exercise
    $('.exercises-block').on('click', 'button[data-type="marker"]', (e) => {
        let exsId = $(e.currentTarget).parent().parent().parent().attr('data-id');
        let fromNFB = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? 1 : 0;
        let cId = $(e.currentTarget).attr('data-id');
        let state = $(e.currentTarget).hasClass('selected');
        let folderType = $('.folders_div:not(.d-none)').attr('data-id');
        let dataToSend = {'edit_exs_user_params': 1, 'exs': exsId, 'nfb': fromNFB, 'type': folderType, 'data': {'key': cId, 'value': state ? 0 : 1}};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (!res.success) {
                    swal("Ошибка", `При изменении параметра произошла ошибка (${res.err}).`, "error");
                } else {
                    if (cId == "watched") {
                        $(e.currentTarget).parent().find('button[data-type="marker"][data-id="watched_not"]').toggleClass('selected', false);
                    }
                    if (cId == "watched_not") {
                        $(e.currentTarget).parent().find('button[data-type="marker"][data-id="watched"]').toggleClass('selected', false);
                    }
                    if (cId == "like") {
                        $(e.currentTarget).parent().find('button[data-type="marker"][data-id="dislike"]').toggleClass('selected', false);
                    }
                    if (cId == "dislike") {
                        $(e.currentTarget).parent().find('button[data-type="marker"][data-id="like"]').toggleClass('selected', false);
                    }
                    $(e.currentTarget).toggleClass('selected', res.data.value == 1);
                    if ($(e.currentTarget).find('input').length > 0) {
                        $(e.currentTarget).find('input').prop('checked', res.data.value == 1);
                    }
                    if ($(e.currentTarget).find('span.icon-custom').length > 0) {
                        $(e.currentTarget).find('span.icon-custom').toggleClass('icon--favorite', res.data.value != 1);
                        $(e.currentTarget).find('span.icon-custom').toggleClass('icon--favorite-selected', res.data.value == 1);
                    }
                }
            },
            error: function (res) {
                swal("Ошибка", "При изменении параметра произошла ошибка.", "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });


    // Open graphics in modal
    $('.visual-block').on('click', '.carousel-item', (e) => {
        let folderType = $('.up-block-content').find('.folders-toggle:visible').first().attr('data-id');
        let id = -1;
        try {
            id = parseInt($('.exercises-block').find('.exs-elem.active').attr('data-id'));
        } catch (e) {}
        let activeNum = 1; let tempCounter = 1;
        let tParentId = $(e.currentTarget).parent().parent().attr('id');
        if (tParentId == "carouselSchema") {
            activeNum = $('#splitCol_2').find('#carouselSchema').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        } else if (tParentId == "carouselVideo") {
            tempCounter += $('#splitCol_2').find('#carouselSchema').find('.carousel-item:not(.d-none)').length;
            activeNum = $('#splitCol_2').find('#carouselVideo').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        } else if (tParentId == "carouselAnim") {
            tempCounter += $('#splitCol_2').find('#carouselSchema').find('.carousel-item:not(.d-none)').length;
            tempCounter += $('#splitCol_2').find('#carouselVideo').find('.carousel-item:not(.d-none)').length;
            activeNum = $('#splitCol_2').find('#carouselAnim').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        }
        LoadGraphicsModal(id, folderType, activeNum);
        return;

        e.preventDefault();

        $('#exerciseGraphicsModal').find('.modal-body').find('.carousel-item').each((ind, elem) => {
            $(elem).removeClass('active');
            if ($(elem).hasClass('description-item')) {return;}
            $(elem).remove();
        });
        let parentId = $(e.currentTarget).parent().parent().attr('id');
        let items = $('#carouselSchema').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselSchema") {$(items).removeClass('active');}
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        
        items = $('#carouselVideo').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselVideo") {$(items).removeClass('active');}
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if ($(item).find('.video-js').length > 0) {
                $(item).find('.video-js').remove();
                $(item).append(
                    `
                        <video id="video-playerClone-${i}" class="video-js resize-block">
                        </video>
                    `
                );
            }
        }
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        window.videoPlayerClones = [];
        for (let i = 0; i < items.length; i++) {
            window.videoPlayerClones[i] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            });
            window.videoPlayerClones[i].ready((e) => {
                if (i == 0) {
                    window.videoPlayerClones[i].src({
                        type: window.videoPlayerCard1.currentType(),
                        src: window.videoPlayerCard1.currentSrc()
                    });
                    window.videoPlayerClones[i].poster(window.videoPlayerCard1.poster());
                } else if (i == 1) {
                    window.videoPlayerClones[i].src({
                        type: window.videoPlayerCard2.currentType(),
                        src: window.videoPlayerCard2.currentSrc()
                    });
                    window.videoPlayerClones[i].poster(window.videoPlayerCard2.poster());
                }
            });
        }

        items = $('#carouselAnim').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselAnim") {$(items).removeClass('active');}
        let videoPlayersLength = window.videoPlayerClones.length;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if ($(item).find('.video-js').length > 0) {
                $(item).find('.video-js').remove();
                $(item).append(
                    `
                        <video id="video-playerClone-${i + videoPlayersLength}" class="video-js resize-block">
                        </video>
                    `
                );
            }
        }
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        for (let i = 0; i < items.length; i++) {
            window.videoPlayerClones[i + videoPlayersLength] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i + videoPlayersLength}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            });
            window.videoPlayerClones[i + videoPlayersLength].ready((e) => {
                if (i == 0) {
                    window.videoPlayerClones[i + videoPlayersLength].src({
                        type: window.videoPlayerCard3.currentType(),
                        src: window.videoPlayerCard3.currentSrc()
                    });
                    window.videoPlayerClones[i].poster(window.videoPlayerCard3.poster());
                } else if (i == 1) {
                    window.videoPlayerClones[i + videoPlayersLength].src({
                        type: window.videoPlayerCard4.currentType(),
                        src: window.videoPlayerCard4.currentSrc()
                    });
                    window.videoPlayerClones[i].poster(window.videoPlayerCard4.poster());
                }
            });
        }
        $('#exerciseGraphicsModal').modal('show');
    });
    $('#exerciseGraphicsModal').on('hide.bs.modal', (e) => {
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-prev', (e) => {
        console.log('xxx')
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-next', (e) => {
        StopAllVideos();
    });

    // Save & Load current folders mode
    window.addEventListener("beforeunload", (e) => {
        let toggledFolders = $('#toggleFoldersNames').attr('data-state') == '1';
        let cFolderType = $('.up-tabs-elem.folders-toggle:not(.d-none)').first().attr('data-id');
        let foldersSettings = JSON.stringify({'expandToggled': toggledFolders, 'type': cFolderType});
        localStorage.setItem('folders_sets', foldersSettings);
    }, false);
    let cFoldersSettings = localStorage.getItem('folders_sets');
    try {
        cFoldersSettings = JSON.parse(cFoldersSettings);
    } catch(e) {}
    if (cFoldersSettings.expandToggled !== null && cFoldersSettings.expandToggled !== undefined) {
        if (cFoldersSettings.expandToggled) {
            setTimeout((e) => {
                $('#toggleFoldersNames').first().click();
            }, 600);
        }
    }
    if (cFoldersSettings.type !== null && cFoldersSettings.type !== undefined) {
        $('.up-tabs-elem.folders-toggle').addClass('d-none');
        $(`.up-tabs-elem[data-id="${cFoldersSettings.type}"]`).removeClass('d-none');
        $('.folders-block > div').addClass('d-none');
        $(`.folders-block > div[data-id="${cFoldersSettings.type}"]`).removeClass('d-none');
        if (cFoldersSettings.type == "team_folders") {
            $('.toggle-filter-content').removeClass('btn-custom-outline-green');
            $('.toggle-filter-content').removeClass('btn-custom-outline-red');
            $('.toggle-filter-content').addClass('btn-custom-outline-blue');
            $('.up-tabs-elem').removeClass('b-c-green2');
            $('.up-tabs-elem').removeClass('b-c-red2');
            $('.up-tabs-elem').addClass('b-c-blue2');
        } else if (cFoldersSettings.type == "nfb_folders") {
            $('.toggle-filter-content').removeClass('btn-custom-outline-blue');
            $('.toggle-filter-content').removeClass('btn-custom-outline-red');
            $('.toggle-filter-content').addClass('btn-custom-outline-green');
            $('.up-tabs-elem').removeClass('b-c-blue2');
            $('.up-tabs-elem').removeClass('b-c-red2');
            $('.up-tabs-elem').addClass('b-c-green2');
        } else if (cFoldersSettings.type == "club_folders") {
            $('.toggle-filter-content').removeClass('btn-custom-outline-blue');
            $('.toggle-filter-content').removeClass('btn-custom-outline-green');
            $('.toggle-filter-content').addClass('btn-custom-outline-red');
            $('.up-tabs-elem').removeClass('b-c-blue2');
            $('.up-tabs-elem').removeClass('b-c-green2');
            $('.up-tabs-elem').addClass('b-c-red2');
        }
    }

    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

    // Load exs count in folder
    if (window.lastExercise == null) {
        CountExsInFolder();
    }


    RenderFilterNewExs();

});
