// Storing the information from content.js
let imageUrls = [];
let exts = [];
let title = '';

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "NHentai"}, function(response) {
            if (response.title) {
                // Set the information
                document.getElementById('input').value = response.title;

                // Show the download button and input field, because current tab is a nhentai page
                showElements();

                // Store the information
                imageUrls = response.imageUrls;
                title = response.title;
                exts = response.exts;
            }
        });
    });

    document.getElementById('download').addEventListener('click', downloadImages);
});

function showElements() {
    document.getElementById('download').style.display = 'block';
    document.getElementById('input').style.display = 'block';
    document.getElementById('progress-bar').style.display = 'block';
    document.getElementById('progress-text').style.display = 'block';
    document.getElementById('warning').style.display = 'none';
    let labels = document.getElementsByClassName('label');
    for(let i = 0; i < labels.length; i++) {
        labels[i].style.display = 'block';
    }
}

async function downloadImages() {
    let zip = new JSZip();
    let count = 0;

    for (let index = 0; index < imageUrls.length; index++) {
        let url = imageUrls[index];
        let blob = await fetchImage(url);
        let binaryString = await readAsArrayBuffer(blob);

        // Add the image to the zip file
        zip.file((index + 1) + '.' + exts[index], binaryString, {binary: true});

        count++;
        updateProgress(count, imageUrls.length);

        // If all images have been added, generate the zip file
        if (count === imageUrls.length) {
            let content = await zip.generateAsync({type: 'blob'});
            downloadZipFile(content);
        }
    }
}

function fetchImage(url) {
    return fetch(url)
        .then(response => response.blob())
        .catch(error => console.error('Failed to download image', error));
}

function readAsArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadend = function() {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}

function updateProgress(count, total) {
    document.getElementById('progress-bar').style.width = `${(count / total) * 100}%`;
    document.getElementById('progress-text').innerText = `${count} / ${total}`;
}

function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function downloadZipFile(content) {
    // Check cbz or zip from checkbox ternary operator
    let cbz = document.getElementById('cbz').checked;

    // Create a new Blob with the correct MIME type
    let newContent = new Blob([content], {type: 'application/octet-stream'});

    // Create a URL from the Blob
    let url = URL.createObjectURL(newContent);

    // Sanitize the filename
    let sanitizedTitle = sanitizeFilename(title);

    // Use Chrome Downloads API to download the file
    chrome.downloads.download({
        url: url,
        filename: sanitizedTitle + (cbz ? '.cbz' : '.zip'),
    }, function(downloadId) {
        if (chrome.runtime.lastError) {
            console.error('Failed to download zip file', chrome.runtime.lastError.message);
        } else {
            console.log('Zip file downloaded with ID:', downloadId);
        }

        // Revoke the URL to free up memory
        URL.revokeObjectURL(url);
    });
}