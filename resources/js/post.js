var input = $('#editor .input')
$('#editor .show').html(marked(input.val()))
input.on('input', function() {
    $('#editor .show').html(marked($(this).val()))
})
function setData(key, value) {
    localStorage.setItem(key, value)
}
function delData(key) {
    localStorage.removeItem(key)
}
function getData() {
    var content = localStorage.getItem('post-content');
    var title = localStorage.getItem('post-title');
    if (title) {
        $('#post-title').val(title)
    }
    if (content) {
        $('#post-content').val(content)
    }  
}
window.onload = function() {
    getData()
}
var key_title = 'post-title';
var key_content = 'post-content';
$('#post-content').keyup(function() {
    var content = $(this).val();
    setData(key_content, content)
});
$('#post-title').keyup(function() {
    var title = $(this).val();
    setData(key_title, title)
});
$('#post-from').submit(function() {
    delData(key_title)
    delData(key_content)
})