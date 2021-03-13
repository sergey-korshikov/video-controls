// список роликов и св-ва для них
const playerConfig = {};

// инициализация видео-роликов и событий для них
function controlVideoFrames(selector, options) {
	if (window.innerWidth < options.minWidth) return false;

	const videos = document.querySelectorAll(selector);

	for (let i = 0; i < videos.length; i++) {
		const videoWrap = videos[i];
		const video = videoWrap.querySelector('[data-video]');
		const id = video.getAttribute('id');

		if (videoWrap.classList.contains('inited')) return false;

		videoWrap.classList.add('inited');

		if (!playerConfig.list) {
			playerConfig.list = {};
		}

		playerConfig.list[id] = {
			wrap: videoWrap
		};

		videoWrap.onmouseover = function() {
			if (window.innerWidth < options.minWidth) return false;

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
		}, options.timeout);
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
			initVideoFrame(id, element.wrap);
		}
	}
}

// инициализация фреймов с помощью api youtube
function initVideoFrame(id, videoWrap) {
	videoWrap.setAttribute('data-id', id);

	playerConfig.list[id].player = new YT.Player(id, {
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