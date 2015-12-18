var mopidy = new Mopidy({
    webSocketUrl: "ws://localhost:6680/mopidy/ws/",
    callingConvention: "by-position-or-by-name"
});

var playing = true;

mopidy.on(console.log.bind(console));

mopidy.on("event:playbackStateChanged", function(event) {
    if (event.new_state == "playing") {
        $("#pause-play").removeClass("fa-play").addClass("fa-pause");
        playing = true;
    } else {
        $("#pause-play").removeClass("fa-pause").addClass("fa-play");
        playing = false;
    }
});

mopidy.on("event:trackPlaybackResumed", function(event) {
    $(".info .title").text(event.tl_track.track.name);
    $(".info img").attr("src", event.tl_track.track.album.images[0]);
});

mopidy.on("event:trackPlaybackPaused", function(event) {
    $(".info .title").text(event.tl_track.track.name);
    $(".info img").attr("src", event.tl_track.track.album.images[0]);
});

mopidy.on("event:trackPlaybackStarted", function(event) {
    $(".info .title").text(event.tl_track.track.name);
    $(".info img").attr("src", event.tl_track.track.album.images[0]);
});

mopidy.on("state:online", function() {
    load(null);
});

function showTracks(uris, names) {
    mopidy.library.getImages({"uris":uris}).then(function(image){
        console.log(image);
        for (var i = 0; i<uris.length; i++) {
            uri = image[uris[i]][0].uri;
            $("#music").append('<div class="track track-music" uri="' + uris[i] + '"><img src="' + uri + '" alt=""><a href="#">' + names[i] + '</a></div>');
        }
        $(".track-music").unbind("click").bind("click",function(event){
            mopidy.tracklist.add({"tracks":null,"at_position":null,"uri":$(this).attr("uri"),"uris":null}).then(function(data){
                console.log(data);
            });
        });
        $('.loader').remove();
    });
}

function load(uri) {
    $("body").append('<div class="loader"></div>');
    $("#music").html("");
    mopidy.library.browse({"uri": uri}).then(function (data) {
        console.log(data);
        var uris = [];
        var names = [];
        for (var i = 0; i < data.length; i++) {
            var name = data[i].name.replace("%2526","").replace("%2526","").replace("%2526","").replace("%2B"," ").replace("%2B"," ").replace("%2B"," ");
            if (data[i]["type"] != "track") {
                $("#music").append('<div class="track directory" uri="'+data[i].uri+'"><div class="image-container"><img src="http://4.bp.blogspot.com/-FZ99t2pXdNg/U3S1TJOjVhI/AAAAAAAAAEc/DFr8Z6NAFPI/s1600/folder-icon.png" alt=""></div><a href="#">' + name + '</a></div>');
            } else {
                names.push(name);
                uris.push(data[i].uri);

            }
        }
        showTracks(uris,names);
        $(".directory").unbind("click").bind("click",function(event){
            load($(this).attr("uri"));
        });
    });
}

$("#pause-play").click(function(event) {
    if (playing) {
        mopidy.playback.pause();
    } else {
        mopidy.playback.resume();
    }
});

$("#next").click(function(event) {
    mopidy.playback.next();
});

$("#prev").click(function(event) {
    mopidy.playback.previous();
});

$(".bar .extend").click(function(event) {
    $('.info').toggleClass("extended");
    $(".bar .extend").toggleClass("fa-caret-up").toggleClass("fa-caret-down");
    $(".info .songs").html("");

    mopidy.tracklist.getTlTracks({}).then(function(data){
        console.log(data);
        for (i in data) {
            id = data[i].tlid;
            song = data[i].track;
            console.log(song);
            $(".info .songs").append('<div class="song" uri="+song.uri+" id="'+id+'"><div class="image"><img src="'+song.album.images[0]+'" alt=""></div><a href="" class="title">'+song.name+'</a></div>');
        }

        $(".info .songs .song").unbind("click").bind("click",function(event){
            mopidy.playback.play({"tlid":$(this).attr("data")}).then(function(data){
                console.log(data);
            });
        });
    });
});