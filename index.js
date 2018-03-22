function trigger() {
  var now = new Date();
  //通知させたい時刻を条件にする
  if (now.getHours() == 10 && now.getMinutes() == 0) {
    main();
  }
}

function main() {
  var now = new Date();
  var response = UrlFetchApp.fetch("https://www.tokyo-dome.co.jp/resources/events.json"); //URL+cityID
  var json = JSON.parse(response.getContentText());
  for (var i = 0; i < json.length; i++) {
    if (arraymatch(json[i]["category"], "TokyoDome")) {
      var now = new Date();
      var now_date = "" + now.getFullYear() + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2);
      if (arraymatch(json[i]["dates"].split(","), now_date)) {
        sendSlack(json[i]);
      }
    }
  }
}

function arraymatch(data, match) {
  for (var j = 0; j < data.length; j++) {
    if (data[j] == match) {
      return true;
    }
  }
  return false;
}

function newline_exchange(message, type) {
  type = type === undefined ? 1 : type;
  if (type == 1) {
    return message.replace(/<br>/g, "");
  } else {
    return message.replace(/<br>/g, "\n");
  }
}

//slack送るためのファンクション
function sendSlack(message) {
  var postUrl = '';
  var username = '東京ドームのイベント'; // 通知時に表示されるユーザー名
  var fallback_message = message["title"] + '\n' + newline_exchange(message['term']) + '\n' + newline_exchange(message['open_time']);
  var detail_link = message["detail_url"] ? message["detail_url"] : "https://www.tokyo-dome.co.jp/event/";
  var jsonData = {
    "username": username,
    "attachments": [{
      "fallback": fallback_message,
      "color": "#2eb886",
      "title": message["title"],
      "title_link": detail_link,
      "text": newline_exchange(message["term"], 0) + '\n' + newline_exchange(message['note'], '0') + "\nカテゴリー: " + message['category_detail'],
    }],
  };
  var payload = JSON.stringify(jsonData);

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": payload
  };
  UrlFetchApp.fetch(postUrl, options);
}

