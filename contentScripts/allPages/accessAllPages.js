hideSidebar();

$(window).on('resize', function(){
    hideSidebar();
});

function hideSidebar() {
    $(window).width() < 1750 ? $('#cat, .back-cat').removeClass('active') : $('#cat, .back-cat').addClass('active');
}
