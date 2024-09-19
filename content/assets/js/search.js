var HIGHT_LIGHT_STYLE = "background-color: #B4EBFA;";
var KEYWORD_PARAMETER_NAME = "k";
var DISPLAYE_PAGE_INDEX_PARAMETER_NAME = "page";
var BACK_URL_PARAMETER_NAME = "backto";
var NUMBER_OF_PAGE_PARAMETER_NAME = "numberOfPage";
var NUMBER_OF_PAGE_FIELD_ID = "numberOfPage";

var KEYWORD_LIMIT = 3;
var DISPLAY_PAGE_LIMIT = 200;
var SEARCH_RESULT_PAGE = "search.html";
var NUMBER_ROW_IN_PAGE = 2;
var paramterMap = {};
var searchResult = [];
var pageCount = 0;
var showpage = 0;
var CONTEXT_ID = "page-content";

// search

var path = /search.htm$/;
var path2 = /$/;
var FILE_NAME = 'search.html';

$(document).ready(function() {
    try {
        //パラメータを取得する)
        paramterMap　 = getParamterMap();

        //パラメータから項目にセットする
        setOldValue();

        NUMBER_ROW_IN_PAGE = parseInt($("#" + NUMBER_OF_PAGE_FIELD_ID).val(), 0);

        // 検索を実行する
        var href = getCurrentHref();
        if (href.indexOf(FILE_NAME) > -1) {
            doSearch();
        }

        rerenderHtml();

        window.scrollTo(0, 0);
        return;
    } catch (error) {
        console.log(error);
    }
});

function SearchWord_manual() {
    var keyword = document.getElementById("seek").value;
    var b = getCurrentHref();
    var bookname = "";
    location.href = SEARCH_RESULT_PAGE + '?' + KEYWORD_PARAMETER_NAME + '=' + encodeURIComponent(keyword) + '&' + BACK_URL_PARAMETER_NAME + '=' + encodeURIComponent(b) + '#1';
}

function rerenderHtml() {
    var w = paramterMap[KEYWORD_PARAMETER_NAME];
    if (isNullOrEmpty(w)) return;
    w = w.replace(/　/g, " ");
    w = w.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");

    var d = document.getElementById(CONTEXT_ID);

    var a = new Array();
    traverseDom(d, a);
    var n;
    while (n = a.pop()) {
        highlightKeyword(n, w);
    }
}

function checkSkipHighLight(c) {
    var attr = getAttribute(c, "class");
    if (isNullOrEmpty(attr)) {
        return false;
    }
    return attr.match("skipHighlight");
}

function traverseDom(root, a) {
    var c = root,
        n = null;
    var it = 0;
    do {
        n = c.firstChild;
        if (n == null || (c.nodeType == Node.ELEMENT_NODE && c.className == "relation") || checkSkipHighLight(n) || checkSkipHighLight(c)) {
            // visit c
            if (c.nodeType == Node.TEXT_NODE) {
                a.push(c);
            }
            // done visit c
            n = c.nextSibling;
        }

        if (n == null) {
            var tmp = c;
            do {
                n = tmp.parentNode;
                if (n == root)
                    break;
                try {
                    // visit n
                    if (n.nodeType == Node.TEXT_NODE) {
                        a.push(n);
                    }
                } catch (e) {
                    n = root;
                    break;
                }
                // done visit n
                tmp = n;
                n = n.nextSibling;
            } while (n == null)
        }
        c = n;
    } while (c != root);
    return;
}

function highlightKeyword(n, w) {
    var b = w.split(' ');
    for (var i = 0; i < b.length; i++) {
        b[i] = quotemeta(b[i])
    }

    var ww = b.join('|');

    var a = n.nodeValue.split(new RegExp("(" + ww + ")", "i"));
    var htmlStr = "<span>";
    for (var i = 0; i < a.length; i++) {
        var currentElement;
        if (a[i].match(new RegExp(ww, "i"))) {
            htmlStr += "<span style='" + HIGHT_LIGHT_STYLE + "'>" + a[i] + "</span>";
        } else {
            htmlStr += a[i];
        }
    }
    htmlStr += "</span>";
    n.parentNode.replaceChild($(htmlStr)[0], n);
}

