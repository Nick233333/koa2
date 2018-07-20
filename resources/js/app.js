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
        }, 2000)
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
function setData(key, value) {
    localStorage.setItem(key, value)
}
function delData(key) {
    localStorage.removeItem(key)
}
var title = 'post-title';
var content = 'post-content';
$('#post-content').keydown(function() {
    var content = $(this).val();
    setData(title, content)
});
$('#post-title').keydown(function() {
    var title = $(this).val();
    setData(content, title)
});
$('#post-from').submit(function() {
    delData(title)
    delData(content)
})

