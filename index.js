/**
 * author - Heyramb Narayan Goyal
 * website - https://hey24sheep.com
 * repository - https://github.com/hey24sheep/cardscraper
 * copyright - MIT, 2021
 */
let cardsJson = null;
let providersJson = null;
let apiMode = 0;

// 0 = main, 1 = cards, 2 = providers
function scrapeAndProcess(am = 0) {
    apiMode = am;
    return fetch("https://en.wikipedia.org/wiki/Payment_card_number", {
        method: "GET",
    })
        .then(async (res) => {
            var htmlDoc = await responseToHTMLDocument(res);
            var table = findAndGetTable(htmlDoc);

            if (!table.rows) {
                console.log("error : table not found on wikipedia");
                alert("Table not found on Wikipedia!! Report the issue on Github");
            } else {
                processTable(table);
            }

            if (apiMode == 0 || apiMode == 1) {
                document.getElementById("cardsInfoJson").textContent = cardsJson;
            }

            if (apiMode == 0 || apiMode == 2) {
                document.getElementById("providerListJson").textContent = providersJson;
            }

            if (window) {
                window.cardsJson = cardsJson;
                window.providersJson = providersJson;
            }
        })
        .catch((err) => {
            console.log("error ", err);
            alert("Something went wrong!! Report the issue on Github");
        });
}

async function responseToHTMLDocument(res) {
    var rawHtml = await res.text();
    var htmlDoc = new DOMParser().parseFromString(rawHtml, "text/html");
    return htmlDoc;
}

function findAndGetTable(htmlDoc) {
    // NOTE : there is no id on wikipedia, use classname to identify
    var tables = htmlDoc.getElementsByClassName("wikitable");
    var t;
    if (tables && tables.length > 0) {
        for (var table of tables) {
            var headerInnerText = table.rows[0].innerText.trim().toLowerCase();

            // NOTE : there is no id on wikipedia, use header keys
            if (headerInnerText.includes("issuing network")
                && headerInnerText.includes("iin ranges")) {
                console.log("Found Table ", table);
                // processing table found, break
                t = table;
                break;
            }
        }
    }
    return t;
}

function processTable(table) {
    var cardsInfoList = [];
    var cardProviderList = [];
    var headerRowKeys = [];
    for (var r = 0; r < table.rows.length; r++) {
        var ci = {};
        var colCount = table.rows[0].cells.length;
        for (var c = 0; c < colCount; c++) {
            if (r === 0) {
                headerRowKeys.push(sanatizeValue(table.rows[r].cells[c].innerText));
            } else {
                var cellValue = sanatizeValue(getTableCell(table, c, r)?.innerText);
                ci[toCamelCase(headerRowKeys[c])] = cellValue;

                // create an arr of distinct card provider values
                if (c === 0) {
                    cardProviderList.push(cellValue)
                }
            }
        }
        if (ci && Object.keys(ci).length > 0) {
            cardsInfoList.push(ci);
        }
    }

    cardsJson = JSON.stringify(cardsInfoList, undefined, 2);
    providersJson = JSON.stringify(cardProviderList, undefined, 2);

    console.log(cardsJson);
    console.log(providersJson);

    return [
        cardsJson,
        providersJson
    ];
}

//#REGION UTILS

function sanatizeValue(str) {
    if (str) {
        str = str.trim();
        var crStr = removeCitationText(str);
        crStr = crStr.trim();
        return crStr.replaceAll('\n', '').trim();
    }
    return null;
}

function removeCitationText(str) {
    return str.replace(/\[.*?\]|\(.*?\)/g, '');
}

function toCamelCase(str) {
    return str.trim().toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

function copyToClipboard(event, str) {
    event.preventDefault();

    if (!navigator.clipboard) {
        // Clipboard API not available
        return;
    }
    try {
        navigator.clipboard.writeText(str.trim());
        if (apiMode === 0) {
            document.getElementById("copy-status").innerText = "Copied to clipboard";
            setTimeout(function () {
                document.getElementById("copy-status").innerText = "Click the JSON to copy";
            }, 1200);
        }
    } catch (err) {
        console.error("Failed to copy!", err);
    }
}

//#ENDREGION