function findParent(node, tag, classname) {
    var n = node;
    while (n != null) {
        var p = n.parentNode;
        if (p != null && p.nodeType == Node.ELEMENT_NODE &&
            p.nodeName.match(new RegExp(tag, "i")) && p.className == classname) {
            return true;
        }
        n = p;
    }
    return false;
}

function adjust() {
    var MacFireFox = false;
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("mac") != -1 && ua.indexOf("firefox") != -1) {
        MacFireFox = true;
    }
    var MacChrome = false;
    if (ua.indexOf("mac") != -1 && ua.indexOf("chrome") != -1) {
        MacChrome = true;
    }
    var isOpera,
        isSafari = false;
    if (typeof(window.opera) != 'undefined')
        isOpera = true;
    if (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') == -1)
        isSafari = true;

    // To fix cursor.
    $(".linkimage").css('cursor', 'pointer');

    return;
}

// search

function doSearch() {
    try {
        var keywordArray = getKeyWords();
        var keyword = paramterMap　[KEYWORD_PARAMETER_NAME];
        var searchRange = paramterMap　[DISPLAYE_PAGE_INDEX_PARAMETER_NAME];

        if (isNullOrEmpty(keyword)) {
            keyword = "";
        }

        var regSearchWords = new Array();
        var originalSearchWords = new Array();
        for (i = 0; i < keywordArray.length; i++) {
            var tmp = keywordArray[i];
            tmp = beautyKeyword(tmp);
            if (tmp.length > 0) {
                regSearchWords[regSearchWords.length] = tmp;
                originalSearchWords[originalSearchWords.length] = keywordArray[i];
            }
        }

        var errorMessageHtml = '';
        if (regSearchWords.length > KEYWORD_LIMIT) {
            var messages = Stringformat(CONST_TEXT.toomanykeywords, KEYWORD_LIMIT);
            var messArray = messages.split("\n");
            for (i = 0; i < messArray.length; i++) {
                errorMessageHtml += '<p>' + escapeHTML(messArray[i]) + '</p>';
            }
        } else if (regSearchWords.length == 0) {
            var messages = CONST_TEXT.inputsearchword;
            var messArray = messages.split("\n");
            for (i = 0; i < messArray.length; i++) {
                errorMessageHtml += '<p>' + escapeHTML(messArray[i]) + '</p>';
            }
        }

        if (errorMessageHtml != "") {
            $("#errorMessage").html(errorMessageHtml).show();
            $("#searchResultText").hide();
            $(".numberOfPageDiv").hide();
            return;
        }

        // 検索結果を取得
        searchresult = [];
        searchresult = search(regSearchWords);

        //検索結果件数の表示
        var cntElem = document.getElementById("pageCount");
        if (cntElem != null) {
            cntElem.innerHTML = searchresult.length;
        }
        var errorMessageHtml = '';
        if (searchresult.length == 0) {
            var messages = CONST_TEXT.searchnopage;
            var messArray = messages.split("\n");
            for (i = 0; i < messArray.length; i++) {
                errorMessageHtml += '<p>' + escapeHTML(messArray[i]) + '</p>';
            }
        } else if (searchresult.length == DISPLAY_PAGE_LIMIT) {
            var messages = CONST_TEXT.toomanyresults;
            messages = Stringformat(messages, DISPLAY_PAGE_LIMIT);
            var messArray = messages.split("\n");
            for (i = 0; i < messArray.length; i++) {
                errorMessageHtml += '<p>' + escapeHTML(messArray[i]) + '</p>';
            }
        }

        if (errorMessageHtml != "") {
            $("#errorMessage").html(errorMessageHtml).show();
            //$("#searchResultText").hide();
            //$(".numberOfPageDiv").hide();
            //return;
        } else {
            $("#errorMessage").hide();
            $("#searchResultText").show();
        }

        //結果をソートする。
        searchresult = sortResult(searchresult);
        //要約を取得する
        summaryText = getTextSummary(searchresult, regSearchWords, originalSearchWords);
        //検索結果表示
        pageCount = Math.ceil(searchresult.length / NUMBER_ROW_IN_PAGE);
        doRenderResult(searchresult);

    } catch (error) {

        console.log(error);
    } finally {
        adjust();
    }
}

