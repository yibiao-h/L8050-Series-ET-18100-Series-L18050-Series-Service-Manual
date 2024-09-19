function replaceAll(target, search, replacement) {
    return target.split(search).join(replacement);
}

function isUndenfined(obj) {
    return typeof(obj) == "undefined";
}

function isNullOrEmpty(obj) {
    if (obj == null || isUndenfined(obj) || obj == "") {
        return true;
    }
    return false;
}

function isArray(obj) {
    if (isNullOrEmpty(obj)) {
        return false;
    }
    return (obj.constructor === Array);
}

function Stringformat(str) {
    for (i = 1; i < arguments.length; i++) {
        var q = '\\{' + (i - 1) + '\\}';
        var re = new RegExp(q, 'g');
        str = str.replace(re, arguments[i]);
    }
    return str;
}

function isNull(str) {
    if (str == null)
        return true;
    if (str == '')
        return true;
    if (typeof(str) == "undefined")
        return true;
    return false;
}

function removeSpace(value) {
    if (value != null && value != '' && typeof(value) != "undefined") {
        while (value.indexOf("\t") >= 0) {
            value = value.replace("\t", "");
        }
        while (value.indexOf(" ") >= 0) {
            value = value.replace(" ", "");
        }
        while (value.indexOf("　") >= 0) {
            value = value.replace("　", "");
        }
    }
    return value;
}

function removeSpecialSymbol(value) {
    return escapeWord(value);
}

function beautyKeyword(value) {
    value = value.toLowerCase();
    value = removeSpace(value);
    value = removeSpecialSymbol(value);
    return value;
}

function escapeHTML(w) {
    w = w.replace(/&/g, "&amp;");
    w = w.replace(/"/g, "&quot;");
    w = w.replace(/</g, "&lt;");
    w = w.replace(/>/g, "&gt;");
    return w;
}

function escapeWord(value) {
    return value.replace(/([^A-Za-z0-9])/g, "\\$1");
}

function unescapeHTML(w) {
    w = w.replace(/&gt;/g, ">");
    w = w.replace(/&lt;/g, "<");
    w = w.replace(/&quot;/g, "\"");
    w = w.replace(/&amp;/g, "&");
    return w;
}

function quotemeta(w) {
    w = w.replace(/\W/g, "\\$&");
    return w;
}

function getParamterMap() {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }

    if (isNullOrEmpty(query_string[KEYWORD_PARAMETER_NAME])) {
        query_string[KEYWORD_PARAMETER_NAME] = "";
    } else {
        query_string[KEYWORD_PARAMETER_NAME] = replaceAll(query_string[KEYWORD_PARAMETER_NAME], "+", " ");
    }

    if (isNullOrEmpty(query_string[DISPLAYE_PAGE_INDEX_PARAMETER_NAME])) {
        query_string[DISPLAYE_PAGE_INDEX_PARAMETER_NAME] = 1;
    }

    if (isNullOrEmpty(query_string[BACK_URL_PARAMETER_NAME])) {
        query_string[BACK_URL_PARAMETER_NAME] = "";
    }

    if (isNullOrEmpty(query_string[NUMBER_OF_PAGE_PARAMETER_NAME])) {
        query_string[NUMBER_OF_PAGE_PARAMETER_NAME] = "10";
    }
    return query_string;
}

function getCurrentHref() {
    // location.pathname for ie4 has bug.
    var iev;
    if (navigator.appName == "Microsoft Internet Explorer") {
        var apv = navigator.appVersion;
        var iel = "MSIE ";
        var iepos = apv.indexOf(iel);
        iev = parseInt(apv.substring(iepos + iel.length));
    }
    if (iev != null && iev == 4) {
        var pathname = location.href;
        var p = pathname.indexOf('#');
        if (p != null && p != -1) {
            pathname = pathname.substring(0, p);
        }
        p = pathname.indexOf('?');
        if (p != null && p != -1) {
            pathname = pathname.substring(0, p);
        }
        return pathname;
    } else {
        return location.pathname;
    }
}

function comback() {
    var key = paramterMap;
    var backto = key['backto'];
    if (isUndenfined(backto)) {
        history(back());
    } else {
        location.href = getHref2Back(backto);
    }
}

