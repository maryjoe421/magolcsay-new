jQuery(function($) {

	var adminbar = "adminbar.php",
		basePath = "../magolcsay/",
		trackPath = basePath + "file/",
		logoMandalaPath = basePath + "picture/",
		logoMandalaJSON = "logo-mandala.json",
		ashesOfCowsJSON = "ashes-of-cows.json",
		specialContent = "ashes_of_cows",

		langCode = window.navigator.userLanguage || window.navigator.language,
		language = (jQuery.cookie("language") !== null) ? jQuery.cookie("language") : (langCode.length > 2) ? langCode.substring(0, 2) : langCode,

		siteHash = document.location.hash;


	function isPlaying() {
		var playbar = jQuery("#jplayer_play_bar").css("width");
		if (jQuery(".jp-playlist-player")[0]) {
			if (parseInt(playbar.replace("px", "")) > 0) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	function initScroll(scrolling) {
		jQuery(".scroll-pane").each(function() {
			jQuery(this).bind("jsp-scroll-y", function(event, scrollPositionY, isAtTop, isAtBottom) {
				var jspPaneHeight = jQuery(this).find(".jspPane").outerHeight(), // 3272
					jspPaneTopPos = jQuery(this).find(".jspPane").position().top, // -2742
					parentHeight = jQuery(this).find(".jspContainer").height(); // 530

				// console.log("Handle jsp-scroll-y", this, "scrollPositionY=", scrollPositionY, "isAtTop=", isAtTop, "isAtBottom=", isAtBottom, "jspPaneHeight:", jspPaneHeight, "jspPaneTopPos:", jspPaneTopPos, "parentHeight:", parentHeight);

				if (isAtBottom === true) {
					if ((jspPaneHeight + jspPaneTopPos) !== parentHeight) {
						initScroll();
					}
				}

			}).jScrollPane({
				animateScroll: true,
				scrollbarWidth: 10
			});
			var api = jQuery(this).data("jsp");
			api.reinitialise();
			if (scrolling) {
				api.scrollTo(0, scrolling);
			}
		});
	}

	function emailDeform() {
		jQuery("a[href*='mailto']").each(function() {
			var mailhref = jQuery(this).attr("href").replace("[at]", "@").replace("[dot]", ".");
			var mailtext = jQuery(this).text().replace("[at]", "@").replace("[dot]", ".");
			jQuery(this).attr("href", mailhref);
			jQuery(this).text(mailtext);
		});
	}

	function setLinkTarget() {
		jQuery("a[href*='http']").each(function() {
			jQuery(this).attr("target", "_blank");
		});
	}

	function setSinglePlayerWrapper() {
		jQuery("a[href^='?']").each(function() {
			jQuery(this).wrap('<span class="player-wrapper" />');
		});
	}

	function setImageWrapper() {
		jQuery("#workshop_container .text-content, #things_container .text-content, #events_container .text-content").find("img").each(function() {
			if (jQuery(this).parent().get(0).tagName !== "A") {
				jQuery(this).wrap('<a href="' + jQuery(this).attr("src") + '" class="js-wrapped" rel="clearbox"></a>');
			}
		});
	}

	function loadContent(item) {
		var itemContainer = jQuery("#" + item + "_container");
		jQuery('<div class="loader-ear" />').appendTo("body");
		jQuery.ajax({
			url: item + ".php",
			async: true,
			success: function(result, status, xhr) {
				// console.log(result, status, xhr);
				if (status === "success") { jQuery(".loader-ear").remove(); }
				itemContainer.html(result);
			},
			beforeSend: function(xhr) {
				// console.log(xhr);
			},
			error: function(xhr, status, error) {
				// console.log(xhr, status, error);
			},
			complete: function(xhr, status) {
				// console.log(xhr, status);
				loadJSONContent(item);
			}
		});
	}

	function showContent(item) {
		if (item !== specialContent || isPlaying() === false) {
			// loadContent(item);
			loadJSONContent(item);
		}
		var itemContainer = jQuery("#" + item + "_container");
		jQuery(".section-layer").fadeIn("fast", function() {
			itemContainer.fadeIn("fast", function() {
				setSinglePlayerWrapper();
				setImageWrapper();
				setLinkTarget();
				emailDeform();
				if (itemContainer.find(".holder").attr("lang")) {
					jQuery(".language").fadeIn("fast", function() {
						jQuery(".language").attr("rel", item + "_container");
						jQuery(".language a").removeClass("active");
						jQuery(".language a[href='#" + language + "']").addClass("active");
					});
					itemContainer.find(".holder").hide();
					itemContainer.find(".holder[lang='" + language + "']").fadeIn("fast");
				} else {
					itemContainer.find(".holder").hide();
					itemContainer.find(".holder:eq(0)").fadeIn("fast");
				}
				initScroll(0);
			});
		});
	}

	function loadJSONContent(item) {
		if (item === "logo_mandala") {
			// load logo-mandala
			jQuery.getJSON(logoMandalaJSON, function(data) {
				var group, mandalaList = [];
				jQuery.each(data.logo_mandala, function(index, logo_mandala) {
					group = logo_mandala.group;
					jQuery.each(logo_mandala.items, function(index, items) {
						mandalaList.push('<li><a href="' + logoMandalaPath + items.href + '" rel="clearbox[gallery=logo-mandala,,comment=' + group + ']" title="' + items.title + '"><img src="' + logoMandalaPath + items.href + '" class="' + items.class + '" alt="" /></a></li>');
					});
				});
				jQuery("<ul/>", {
					html: mandalaList.join("")
				}).appendTo("#" + item + "_container .gallery");
				initScroll(0);
			});
		}
		if (item === "ashes_of_cows") {
			// load tracks
			jQuery.getJSON(ashesOfCowsJSON, function(data) {
				var trackList = [];
				jQuery.each(data.track, function(index, track) {
					trackList.push('<li><a href="#' + track.id + '" title="' + track.title + '">' + track.title + '</a><em>' + track.length + '</em></li>');
				});
				jQuery("<ul/>", {
					html: trackList.join("")
				}).appendTo("#" + item + "_container .tracks");
				initScroll(0);
			}).done(function() {
				createPlayList();
				jPlayerAdvancedHtml();
			});
		}
	}


	// menuitems hover
	jQuery(".menu a").hover(function() {
		jQuery(this).parent().addClass("over");
	}, function() {
		jQuery(this).parent().removeClass("over");
	});

	// bio, events, contact, publications hover
	jQuery("#bio a, #events a, #contact a, #publications a").hover(function() {
		jQuery(this).find("> span").fadeIn("slow");
	}, function() {
		jQuery(this).find("> span").fadeOut("slow");
	});

	// logo-mandala hover
	jQuery("#logo_mandala a").hover(function() {
		jQuery(this).find("> span").fadeIn("slow").arctext({
			radius: 10,
			dir: -1
		});
	}, function() {
		jQuery(this).find("> span").fadeOut("slow");
	});

	// workshop hover
	jQuery("#workshop a").hover(function() {
		jQuery(this).find("> span").show().stop().animate({"bottom": "130px"}, 1800);
	}, function() {
		jQuery(this).find("> span").stop().animate({"bottom": "800px"}, 1800, function() {
			jQuery(this).hide();
		});
	});

	// ashes of cows hover
	jQuery("#ashes_of_cows a").hover(function() {
		jQuery(this).find("> span").fadeIn("slow").arctext({
			radius: 10
		});
	}, function() {
		jQuery(this).find("> span").fadeOut("slow");
	});

	// things hover
	jQuery("#things a").hover(function() {
		jQuery(this).find("> span").show().stop().animate({"bottom": "45px"}, 400);
	}, function() {
		jQuery(this).find("> span").stop().animate({"bottom": "-30px"}, 400, function() {
			jQuery(this).hide();
		});
	});

	// menuitem click
	jQuery(".menu a").click(function(event) {
		// event.preventDefault();
		_gaq.push(["_trackEvent", "menu", jQuery(this).attr("title")]);
		var item = jQuery(this).attr("href").substr(1);
		showContent(item);
	});

	// language change
	jQuery(document).on("click", ".language a", function(event) {
		event.preventDefault();
		var langcode = jQuery(this).attr("href").substr(1),
			section = jQuery("#" + jQuery(".language").attr("rel"));
		section.find(".holder").hide();
		section.find(".holder[lang='" + langcode + "']").fadeIn("fast");
		jQuery(".language a").removeClass("active");
		jQuery(".language a[href='#" + langcode + "']").addClass("active");
		jQuery.cookie("language", langcode, { expires: 365, path: '/' });
		initScroll(0);
	});

	// hide panels
	jQuery(document).on("click", ".close", function(event) {
		// event.preventDefault();
		var item = jQuery(this).parents("section").attr("id");
		jQuery("#" + item).hide("fast", function() {
			jQuery(".section-layer").fadeOut("fast");
			jQuery(".language").fadeOut("fast").attr("rel", "");
			if (isPlaying() === false) {
				jQuery(this).empty();
				jQuery(".footer").empty();
			}
		});
	});

	// opens single player
	jQuery(document).on("click", ".player-wrapper > a", function(event) {
		event.preventDefault();
		jQuery(".simple-player").remove();
		var mp3File = jQuery(this).attr("href").substr(1),
			simplePlayerHtml = '' +
		'<div class="simple-player">' +
			'<div id="jquery_jplayer_simple"></div>' +
			'<div class="jp-playlist-player">' +
				'<div class="jp-interface">' +
					'<ul class="jp-controls">' +
						'<li><a href="#" id="jplayer_close" class="jp-close" title="Bezár">close</a></li>' +
						'<li><a href="#" id="jplayer_play" class="jp-play" tabindex="1">play</a></li>' +
						'<li><a href="#" id="jplayer_pause" class="jp-pause" tabindex="1">pause</a></li>' +
						'<li><a href="#" id="jplayer_stop" class="jp-stop" tabindex="1">stop</a></li>' +
					'</ul>' +
					'<div id="jplayer_simple_play_time" class="jp-play-time"></div>' +
					'<div class="jp-progress">' +
						'<div id="jplayer_load_bar" class="jp-load-bar">' +
							'<div id="jplayer_play_bar" class="jp-play-bar"></div>' +
						'</div>' +
					'</div>' +
					'<div id="jplayer_simple_total_time" class="jp-total-time"></div>' +
					'<div id="jplayer_volume_bar" class="jp-volume-bar">' +
						'<div id="jplayer_volume_bar_value" class="jp-volume-bar-value"></div>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>';
		jQuery(this).parent().append(simplePlayerHtml);
		jQuery("#jquery_jplayer_simple").jPlayer({
			ready: function() {
				playListInit(false);
			},
			swfPath: "flash"
		}).jPlayer("onProgressChange", function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) {
			jQuery("#jplayer_simple_play_time").text(jQuery.jPlayer.convertTime(playedTime));
			jQuery("#jplayer_simple_total_time").text(jQuery.jPlayer.convertTime(totalTime));
		}).jPlayer("setFile", trackPath + mp3File + ".mp3");
	});

	// Close single player
	jQuery(document).on("click", "#jplayer_close", function(event) {
		event.preventDefault();
		jQuery(".simple-player").remove();
	});

	// playing tracks
	jQuery(document).on("click", ".tracks a", function(event) {
		event.preventDefault();
		_gaq.push(["_trackEvent", "ashes of cows", jQuery(this).attr("title")]);
		var pos = jQuery("#jplayer_playlist ul").find('a[href="' + trackPath + jQuery(this).attr("href").substr(1) + '.mp3"]').parent().index();
		playListChange(pos);
	});

	// loading adminbar
	jQuery.ajax({
		url: adminbar,
		success: function(html) {
			jQuery("body").prepend(html);
		}
	});

	// login stripe slide toggle
	if (jQuery(".header")[0]) {
		jQuery(".header").stop().animate({"top": "-30px"}, 250).hover(function() {
			jQuery(this).stop().animate({"top": 0}, 250);
		}, function() {
			jQuery(this).stop().animate({"top": "-30px"}, 250);
		});
	}


	// open panel by hash
	if (siteHash !== "") {
		showContent(siteHash.substr(1));
	}

	// player previous button
	jQuery(document).on("click", "#jplayer_previous", function(event) {
		event.preventDefault();
		playListPrev();
		jQuery(this).blur();
	});

	// player next button
	jQuery(document).on("click", "#jplayer_next", function(event) {
		event.preventDefault();
		playListNext();
		jQuery(this).blur();
	});


	var playItem = 0;
	var myPlayList;

	function jPlayerAdvancedHtml() {
		var advancedPlayerHtml = '' +
		'<div class="advanced-player">' +
			'<div id="jquery_jplayer_advanced"></div>' +
			'<div class="jp-playlist-player">' +
				'<div class="jp-interface">' +
					'<ul class="jp-controls">' +
						'<li><a href="#" id="jplayer_play" class="jp-play" tabindex="1">play</a></li>' +
						'<li><a href="#" id="jplayer_pause" class="jp-pause" tabindex="1">pause</a></li>' +
						'<li><a href="#" id="jplayer_stop" class="jp-stop" tabindex="1">stop</a></li>' +
						'<li><a href="#" id="jplayer_previous" class="jp-previous" tabindex="1">previous</a></li>' +
						'<li><a href="#" id="jplayer_next" class="jp-next" tabindex="1">next</a></li>' +
					'</ul>' +
					'<div id="jplayer_play_time" class="jp-play-time"></div>' +
					'<div class="jp-progress">' +
						'<div id="jplayer_load_bar" class="jp-load-bar">' +
							'<div id="jplayer_play_bar" class="jp-play-bar"></div>' +
						'</div>' +
					'</div>' +
					'<div id="jplayer_total_time" class="jp-total-time"></div>' +
					'<div id="jplayer_volume_bar" class="jp-volume-bar">' +
						'<div id="jplayer_volume_bar_value" class="jp-volume-bar-value"></div>' +
					'</div>' +
				'</div>' +
				'<div id="jplayer_playlist" class="jp-playlist">' +
					'<ul></ul>' +
				'</div>' +
			'</div>' +
		'</div>';
		jQuery(".footer").html(advancedPlayerHtml).fadeIn("fast");
		// jplayer
		jQuery("#jquery_jplayer_advanced").jPlayer({
			ready: function() {
				displayPlayList();
				playListInit(false);
			},
			swfPath: "flash"
		}).jPlayer("onProgressChange", function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) {
			jQuery("#jplayer_play_time").text(jQuery.jPlayer.convertTime(playedTime));
			jQuery("#jplayer_total_time").text(jQuery.jPlayer.convertTime(totalTime));
		}).jPlayer("onSoundComplete", function() {
			playListNext();
		});
	}

	function createPlayList() {
		var items = jQuery(".tracks:eq(0)").find("a").toArray(),
			array = [];
		for (var i = 0; i < items.length; i++) {
			array.push('{name: "' + items[i].innerHTML + '", mp3: "' + trackPath + items[i].href.substring(items[i].href.indexOf("#") + 1, items[i].href.length) + '.mp3"}');
		}
		myPlayList = eval("[" + array.join(",") + "];");
	}

	function displayPlayList() {
		jQuery("#jplayer_playlist ul").empty();
		for (i=0; i < myPlayList.length; i++) {
			var listItem = (i === myPlayList.length - 1) ? '<li class="jplayer_playlist_item_last">' : '<li>';
			listItem += '<a href="' + myPlayList[i].mp3 + '" id="jplayer_playlist_item_' + i + '" tabindex="1">' + myPlayList[i].name + '</a></li>';
			jQuery("#jplayer_playlist ul").append(listItem);
			jQuery("#jplayer_playlist ul").data("index", i).on("click", "#jplayer_playlist_item_" + i, function(event) {
				event.preventDefault();
				var index = jQuery(this).data("index");
				if (playItem !== index) {
					playListChange(index);
				} else {
					jQuery("#jquery_jplayer_advanced").jPlayer("play");
				}
				jQuery(this).blur();
			});
		}
	}

	function playListInit(autoplay) {
		if(autoplay) {
			playListChange(playItem);
		} else {
			playListConfig(playItem);
		}
	}

	function playListConfig(index) {
		jQuery("#jplayer_playlist_item_" + playItem).removeClass("jplayer_playlist_current").parent().removeClass("jplayer_playlist_current");
		jQuery("#jplayer_playlist_item_" + index).addClass("jplayer_playlist_current").parent().addClass("jplayer_playlist_current");
		var actualItem = jQuery(".jplayer_playlist_current").position().top;
		jQuery(".jp-playlist > ul").hide().css("top", "-" + actualItem + "px").fadeIn("slow");
		playItem = index;
		jQuery("#jquery_jplayer_advanced").jPlayer("setFile", myPlayList[playItem].mp3);
	}

	function playListChange(index) {
		playListConfig(index);
		jQuery("#jquery_jplayer_advanced").jPlayer("play");
	}

	function playListNext() {
		var index = (playItem + 1 < myPlayList.length) ? playItem + 1 : 0;
		playListChange(index);
	}

	function playListPrev() {
		var index = (playItem - 1 >= 0) ? playItem - 1 : myPlayList.length - 1;
		playListChange(index);
	}


});