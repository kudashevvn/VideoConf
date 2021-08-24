// Перевод изображений в формат webp
function testWebP(callback) {
	var webP = new Image();
	webP.onload = webP.onerror = function () {
		callback(webP.height == 2);
	};
	webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
};

// Бургер
const burger = document.querySelector('.header__burger');
const menu = document.querySelector('.mobile-menu');
if (burger) {
	burger.addEventListener("click", function (e) {
		burger.classList.toggle('_active');
		menu.classList.toggle('_active');
		document.body.classList.toggle('_lock');
	});
}

// Рейтинг
"use strict"

const ratings = document.querySelectorAll('.rating');

if (ratings.length > 0){
	initRatings();
}
function initRatings() {
	let ratingActive, ratingValue;
	for (let index = 0; index < ratings.length; index++){
		const rating = ratings[index];
		initRating(rating);
	}
	function initRating(rating) {
		initRatingVars(rating);
		setRatingActiveWeidth();
	}
	function initRatingVars(rating){
		ratingActive = rating.querySelector('.rating__active');
		ratingValue = rating.querySelector('.rating__value');
	}
	function setRatingActiveWeidth(index = ratingValue.innerHTML){
		const ratingActiveWidth = index / 0.05;
		ratingActive.style.width = `${ratingActiveWidth}%`;
	}
}