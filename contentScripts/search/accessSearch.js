var commentaryWrongLink = $('a:contains(Comm.)')[0];
var hrefArray = commentaryWrongLink.href.split('&');
var searchArray = document.location.search.split('&');
if (searchArray.includes('order=desc') && searchArray.includes('sort=comment')) {
    hrefArray[hrefArray.length - 2] = 'order=asc';
}
hrefArray[hrefArray.length - 1] = 'sort=comment';
commentaryWrongLink.href = hrefArray.join('&');
