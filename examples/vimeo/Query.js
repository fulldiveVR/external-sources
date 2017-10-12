function execute(params) {
    var content = Global.execute({
        name: "download",
        url: "https://player.vimeo.com/video/" + params.id,
        verb: "GET",
        headers: [
            {name: "User-Agent", value: "Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev>(KHTML, like Gecko) Chrome/<Chrome Rev> Safari/<WebKit Rev>"}
        ]
    }).body;

    var contentArray = content.match(/"progressive":\[(.*?)\]/);
    var results = [];

    if (contentArray !== null) {
        var arr = contentArray[1].match(/{.*?}/g);
        arr.forEach(function (item, i) {
            var jsonItem = JSON.parse(item);
            results.push({
                videoStreamUrl: jsonItem.url,
                audioStreamUrl: null,
                quality: jsonItem.quality,
                "default": false
            });
        });
    }

    results.sort(function (first, second) {
        var firstQuality = parseInt(first.quality);
        var secondQuality = parseInt(second.quality);

        if (isNaN(firstQuality) && isNaN(secondQuality)) return 0;
        if (isNaN(firstQuality)) return -1;
        if (isNaN(secondQuality)) return 1;

        return firstQuality - secondQuality;
    });

    var l = results.length;
    if (l > 0) results[l - 1].default = true;
 
    return {results: results};
}
