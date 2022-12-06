function StopAllVideosTemp() {
    try {
        if (Array.isArray(window.videoPlayerClones)) {
            for (let i = 0; i < window.videoPlayerClones.length; i++) {
                window.videoPlayerClones[i].pause();
            }
        }
    } catch (e) {}
}

function formatState(state) {
    if (!state.id) {
        return state.text;
    }
    var $state = $(
        '<span>' + state.text + '</span>' + '<span class="float-right">(' + state.element.getAttribute('data-count') + ')</span>'
    );
    return $state;
}
function formatFolders(state) {
    if (!state.id) {
        return state.text;
    }
    var $state = $(
        '<span>' + state.text + '</span>' + '<span class="float-right">(' + state.element.getAttribute('value') + ')</span>'
    );
    return $state;
};



$(function() {

    // For videos' filter
    $('.video-source').select2({
        templateResult: formatState,
    });
    $('.exercise-folder').select2({
        templateResult: formatFolders,
    });
    $('.video-source').on('change', function (){
        let data_source = $( this ).val();
        video_table.columns([2]).search(data_source).draw();
    });
    $('.exercise-folder').on('change', function (){
        let data_folder = $( this ).val();
        video_table.columns([3]).search(data_folder).draw();
    });
    $('.video-tags-filter').on('change', function (){
        let data_tag = $( this ).val();
        video_table.columns([7]).search(data_tag).draw();
    });
    $('.video-search').on('keyup', function (){
        let data_search = $( this ).val();
        video_table.search(data_search).draw();
    });
    $('#video-filters-clear').on('click', function (){
        $('.video-source').val(null).trigger('change');
        $('.exercise-folder').val(null).trigger('change');
        $('.video-tags-filter').val(null).trigger('change');
        $('.video-search').val('').trigger('change');
        video_table.search('').draw();
        // $('.video-list-container').find('input[type="search"]').val('').change();
        // video_table.columns([1]).search('').draw();
    });
    // END For videos' filter

    $('#exerciseCard').find('.modal-body').removeClass('size-h-x');
    $('#exerciseCard').find('.modal-body').attr('style', '');
    $('#exerciseCard').find('#columnsSizeInCard2').remove();

    $('#columnsSizeToggle').on('click', (e) => {
        $('#exerciseCard').find('div.gutter').toggleClass('d-none');
    });

    $('#exerciseCard').on('click', 'button[data-dismiss="modal"]', (e) => {
        if (window.changedData == true) {
            swal({
                title: "Вы точно хотите выйти, не сохранив изменений?",
                text: "При выходе данные не сохраняются!",
                icon: "warning",
                buttons: ["Отмена", "Подтвердить"],
                dangerMode: true,
            })
            .then((willExit) => {
                if (willExit) {
                    window.changedData = false;
                    window.location.href = `/exercises`;
                }
            });
        } else {
            window.location.href = `/exercises`;
        }
    });
    $(window).on('beforeunload', (e) => {
        if (window.changedData == true) {
            return "Вы не сохранили новые изменения. При выходе новые данные не сохранятся. Вы точно хотите покинуть страницу?";
        }
    });

    // Open graphics in modal
    $('#splitCol_exscard_2').on('click', '.carousel-item', (e) => {
        let searchParams = new URLSearchParams(window.location.search);
        let id = -1;
        try {
            id = parseInt(searchParams.get('id'));
        } catch (e) {}
        let folderType = searchParams.get('type');
        let activeNum = 1; let tempCounter = 1;
        let tParentId = $(e.currentTarget).parent().parent().attr('id');
        if (tParentId == "carouselSchema") {
            activeNum = $('#splitCol_exscard_2').find('#carouselSchema').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        } else if (tParentId == "carouselVideo") {
            tempCounter += $('#splitCol_exscard_2').find('#carouselSchema').find('.carousel-item:not(.d-none)').length;
            activeNum = $('#splitCol_exscard_2').find('#carouselVideo').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        } else if (tParentId == "carouselAnim") {
            tempCounter += $('#splitCol_exscard_2').find('#carouselSchema').find('.carousel-item:not(.d-none)').length;
            tempCounter += $('#splitCol_exscard_2').find('#carouselVideo').find('.carousel-item:not(.d-none)').length;
            activeNum = $('#splitCol_exscard_2').find('#carouselAnim').find('.carousel-item').index($(e.currentTarget)) + tempCounter;
        }
        LoadGraphicsModal(id, folderType, activeNum);
        return;


        e.preventDefault();
        $('#exerciseGraphicsModal').find('.modal-body').find('.carousel-item').each((ind, elem) => {
            $(elem).removeClass('active');
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
                    console.log( window.videoPlayerCard1.currentType(), window.videoPlayerCard1.currentSrc() )
                    window.videoPlayerClones[i].src({
                        type: window.videoPlayerCard1.currentType(),
                        src: window.videoPlayerCard1.currentSrc()
                    });
                } else if (i == 1) {
                    window.videoPlayerClones[i].src({
                        type: window.videoPlayerCard2.currentType(),
                        src: window.videoPlayerCard2.currentSrc()
                    });
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
                } else if (i == 1) {
                    window.videoPlayerClones[i + videoPlayersLength].src({
                        type: window.videoPlayerCard4.currentType(),
                        src: window.videoPlayerCard4.currentSrc()
                    });
                }
            });
        }

        $('#exerciseGraphicsModal').modal('show');
    });
    $('#exerciseGraphicsModal').on('hide.bs.modal', (e) => {
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-prev', (e) => {
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-next', (e) => {
        StopAllVideos();
    });

    
    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

    
});
