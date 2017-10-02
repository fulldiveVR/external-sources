function execute(params){
    var id = params.id;
    var content = Global.execute({
        name: 'download',
        verb: 'GET',
        url: 'https://vk.com/video' + id.replace("|","_"),
        headers: [
            {name: 'Cookie', value: 'remixseenads=0; remixflash=0.0.0; remixscreen_depth=24; remixvkcom=1; remixdt=0; remixrt=1; remixlang=3;'},
            {name: 'Referer', value: 'http://vk.com/videos-154422913'},
            {name: 'accept', value: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'},
            {name: 'Accept-Charset', value: 'utf-8' },
            {name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38'}
        ]
    }).body;

    var jsonContent = "";
    content.split("\n").forEach(function (x) {
        if(x.lastIndexOf("ajax.preload(", 0) === 0) jsonContent = x.substring(7);
    });

    var start = jsonContent.indexOf("[");
    var end = jsonContent.lastIndexOf("]") + 1;
    var arrayContent = jsonContent.substring(start, end);
    var config = JSON.parse(arrayContent)[5].player.params[0];

    var quality = [240,360,480,720,1080,1440];
    var results = [];
    quality.forEach(function (x) {
        var key = "url"+String(x);
        if(config[key]){
            var item = {
                videoStreamUrl: config[key],
                audioStreamUrl: null,
                quality: x,
                "default" : false
            };
            results.push(item);
        }
    });

    results[results.length-1].default = true;
    return { results: results };
}