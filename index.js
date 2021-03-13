// список роликов и св-ва для них
const playerConfig = {};

// инициализация видео-роликов и событий для них
function initVideos() {
	if (window.innerWidth < 992) return false;

	const videos = document.querySelectorAll('.js-video-element');

	for (let i = 0; i < videos.length; i++) {
		const videoWrap = videos[i];
		const video = videoWrap.querySelector('[data-video-id]');
		const id = video.getAttribute('data-video-id');

		if (!playerConfig.list) {
			playerConfig.list = {};
		}

		playerConfig.list[id] = {
			index: i,
			wrap: videoWrap
		};

		videoWrap.onmouseover = function() {
			if (window.innerWidth < 992) return false;

			playerConfig.list[id].play = true;

			if (!playerConfig.initYoutubeAPI) {
				initYoutubeAPI();
			} else if (playerConfig.APIReady) {
				checkInitVideoFrames();
			}

			if (playerConfig.list[id].inited) {
				playerConfig.list[id].player.playVideo();
			}
		}

		videoWrap.onmouseout = function() {
			playerConfig.list[id].play = false;

			if (playerConfig.list[id].inited) {
				playerConfig.list[id].player.pauseVideo();
			}
		}

		setTimeout(function() {
			playerConfig.endTimeout = true;
			if (!playerConfig.initYoutubeAPI) {
				initYoutubeAPI();
			} else if (playerConfig.APIReady) {
				checkInitVideoFrames();
			}
		}, 4000);
	}
}

// добавление скриптов для работы с api youtube
function initYoutubeAPI() {
	playerConfig.initYoutubeAPI = true;

	const tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";

	const firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// событие готовности api youtube
function onYouTubeIframeAPIReady() {
	playerConfig.APIReady = true;

	checkInitVideoFrames();
}

// проверка инициализации фреймов
function checkInitVideoFrames() {
	for (const id in playerConfig.list) {
		const element = playerConfig.list[id];
		if (
			!element.wrap.getAttribute('data-id') &&
			(playerConfig.endTimeout || element.play !== undefined)
		) {
			initVideoFrame(element.index, id, element.wrap);
		}
	}
}

// инициализация фреймов с помощью api youtube
function initVideoFrame(i, id, videoWrap) {
	const video = videoWrap.querySelector('[data-video-id]');

	videoWrap.setAttribute('data-id', id);
	video.setAttribute('id', 'player-' + i);

	playerConfig.list[id].player = new YT.Player('player-' + i, {
		height: '360',
		width: '640',
		videoId: id,
		playerVars: {
			autoplay: 0,
			controls: 0,
			disablekb: 1,
			hl: 'ru-ru',
			loop: 1,
			modestbranding: 1,
			showinfo: 0,
			autohide: 1,
			iv_load_policy: 3,
			rel: 0
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});

	function onPlayerReady(e) {
		playerConfig.list[id].inited = true;
		playerConfig.list[id].player.mute();
		if (playerConfig.list[id].play) playerConfig.list[id].player.playVideo();
	}

	function onPlayerStateChange(e) {
		let action;

		if (e.data == 1) {
			action = 'play';
		} else if (e.data == 2) {
			action = 'pause';
		}

		if (action !== undefined) {
			videoWrap.setAttribute('data-action', action);
		}
	}
}

document.addEventListener("DOMContentLoaded", () => {
	initVideos();
});