function getHref2Back(backto) {
    var sep1 = backto.lastIndexOf("/");
    if (sep1 >= 0) {
        if (sep1 == backto.length - 1) {
            return "index.html";
        }
        return backto.substring(sep1 + 1);
    }
    return backto;
}

function setOldValue() {
    for (var key in paramterMap) {
        if (paramterMap.hasOwnProperty(key)) {
            $("#" + key).val(paramterMap[key]);
        }
    }
}

/**
 * 要約を取得する
 */
function getTextSummary(searchresult, searchWords, noRegSearchWords) {
    //特殊記号の処理
    for (i = 0; i < noRegSearchWords.length; i++) {
        noRegSearchWords[i] = removeSpecialSymbol(noRegSearchWords[i]);
    }

    var textSummary = new Array();
    for (j = 0; j < searchresult.length; j++) {
        var searchResultData = searchresult[j];
        var pageData = pageDataArray[searchResultData.pageIndex];
        var marks = new Array(' ', '.', ',', ':', ';', '?', '!');
        var regText = pageData[4];
        var text = pageData[3];
        //firstの構成は {offset, key}
        var first = GetFirstOffSet(text, noRegSearchWords);
        //本文が100文字未満
        if (text.length <= 100) {
            textSummary[j] = text;
        }
        //本文に検索ワードがない
        else if (!searchresult[j].textHitflag || (typeof(first[1]) == "undefined")) {

            var location = getStringUntilMark(text, 99, 1);
            if (location > 0) {
                textSummary[j] = text.substring(0, location) + "...";
            } else {
                textSummary[j] = text;
            }

        }
        //一番目の検索キーワードが100以上の場合、キーワードのみ表示する。
        else if (noRegSearchWords[0].length >= 100) {
            if (first[0] > 0) {
                textSummary[j] = "...";
                textSummary[j] += noRegSearchWords[0];
            } else {
                textSummary[j] = noRegSearchWords[0];
            }

            if ((first[0] + first[1].length) < text.length) {
                textSummary[j] += "...";
            }
        }
        //検索ワードの前20文字が先頭50文字にかかる
        else if (first[0] <= 70) {

            var location = getStringUntilMark(text, 99, 1);
            if (location > 0) {
                textSummary[j] = text.substring(0, location) + "...";
            } else {
                textSummary[j] = text;
            }

        }
        //検索ワードの後20文字以内が末尾になる
        else if ((first[0] + first[1].length + 20) > text.length) {

            var hasMarks = false;
            var objectString = text.substring(50, first[0] - 20);
            for (var x = 0; x < marks.length; x++) {
                if (objectString.indexOf(marks[x]) != -1) {
                    hasMarks = true;
                    break;
                }
            }
            if (hasMarks == false) {
                textSummary[j] = text;
            } else {
                var location1 = getStringUntilMark(text.substring(0, first[0] - 20 - 1), 49, 1);
                var location2 = getStringUntilMark(text.substring(0, first[0] - 20 - 1), 49, 0);
                //"..."の中には1つの記号しかない。
                if (location1 == location2) {
                    textSummary[j] = text;
                } else {
                    textSummary[j] = text.substring(0, location1);
                    textSummary[j] += "...";
                    textSummary[j] += text.substring(location2);
                }
            }

        }
        //一般的な場合
        else {

            //1つ目の"..."の処理
            var hasMarks = false;
            var objectString = text.substring(50, first[0] - 20);
            for (var x = 0; x < marks.length; x++) {
                if (objectString.indexOf(marks[x]) != -1) {
                    hasMarks = true;
                    break;
                }
            }
            if (hasMarks == false) {
                textSummary[j] = text.substring(0, first[0] + first[1].length + 20);
            } else {
                var location1 = getStringUntilMark(text.substring(0, first[0] - 20 - 1), 49, 1);
                var location2 = getStringUntilMark(text.substring(0, first[0] - 20 - 1), 49, 0);
                //1つ目の"..."の中には1つの記号しかない。
                if (location1 == location2) {
                    textSummary[j] = text.substring(0, first[0] + first[1].length + 20);
                } else {
                    textSummary[j] = text.substring(0, location1);
                    textSummary[j] += "...";
                    textSummary[j] += text.substring(location2, first[0] + first[1].length + 20);
                }
            }
            //2つ目の"..."の処理
            var location3 = getStringUntilMark(text, first[0] + first[1].length + 20, 1);
            if (location3 > 0) {
                textSummary[j] += text.substring(first[0] + first[1].length + 20, location3);
                textSummary[j] += "...";
            }

        }
    }
    return textSummary;
}

