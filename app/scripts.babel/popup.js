let w = 300,                        //width
  h = 300,                            //height
  r = 150,                            //radius
  color = d3.scale.category20c();
const domSelector = "#browserhistory__piechart";

class D3Charts {
  static colorPaltter(n) {
    const colores_g = ["#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292",
      "#EC407A", "#E91E63", "#D81B60", "#D81B60",
      "#D81B60", "#D81B60", "#D81B60", "#D81B60",
      "#D81B60", "#D81B60"
    ];
    return colores_g[n % colores_g.length];
  }
  static purpleColors(n) {
    const colores_g = ["#EDE7F6", "#D1C4E9", "#B39DDB",
      "#9575CD", "#7E57C2", "#673AB7", "#5E35B1",
      "#512DA8", "#4527A0", "#311B92", "#B388FF",
      "#7C4DFF", "#651FFF", "#6200EA"
    ];
    return colores_g[(colores_g.length - n - 1) % colores_g.length];
  }


  static loadCharts(data, selector) {
    let vis = d3.select(selector).html("")
      .append("svg:svg")
      .data([data])
      .attr("width", w)
      .attr("height", h)
      .append("svg:g")
      .attr("transform", "translate(" + r + "," + r + ")");
    let arc = d3.svg.arc()
      .outerRadius(r);
    let pie = d3.layout.pie()
      .value(function (d) { return d.value; });
    let arcs = vis.selectAll("g.slice").data(pie)
      .enter()
      .append("svg:g")
      .attr("class", "slice");
    arcs.append("svg:path")
      .attr("fill", function (d, i) { return Charts.purpleColors(i); })
      .attr("d", arc);
    arcs.append("svg:text")
      .attr("transform", function (d) {
        d.innerRadius = 0;
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("text-anchor", "middle")
      .text(function (d, i) { return data[i].label; });
  }
}
google.charts.load('current', {'packages':['corechart']});

class GoogleCharts{

  
  static loadCharts(data, selector) {

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
    GoogleCharts.loadCharts(urlList, domSelector);
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
    GoogleCharts.loadCharts(urlList, domSelector);
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

