function RenderCarouselAll() {
    $('.visual-block').find('#carouselAll').find('.carousel-inner').html('');
    let elems = $('.visual-block').find('#carouselSchema').find('.carousel-inner > div:not(.d-none)').clone();
    $('.visual-block').find('#carouselAll').find('.carousel-inner').append(elems);
    elems = $('.visual-block').find('#carouselVideo').find('.carousel-inner > div:not(.d-none)').clone();
    $(elems).find('video').attr('id', '');
    $('.visual-block').find('#carouselAll').find('.carousel-inner').append(elems);
    elems = $('.visual-block').find('#carouselAnim').find('.carousel-inner > div:not(.d-none)').clone();
    $('.visual-block').find('#carouselAll').find('.carousel-inner').append(elems);
    $(elems).find('video').attr('id', '');
    $('.visual-block').find('#carouselAll').find('.carousel-inner > div').removeClass('active');
    $('.visual-block').find('#carouselAll').find('.carousel-inner > div').first().addClass('active');
}



$(function() {
    RenderCarouselAll();
    $('.visual-block > .row > .col-12').addClass('d-none');
    $('.visual-block').find('[data-id="carousel_all"]').removeClass('d-none');    
});
