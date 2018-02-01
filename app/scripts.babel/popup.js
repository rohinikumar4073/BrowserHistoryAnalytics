let w = 300,                        //width
  h = 300,                            //height
  r = 150,                            //radius
  color = d3.scale.category20c();
const domSelector = "#browserhistory__piechart";
class Charts {
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
      .attr("fill", function (d, i) { return color(i); })
      .attr("d", arc);
    arcs.append("svg:text")                                     //add a label to each slice
      .attr("transform", function (d) {                    //set the label's origin to the center of the arc
        //we have to make sure to set these before calling arc.centroid
        d.innerRadius = 0;
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
      })
      .attr("text-anchor", "middle")                          //center the text on it's origin
      .text(function (d, i) { return data[i].label; });
  }
}
class BrowserHistory {
  static loadBrowserHistory(noOfDays) {
    const [startTime, endTime] = BrowserHistory.getStartEndDate(noOfDays)
    chrome.history.search({
      text: '', startTime: startTime, endTime: endTime, maxResults: 150000
    }, function (data) {
      BrowserHistory.processHistory(data)
    });
  }
  static getStartEndDate(noOfDays) {
    let today = new Date();
    let endTime = today.getTime();
    let startTime = today.getTime() - 24 * 60 * 60 * 1000 * noOfDays;
    return [startTime, endTime];
  }
  static processHistory(data) {
    let maps = {};
    data.forEach(element => {
      const hostname = new URL(element.url).hostname;
      if (maps[hostname]) {
        ++maps[hostname];
      } else {
        maps[hostname] = 1;
      }
    });
    const mapkeys = Object.keys(maps);
    const urlList = mapkeys.map(function (key, index) {
      return { label: key, value: maps[key] }
    });
    urlList.sort(function (A, B) {
      return B.value - A.value;
    })
    Charts.loadCharts(urlList.splice(0, 10), domSelector);
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


BrowserHistory.loadBrowserHistory(1);
window.loadBrowserHistory = BrowserHistory.loadBrowserHistory;
