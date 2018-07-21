document.addEventListener('DOMContentLoaded', function () {
    var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if ($navbarBurgers.length > 0) {
        $navbarBurgers.forEach(function ($el) {
            $el.addEventListener('click', function () {
                var target = $el.dataset.target;
                var $target = document.getElementById(target);
                $el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }
});

$(function(){
    if ($('.notifications')) {
        setTimeout(function(){
            $('.notifications').fadeOut()
        }, 3000)
    }
})

function showDialog() {
    swal({ 
            text: '请先登录：）', 
            type: 'warning',
            showCancelButton: true, 
            cancelButtonText: '取消',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '登录', 
            showCloseButton: true,
        }).then(function(dismiss) {
            if (dismiss.value === true) {
                window.location = '/signin';
            }
        })
}
$('#comment').click(function() {
    if (!is_login) {
        showDialog();
    }
});
$('#content').keydown(function() {
    if (!is_login) {
        showDialog();
    }
})
