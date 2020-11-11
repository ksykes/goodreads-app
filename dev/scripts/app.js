function getBookInformation() {
	$.get('goodreadsHttpHandler.ashx', {
		bookAuthor: $('#authorTextbox').val(),
		bookTitle: $('#titleTextbox').val()
	}, function(data) {
	});
}