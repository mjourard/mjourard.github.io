(function() {
    let $footerCurYear = document.querySelector('#footer-current-year')
    let now = new Date();
    $footerCurYear.innerText = now.getFullYear();
})();
