function execute(params) {
    var keywords = (params.keywords || "").replace(/\s/g, "+");
    var skip = params.skip || 0;
    var requestCount = params.count || 90;
    var count = requestCount + skip;
    var page = 1;

    function getNextJson(page, keywords) {
        var url = "https://vimeo.com/search/page:" + page + "?q=" + keywords;
        var content = Global.execute({
            name: "download",
            url: url,
            verb: "GET",
            headers: [
                {name: "User-Agent", value: "Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev>(KHTML, like Gecko) Chrome/<Chrome Rev> Safari/<WebKit Rev>"}
            ]
        }).body;

        var htmlStr = content.substring(content.indexOf("vimeo.config"));
        htmlStr = htmlStr.substring(htmlStr.indexOf('{}') + 2, htmlStr.indexOf('\n'));
        htmlStr = htmlStr.match(/\{.+\}/i);
        if (htmlStr === null) return null;
        return JSON.parse(htmlStr[0]);
    }

    var results = [];
    var contentJson = getNextJson(page, keywords);

    while (count > 0) {
        if (contentJson === null || !("api" in contentJson)) return {results: results.slice(skip, skip + requestCount)};

        var contentArray = contentJson.api.initial_json.data;
        for (var i = 0; i < contentArray.length; i++) {
            var item = contentArray[i];

            var uri = item.clip.uri.substring(item.clip.uri.lastIndexOf('/') + 1);
            var icon = item.clip.pictures.sizes[0].link.replace(/\\/g, "");
            var title = item.clip.name || "";

            var res = {
                id: uri,
                title: title,
                previewUrl: icon,
                description: title,
                lengthInSeconds: item.clip.duration
            };

            results.push(res);
            if (--count <= 0) return {results: results.slice(skip, skip + requestCount)};
        }

        contentJson = getNextJson(++page, keywords);
    }

    return {results: results.slice(skip, skip + requestCount)};
}
