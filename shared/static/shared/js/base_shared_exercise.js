
$(function() {
    $('.page-loader-wrapper').fadeIn();
    $('.header').remove();
    $('.sidebar').remove();
    $('.page-wrapper').removeClass('page-wrapper');
    $('.main-wrapper > div').first().css('min-height', '');
    setTimeout(() => {
        $('.page-loader-wrapper').fadeOut();
    }, 500);


    try {
        ClassicEditor
            .create(document.querySelector('#descriptionEditor'), {
                language: 'en'
            })
            .then(editor => {
                document.descriptionEditor = editor;
                document.descriptionEditor.enableReadOnlyMode('');
                document.descriptionEditor.setData($('#descriptionEditor').attr('data-value'));
                $(document).find('.ck-editor__top').addClass('d-none');
                $(document).find('.ck-editor__main').addClass('read-mode');
            })
            .catch(err => {
                console.error(err);
            });
    } catch(e) {}


    let items = $('.video-js');
    for (let i = 0; i < items.length; i++) {
        let tId = $(items[i]).attr('id');
        videojs($(`#${tId}`)[0], {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    }

});