function search(searchWords) {
    var result = new Array();
    for (i = 0; i < pageDataArray.length; i++) {
        var pageData = pageDataArray[i];
        var times = 0;
        var titleHitflag = false;
        var textHitflag = false;
        var titleHitTimes = 0;
        var textHitTimes = 0;
        var wordsHitTime = new Array();
        for (j = 0; j < searchWords.length; j++) {
            var reg = new RegExp(searchWords[j], "g");
            var textResult = pageData[4].match(reg);
            var titleResult = pageData[2].match(reg);
            var oneWordHitTime = 0;
            if (textResult != null) {
                oneWordHitTime += textResult.length;
                times += textResult.length;
                textHitTimes += textResult.length;
            }
            if (titleResult != null) {
                oneWordHitTime += titleResult.length;
                times += titleResult.length;
                titleHitTimes += titleResult.length;
            }
            wordsHitTime[j] = oneWordHitTime;
        }
        if (isResult(wordsHitTime, 2)) {
            if (titleHitTimes > 0) {
                titleHitflag = true;
            }
            if (textHitTimes > 0) {
                textHitflag = true;
            }
            result[result.length] = {
                "pageIndex": i,
                "spaceIndex": pageData[0],
                "pageTitle": pageData[1],
                "textHitflag": textHitflag,
                "titleHitflag": titleHitflag,
                "matchTimes": times
            };
        }
        if (result.length == DISPLAY_PAGE_LIMIT) {
            break;
        }
    }
    return result;
}

function isResult(wordsHitTime, threshold) {
    var zeroCount = 0;
    for (var h = 0; h < wordsHitTime.length; h++) {
        if (wordsHitTime[h] == 0) {
            zeroCount++;
        }
    }
    var hitRate = (wordsHitTime.length - zeroCount) / wordsHitTime.length;
    var rate = threshold / 3;
    if (hitRate >= rate) {
        return true;
    } else {
        return false;
    }
}

function viewPage(number) {
    $("#" + DISPLAYE_PAGE_INDEX_PARAMETER_NAME).val(number);
    doRenderResult(searchresult);
    window.scrollTo(0, 0);
}

function changeNumberRowInPage() {
    NUMBER_ROW_IN_PAGE = parseInt($("#" + NUMBER_OF_PAGE_FIELD_ID).val(), 0);
    pageCount = Math.ceil(searchresult.length / NUMBER_ROW_IN_PAGE);
    if (searchresult == null || searchresult.length == 0) {
        return;
    }
    doRenderResult(searchresult);
}

function renderPagingArea(currentPage) {
    currentPage = parseInt(currentPage);
    var localPageCount = pageCount;
    var strHtml = '';
    if (currentPage > 1) {
        strHtml += '<li onclick="viewPage(1)">' + escapeHTML('<<') + '</li>';
        strHtml += '<li class="sep">|</li>';
        strHtml += '<li onclick="viewPage(' + (currentPage - 1) + ')">' + escapeHTML('<') + '</li>';
    } else {
        strHtml += '<li>' + escapeHTML('<<') + '</li>';
        strHtml += '<li class="sep">|</li>';
        strHtml += '<li>' + escapeHTML('<') + '</li>';
    }

    var startLoop = currentPage - 2;
    var endLoop = currentPage + 2;
    if (startLoop <= 0 || endLoop > localPageCount) {
        if (startLoop <= 0) {
            endLoop = endLoop - startLoop + 1;
            startLoop = 1;
        }
        if (endLoop > localPageCount) {
            startLoop = startLoop - (endLoop - localPageCount);
            endLoop = localPageCount;
        }
    }
    if (startLoop <= 0) {
        startLoop = 1;
    }
    if (endLoop > localPageCount) {
        endLoop = localPageCount;
    }

    for (var i = startLoop; i <= endLoop; i++) {
        if (!isNullOrEmpty(strHtml)) {
            strHtml += '<li class="sep">|</li>';
        }
        if (i == currentPage) {
            strHtml += '<li class="current">' + escapeHTML(i + "") + '</li>';
        } else {
            strHtml += '<li onclick="viewPage(' + i + ')">' + escapeHTML(i + "") + '</li>';
        }
    }

    if (currentPage < localPageCount) {
        strHtml += '<li class="sep">|</li>';
        strHtml += '<li onclick="viewPage(' + (currentPage + 1) + ')">' + escapeHTML('>') + '</li>';
        strHtml += '<li class="sep">|</li>';
        strHtml += '<li onclick="viewPage(' + localPageCount + ')">' + escapeHTML('>>') + '</li>';
    } else {
        strHtml += '<li class="sep">|</li>';
        strHtml += '<li >' + escapeHTML('>') + '</li>';
        strHtml += '<li class="sep">|</li>';
        strHtml += '<li >' + escapeHTML('>>') + '</li>';
    }
    strHtml += "";
    return "<span class='skipHighlight'>" + strHtml + '</span><br />';
}