function GetFirstOffSet(text, searchWords) {
    var offset = new Array();
    var result = new Array();
    //最初にkeyが現れる位置
    var firstOffset;
    //最初に現れるkey
    var firstKey;
    //検索キーワードのそれぞれが最初に現れる位置を取得する
    for (i = 0; i < searchWords.length; i++) {
        var reg = new RegExp(searchWords[i], "i");
        if (text.search(reg) != -1) {
            offset[offset.length] = text.search(reg);
        }
    }
    firstOffset = offset[0];
    for (i = 0; i < offset.length; i++) {
        firstOffset = Math.min(offset[i], firstOffset);
    }

    result[0] = firstOffset;
    //最初に現れるkeyを取得する
    for (i = 0; i < searchWords.length; i++) {
        var reg = new RegExp(searchWords[i], "i");
        if (text.search(reg) == firstOffset) {
            firstKey = searchWords[i];
        }
    }
    result[1] = firstKey;
    return result;
}

function getLinkFollowSpace(spaceKey) {
    var url = "?" + SPACE_NAME_PARAMETER_NAME + "=" + spaceKey;
    for (var key in paramterMap) {
        if (key != SPACE_NAME_PARAMETER_NAME && paramterMap.hasOwnProperty(key)) {
            url += "&" + key + "=" + encodeURIComponent(paramterMap[key]);
        }
    }
    return url;
}

function getKeyWords() {
    var words = new Array();
    var result = new Array();
    var wordFromUrl = paramterMap[KEYWORD_PARAMETER_NAME];
    //検索文字列の中にスペース(全角・半角)がある
    if (wordFromUrl != null && wordFromUrl != '' && typeof(wordFromUrl) != "undefined") {
        if (wordFromUrl.indexOf(" ") != -1 || wordFromUrl.indexOf("　") != -1) {
            var tempWords = wordFromUrl.split(" ");
            for (var s = 0; s < tempWords.length; s++) {
                if (tempWords[s].indexOf("　") != -1) {
                    words = words.concat(tempWords[s].split("　"));
                } else {
                    var tempWords2 = new Array(tempWords[s]);
                    words = words.concat(tempWords2);
                }
            }
        }
        //検索文字列の中にスペースがない
        else {
            words[0] = wordFromUrl;
        }
    }
    //検索キーワードリストから長さが0のキーワードを除去する。
    for (i = 0; i < words.length; i++) {
        if (words[i].length != 0) {
            result[result.length] = words[i];
        }
    }
    return result;
}

function getAttribute(n, attr) {
    if (n == null) return null;
    if (typeof(n.getAttribute) != "function") return null;
    return n.getAttribute(attr);
}

function getStringUntilMark(textString, offset, directionFlag) {
    var marks = new Array(' ', '.', ',', ':', ';', '?', '!');
    // 文字列の中で最初に出てきる記号の場所を探す
    var startOffsets = new Array();
    for (m = 0; m < marks.length; m++) {
        var markOffset = textString.substring(offset + 1).indexOf(marks[m]);
        if (markOffset != -1) {
            startOffsets[startOffsets.length] = markOffset;
        }
    }
    // 文字列の中で最後に出てきる記号の場所を探す
    var endOffsets = new Array();
    for (m = 0; m < marks.length; m++) {
        var markOffset = textString.substring(offset + 1).lastIndexOf(marks[m]);
        if (markOffset != -1) {
            endOffsets[endOffsets.length] = markOffset;
        }
    }

    if (directionFlag == 1) {
        var startOffset = startOffsets[0];
        for (m = 0; m < startOffsets.length; m++) {
            startOffset = Math.min(startOffsets[m], startOffset);
        }
        return (startOffset + offset + 2);
    } else {
        var endOffset = endOffsets[0];
        for (m = 0; m < endOffsets.length; m++) {
            endOffset = Math.max(endOffsets[m], endOffset);
        }
        return endOffset + offset + 2;
    }
}