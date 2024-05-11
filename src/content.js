window.onload = function() {
    // Get title and image urls
    let pretty = document.querySelector(".pretty").innerText;
    let author = document.querySelector(".before").innerText;
    let title = pretty + " " + author;
    let imageUrls = [];
    let exts = []
    let thumbs = document.querySelectorAll(".thumb-container");
    for (let i = 0; i < thumbs.length; i++) {
        let thumb = thumbs[i];
        let thumbUrl = thumb.querySelector("img").getAttribute("data-src");
        let id = thumbUrl.split("/")[4];
        let ext = thumbUrl.split(".").pop();
        let imageUrl = `https://i.nhentai.net/galleries/${id}/${i + 1}.${ext}`;
        exts.push(ext);
        imageUrls.push(imageUrl);
    }

    // Send the information to popup.js
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.greeting === "NHentai") {
                sendResponse({
                    title: title,
                    imageUrls: imageUrls,
                    exts: exts
                });
            }
        }
    );
}