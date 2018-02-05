
class GoogleCharts{

  
  static loadCharts(data) {

    var data = google.visualization.arrayToDataTable(data);
    var options = {
      title: 'Browsing History'
    };
    var chart = new google.visualization.PieChart(document.getElementById('browserhistory__piechart'));
    chart.draw(data, options);

  }
}
class BrowserHistory {
  static loadBrowserHistory(noOfDays) {
    const [startTime, endTime] = BrowserHistory.getStartEndDate(noOfDays)
    chrome.history.search({
      text: '', startTime: startTime, endTime: endTime, maxResults: 150000
    }, function (data) {
      BrowserHistory.processGoogleChartsHistory(data)
    });
  }
  static getStartEndDate(noOfDays) {
    let today = new Date();
    let endTime = today.getTime();
    let startTime = today.getTime() - 24 * 60 * 60 * 1000 * noOfDays;
    return [startTime, endTime];
  }

  static getMaps(data){
    let maps = {};
    data.forEach(element => {
      const hostname = new URL(element.url).hostname;
      if (maps[hostname]) {
        ++maps[hostname];
      } else {
        maps[hostname] = 1;
      }
    });
    return maps;
  }
  static processHistory(data) {
    let maps=BrowserHistory.getMaps(data)
    const mapkeys = Object.keys(maps);
    const urlList = mapkeys.map(function (key, index) {
      return { label: key, value: maps[key] }
    });
    urlList.sort(function (A, B) {
      return B.value - A.value;
    })
    GoogleCharts.loadCharts(urlList);
  }
  static processGoogleChartsHistory(data) {
    let maps=BrowserHistory.getMaps(data)
    const mapkeys = Object.keys(maps);
     let urlList = mapkeys.map(function (key, index) {
      return [ key, maps[key] ];
    });
    urlList.sort(function (A, B) {
      return B.value - A.value;
    })
    urlList.splice(0,0,["Tasks","Browser History "])
    GoogleCharts.loadCharts(urlList);
  }
}
class View {
  static attachButtonDomEvents() {
    const buttons = document.getElementsByClassName('browserhistory__btn');
    for (let index = 0; index < buttons.length; index++) {
      var button = buttons[index];
      button.addEventListener('click', function (event) {
        View.handleButtonClick(event);
      });
    }
  }

  static handleButtonClick(event) {
    const target = event.currentTarget;
    document.getElementsByClassName("mdl-button--raised")[0].classList.remove("mdl-button--raised");
    target.classList.add("mdl-button--raised");
    BrowserHistory.loadBrowserHistory(parseInt(target.getAttribute("data-time-span")));
  }
}
document.addEventListener('DOMContentLoaded', function () {
  View.attachButtonDomEvents();
});


window.loadBrowserHistory = BrowserHistory.loadBrowserHistory;
const drawChart =()=>BrowserHistory.loadBrowserHistory(1);
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

