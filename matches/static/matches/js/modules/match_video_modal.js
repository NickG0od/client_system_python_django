let modelType = null; let modelId = null;

function YoutubeParser(url) {
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function OpenMatchVideoModal(type, id) {
    modelType = type;
    modelId = id;
    LoadMatchVideoModal(modelId);
    $('#matchVideoModal').modal('show');
}

function LoadMatchVideoModal(id) {
    let dataKey = `get_match_video_${modelType}`;
    let data = {[dataKey]: 1, 'id': id};
    let resData = {'links': [], 'notes': []};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "matches_api",
        success: function (res) {
            if (res.success) {
                resData = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            RenderMatchVideoModal(resData);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderMatchVideoModal(data) {
    let htmlStr = "";
    let currentIndex = 0;
    for (; currentIndex < data.links.length; currentIndex++) {
        let isActive = currentIndex == 0;
        let isEmpty = data.links[currentIndex] == "";
        htmlStr += `
            <div class="carousel-item ${isActive ? 'active' : ''}">
                <video id="" class="video-js resize-block video-size ${isEmpty ? 'video-empty' : ''}">
                </video>
                <input class="form-control form-control-sm" name="video_link" value="${data.links[currentIndex]}" placeholder="Ссылка на видео" type="text" autocomplete="off">
                <textarea class="form-control form-control-sm" name="video_note" placeholder="Примечание к видео" type="text" autocomplete="off">${data.notes[currentIndex]}</textarea>
            </div>
        `;
    }
    for (; currentIndex < 3; currentIndex++) {
        let isActive = currentIndex == 0;
        htmlStr += `
            <div class="carousel-item ${isActive ? 'active' : ''}">
                <video id="" class="video-js resize-block video-size video-empty">
                </video>
                <input class="form-control form-control-sm" name="video_link" value="" placeholder="Ссылка на видео" type="text" autocomplete="off">
                <textarea class="form-control form-control-sm" name="video_note" placeholder="Примечание к видео" type="text" autocomplete="off"></textarea>
            </div>
        `;
    }
    $('#matchVideoModal').find('.carousel-inner').html(htmlStr);
    $('#matchVideoModal').find('.video-js:not(.video-empty)').each((ind, elem) => {
        let cVideoElem = videojs($(elem)[0], {
            controls: true,
            autoplay: false,
            preload: 'auto'
        });
        let cLink = $(elem).parent().parent().find('[name="video_link"]').val();
        let cYoutubeLink = YoutubeParser(cLink);
        if (cYoutubeLink) {
            cVideoElem.src({techOrder: ["youtube"], type: 'video/youtube', src: `https://www.youtube.com/watch?v=${cYoutubeLink}`});
        } else {
            cVideoElem.src({type: 'video/mp4', src: cLink});
        }
    });
}

function SaveMatchVideoModal() {
    if (!window.matchVideoCanSave) {
        $('#matchVideoModal').find('.alert-container').html(`
            <div class="alert alert-danger" role="alert">
                Сохранение не возможно. Проверьте правильность ссылок.
            </div>
        `);
        setTimeout(() => {
            $('#matchVideoModal').find('.alert').alert('close');
        }, 1000);
        return;
    }
    let videoLinks = []; let videoNotes = [];
    $('#matchVideoModal').find('[name="video_link"]:not(.form-error)').each((index, elem) => {
        videoLinks.push($(elem).val());
        videoNotes.push($(elem).parent().find('[name="video_note"]').val());
    });
    let dataKey = `edit_match_video_${modelType}`;
    let data = {
        [dataKey]: 1,
        'id': modelId,
        'links': videoLinks,
        'notes': videoNotes
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
                swal("Готово", "Видео успешно обновлено.", "success")
                .then((value) => {
                    $('.page-loader-wrapper').fadeIn();
                    window.location.reload();
                });
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

function CheckVideoLink(target) {
    window.matchVideoCanSave = true;
    $(target).removeClass('form-error');
    let cLink = $(target).val();
    let cIndex = $('#matchVideoModal').find('[name="video_link"]').index(target);
    let videoId = `videoLink_${cIndex}`;
    $(target).prev().attr('id', videoId);
    $(target).prev()[0].addEventListener("error", (event) => {
        window.matchVideoCanSave = false;
        $(target).addClass('form-error');
    });
    let cYoutubeLink = YoutubeParser(cLink);
    let cVideoElem = videojs($(target).prev()[0], {
        controls: true,
        autoplay: false,
        preload: 'auto'
    });
    if (cYoutubeLink) {
        cVideoElem.src({techOrder: ["youtube"], type: 'video/youtube', src: `https://www.youtube.com/watch?v=${cYoutubeLink}`});
    } else {
        cVideoElem.src({type: 'video/mp4', src: cLink});
    }
}

function ToggleMatchVideoFields(state = true) {
    $('#matchVideoModal').find('.form-control').prop('disabled', !state);
    $('#matchVideoModal').find('[name="save"]').toggleClass('d-none', !state);
}



$(function() {
    window.matchVideoCanSave = true;
    ToggleMatchVideoFields(false);

    $('#matchVideoModal').on('change', '[name="video_link"]', (e) => {
        CheckVideoLink($(e.currentTarget));
    });
    $('#matchVideoModal').on('click', '[name="save"]', (e) => {
        SaveMatchVideoModal();
    });

    $('#matchVideoModal').on('hide.bs.modal', (e) => {
        $('#matchVideoModal').find('.video-js').each((ind, elem) => {
            if (elem.player) {elem.player.pause();}
        });
    });
    $('#matchVideoModal').on('click', '.col-1', (e) => {
        $('#matchVideoModal').find('.video-js').each((ind, elem) => {
            if (elem.player) {elem.player.pause();}
        });
    });

});
