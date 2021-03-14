// список роликов и св-ва для них
const playerConfig = {
	list: {}
};

// инициализация видео-роликов и событий для них
function controlVideoFrames(selector, options) {
	if (window.innerWidth < options.minWidth) return false;

	const videos = document.querySelectorAll(selector);
	const dateNow = Date.now();

	for (let i = 0; i < videos.length; i++) {
		const videoWrap = videos[i];
		const video = videoWrap.querySelector('[data-video]');
		const id = video.getAttribute('data-id');
		const uniqueId = dateNow + i;

		if (videoWrap.classList.contains('inited')) return false;

		playerConfig.list[uniqueId] = {
			id: id,
			wrap: videoWrap
		};

		videoWrap.classList.add('inited');

		videoWrap.onmouseover = function() {
			if (window.innerWidth < options.minWidth) return false;

			playerConfig.list[uniqueId].play = true;

			if (!playerConfig.initYoutubeAPI) {
				initYoutubeAPI();
			} else if (playerConfig.APIReady) {
				checkInitVideoFrames();
			}

			if (playerConfig.list[uniqueId].inited) {
				playerConfig.list[uniqueId].player.playVideo();
			}
		}

		videoWrap.onmouseout = function() {
			playerConfig.list[uniqueId].play = false;

			if (playerConfig.list[uniqueId].inited) {
				playerConfig.list[uniqueId].player.pauseVideo();
			}
		}

		if (options.timeout !== undefined) {
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
	for (const uniqueId in playerConfig.list) {
		const element = playerConfig.list[uniqueId];
		const id = element.id;
		if (
			!element.wrap.getAttribute('data-id') &&
			(playerConfig.endTimeout || element.play !== undefined)
		) {
			initVideoFrame(uniqueId, id, element.wrap);
		}
	}
}

// инициализация фреймов с помощью api youtube
function initVideoFrame(uniqueId, id, videoWrap) {
	const video = videoWrap.querySelector('[data-video]');

	videoWrap.setAttribute('data-id', id);
	video.setAttribute('id', uniqueId);

	playerConfig.list[uniqueId].player = new YT.Player(uniqueId, {
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
		playerConfig.list[uniqueId].inited = true;
		playerConfig.list[uniqueId].player.mute();
		if (playerConfig.list[uniqueId].play) playerConfig.list[uniqueId].player.playVideo();
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