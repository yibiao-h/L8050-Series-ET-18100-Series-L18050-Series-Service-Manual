$(document).ready(function() {
    // left menu
    $(document).on('click tap', '.sidebar-button', function() {
        $('.sidebar').animate({
            width: "toggle"
        });
    });

    $(document).on('click tap touchstart', '.page', function(e) {
        var sidebar_button = $(document).find('.sidebar-button:visible').length;
        var sidebar = $(document).find('.sidebar');
        if (sidebar.length == 0) {
            return;
        }

        sidebar = sidebar[0];
        if (sidebar.contains(e.target) == false && $('.sidebar').css('display') != 'none') {
            $('.sidebar').css('display', 'none');
        }
    });

    $(document).on('click', '.sidebar-links a.icon', function(e) {
        var li = $(this).closest('li');
        var pageId = $(li).attr('data-page-id');
        if ($(this).hasClass('close')) {
            $(this).removeClass('close');
            $(this).addClass('open');
        } else {
            $(this).removeClass('open');
            $(this).addClass('close');
        }

        $('ul[data-parent-id="' + pageId + '"]').each(function(index, item) {
            if ($(this).css('display') === 'none') {
                $(this).css('display', 'block');
            } else {
                $(this).css('display', 'none');
            }
        });
    });

    // Scroll
    if ($(window).scrollTop() > 100) {
        $('.move-top').addClass('show');
    } else {
        $('.move-top').removeClass('show');
    }

    $(window).scroll(function() {
        if ($(window).scrollTop() > 100) {
            $('.move-top').addClass('show');
        } else {
            $('.move-top').removeClass('show');
        }
    });

    // Move top
    $('.move-top').on('click tap', function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, '100');
    });

    //Content slide menu
    $(document).on('click', '.slide_menu', function() {
        if ($(this).hasClass('hide') == true) {
            $(this).removeClass('hide');
        } else {
            $(this).addClass('hide');
        }
    });

    //Print
    $(document).on('click', '.header_printer', function() {
        window.print();
    });

    $(document).on('click', 'a[href^="#"]', function(e) {
        e.preventDefault();
        var href = $(this).attr("href");
        InnerJump(href);
    });

    var innerLinkId = location.hash;
    InnerJump(innerLinkId);

    function InnerJump(target_id) {

        if (target_id == "") return;

        target_id = decodeURI(target_id);
        if (target_id.indexOf("#") == 0) {
            target_id = target_id.substring(1);
        }

        $('.sidebar-links .anchor-link').removeClass('anchor-link-selected');
        $('.sidebar-links .anchor-link[href="#' + target_id + '"]').addClass('anchor-link-selected');
        var header = document.querySelector("header");
        var targets = $(document).find('[id="' + target_id + '"]');
        if (targets.length == 0) {
            return;
        }

        var target = targets[0];
        $(target).removeClass('hide');
        var header_height = header.clientHeight;
        var position = target.offsetTop - header_height - 15;
        window.scrollTo(0, position);
    };

    // Select page tree
    var selectLink = $('.sidebar-links .sidebar-selected-link');
    $(selectLink).parents('ul.sidebar-sub-headers').each(function(index, item) {
        var pageId = $(item).attr('data-parent-id');
        if ($('.sidebar-links a.icon[data-page-id="' + pageId + '"]').hasClass('close')) {
            $('.sidebar-links a.icon[data-page-id="' + pageId + '"]').removeClass('close').addClass('open');
        }

        $(item).css('display', 'block');
        $(item).find('ul.sidebar-sub-headers[data-parent-id="' + pageId + '"]').css('display', 'block');
    });

    var li = $(selectLink).parent();
    var pageId = $(li).attr('data-page-id');
    $(li).find('ul.sidebar-sub-headers[data-parent-id="' + pageId + '"]').css('display', 'block');
    if ($(li).children('a.icon').hasClass('close')) {
        $(li).children('a.icon').removeClass('close').addClass('open');
    }
});