function renderResultView(resultArray, pageNumber) {
    var startIndex = NUMBER_ROW_IN_PAGE * (pageNumber - 1);
    var endIndex = NUMBER_ROW_IN_PAGE * pageNumber;
    var resultHtml = '';
    if (startIndex >= resultArray.length) {
        pageNumber = pageCount;
        startIndex = NUMBER_ROW_IN_PAGE * (pageNumber - 1);
        $("#" + DISPLAYE_PAGE_INDEX_PARAMETER_NAME).val(pageNumber);
    }

    if (resultArray == null || resultArray.length == 0) {
        endIndex = 0;
    } else if (endIndex > resultArray.length) {
        endIndex = resultArray.length;
    }
    for (i = startIndex; i < endIndex; i++) {
        var searchResultData = resultArray[i];
        var src = pageDataArray[searchResultData.pageIndex][5];
        src += "?" + KEYWORD_PARAMETER_NAME + "=" + encodeURIComponent(paramterMap[KEYWORD_PARAMETER_NAME]);
        resultHtml += '<div class="fpage">';
        resultHtml += '<h2>';
        resultHtml += '<a href = "';
        resultHtml += src;
        resultHtml += '">' + searchResultData.pageTitle + '</a>';
        resultHtml += '</h2><ul>';
        resultHtml += '<li class="summary">';
        if (summaryText[i].indexOf("<") > 0) {
            summaryText[i] = summaryText[i].replace(RegExp("<", "g"), '&lt;');
        }
        if (summaryText[i].indexOf(">") > 0) {
            summaryText[i] = summaryText[i].replace(RegExp(">", "g"), '&gt;');
        }
        resultHtml += summaryText[i];
        resultHtml += '</li></ul></div>';
    }
    return resultHtml;
}

function doRenderResult(resultArray) {
    document.getElementById(CONTEXT_ID).innerHTML = renderResultView(resultArray, eval($("#" + DISPLAYE_PAGE_INDEX_PARAMETER_NAME).val()));
    var pageInnerHtml = renderPagingArea(eval($("#" + DISPLAYE_PAGE_INDEX_PARAMETER_NAME).val()));
    $(".pagenavi").html(pageInnerHtml);
    rerenderHtml();
}

function sortResult(result) {
    // ソート順?でソートする
    // 検索ワードがタイトルに含まれている結果の配列
    var titleTagTrue = new Array();
    var t = 0;
    // 検索ワードがタイトルに含まれていない結果の配列
    var titleTagFalse = new Array();
    var f = 0;
    for (i = 0; i < result.length; i++) {
        if (result[i].titleHitflag) {
            titleTagTrue[t] = result[i];
            t++;
        } else {
            titleTagFalse[f] = result[i];
            f++;
        }
    }

    //ソート順?、?、?でソートする
    titleTagTrue.sort(compareResult);
    titleTagFalse.sort(compareResult);
    return titleTagTrue.concat(titleTagFalse);
}

function compareResult(a, b) {
    if (Number(b.matchTimes) - Number(a.matchTimes) != 0) {
        return Number(b.matchTimes) - Number(a.matchTimes);
    } else {
        return (a.pageTitle > b.pageTitle) ? 1 : -1;
    }
}