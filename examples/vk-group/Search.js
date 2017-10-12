function execute(params){
    var pager = {
        skip: params.skip || 0,
        count: params.count || 1000
    };
    var q = params.query;
    var content = Global.execute({
        name: 'download',
        verb: 'POST',
        url: 'http://vk.com/al_video.php',
        body: 'act=load_videos_silent&al=1&need_albums=0&offset=0&oid=-154422913&rowlen=3&section=all',
        headers: [
            {name: 'Cookie', value: 'remixseenads=0; remixflash=0.0.0; remixscreen_depth=24; remixvkcom=1; remixdt=0; remixrt=1; remixlang=3;'},
            {name: 'Referer', value: 'http://vk.com/videos-154422913'},
            {name: 'Content-Type', value: 'application/x-www-form-urlencoded'},
            {name: 'Accept-Charset', value: 'utf-8' },
            {name: 'User-Agent', value: 'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'}
        ]
    }).body;

    var jsonContent = "";
    content.split("<!>").forEach(function (x) {
        if(x.lastIndexOf("<!json>", 0) === 0) jsonContent = x.substring(7)
    });

    var results = [];

    JSON.parse(jsonContent).all.list.forEach(function(x){
        var totalTime = 0;
        var times = x[5].split(":").reverse();
        for(var i = 0; i < times.length; i++){
            var multiplicator = Math.pow(60, i);
            totalTime = totalTime +  (times[i] * multiplicator);
        };

        if(x[3].toUpperCase().includes(q.toUpperCase())) {
            var res = {
                id: x[0] + "|" + x[1],
                title: x[3],
                previewUrl: x[2],
                description: "",
                lengthInSeconds: totalTime
            };

            results.push(res);
        }
    });

    return { results: results.slice(pager.skip, pager.skip + pager.count) };
}
