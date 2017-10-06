function execute(params) {
    var skip = params.skip || 0;
    var requestCount = params.count || 90;
    var count = requestCount + skip;
    var page = 1;

    function getNextArrayOfContent(page) {
        var url = "https://vimeo.com/channels/360vr/videos/page:" + page + "/format:detail";
        var content = Global.execute({
            name: "download",
            url: url,
            verb: "GET",
            headers: [
                {name: "User-Agent", value: "Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev>(KHTML, like Gecko) Chrome/<Chrome Rev> Safari/<WebKit Rev>"}
            ]
        }).body;

        var htmlStr = content.substring(content.indexOf("<ol class"));
        htmlStr = htmlStr.substring(0, htmlStr.indexOf("</ol>") + 5);
        var arr = htmlStr.match(/<li class=[\s\S]+?<\/li>/gi);
        if (arr === null) return null;
        return arr;
    }

    var results = [];
    var contentArray = getNextArrayOfContent(page);

    while (count > 0) {
        if (contentArray === null) return {results: results.slice(skip, skip + requestCount)};

        for (var i = 0; i < contentArray.length; i++) {
            var item = contentArray[i];

            var titlePart = item.match(/(<p\sclass="title">)[\s\S]+?(<\/p>)/g);
            if (titlePart == null) return {results: results.slice(skip, skip + requestCount)};
            var idAndTitle = titlePart[0].match(/<a href="[\s\S]+?(\d+)">([\s\S]+)<\/a>/);
            var id = idAndTitle[1];
            var title = idAndTitle[2];

            var temp = item.match(/srcset="(.+?)\s2x"/);
            if (temp !== null) var previewUrl = temp[1].replace(/\\/g, "");
            else previewUrl = null;

            temp = item.match(/<p class="description">([\s\S]+?)<\/p>/);
            if (temp !== null) var description = temp[1].trim();
            else description = null;

            var lengthInSeconds = -1;
            temp = item.match(/<div class="duration">(\d+):(\d+)<\/div>/);
            var minutes = parseInt(temp[1]);
            var seconds = parseInt(temp[2]);
            if (!isNaN(minutes) && !isNaN(seconds)) lengthInSeconds = minutes * 60 + seconds;

            var res = {
                id: id,
                title: title,
                previewUrl: previewUrl,
                description: description,
                lengthInSeconds: lengthInSeconds
            };

            results.push(res);
            if (--count <= 0) return {results: results.slice(skip, skip + requestCount)};
        }

        contentArray = getNextArrayOfContent(++page);
    }

    return {results: results.slice(skip, skip + requestCount)};
}
