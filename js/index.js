//Implement the red light using jQuery. Don't forget to add the script tags.
$(document).ready(function() {

	function clearLights() {
		$('.bulb').css('background-color', 'black');
	}

	function illuminateStopLightRed() {
		clearLights();
		$('#stopLight').css('background-color', 'red');
	}

	// COde goes here!
	$('#stopButton').click(illuminateStopLightRed);

	function illuminateStopLightYellow() {
		clearLights();
		$('#slowLight').css('background-color', 'yellow');
	}
	$('#slowButton').click(illuminateStopLightYellow);

	function illuminateStopLightGreen() {
		clearLights();
		$('#goLight').css('background-color', 'Green');
	}
	$('#goButton').click(illuminateStopLightGreen);


});
