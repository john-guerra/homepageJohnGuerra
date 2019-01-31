/* globals d3 */
var urlHtml = "1QKFBPrbHklmAMziGMjrYeyB_ZtpQmpK7LC89evoVWRA";

var container = d3.select("#projects");

function update(data) {
  console.log(data.length);
  var nested_data = d3.nest()
    .key(function (d) { return d["Project"];})
    .entries(data)
    .sort(function (a, b) {
      return d3.ascending(a.key, b.key);
    });

  var topics = container.selectAll(".topic")
    .data(nested_data)
      .enter()
        .append("div")
        .attr("class", "topic row col-sm-12");

  topics.append("h3")
    .text(function (d) { return d.key; });

  var projs = topics.selectAll(".project")
    .data(function (d) {
      return d.values.sort(function (a, b) {
        return d3.ascending(a["Name"], b["Name"]);
      });
    })
    .enter()
      .append("div")
        .attr("class", "col-sm-3 project");

  // projs
  //   .append("div")
  //     .attr("class", "project-title")
  //   .append("h3")
  //     .attr("class", "title")
  //     .append("a")
  //       .attr("href" , function (d) {
  //         return d["Project url"];
  //       })
  //       .attr("target", "_blank")
  //     .text(function (d) { return d["Project name"]; });

  var body = projs.append("div")
    .attr("class", "project-body");

  var desc = body
    .append("div")
    .attr("class", "description col-sm-12");


  desc.append("div").append("a")
    .attr("href" , function (d) { return d["Homepage URL"];})
    .text(function (d) { return d["Name"] + " " + d["Last Name"]; });

  desc.filter(function (d) {
    return d["Code 2"] && d["Code 2"]!==d["Code"];
  })
    .append("div").append("a")
    .attr("href" , function (d) { return d["Homepage URL 2"];})
    .text(function (d) { return d["Name 2"] + " " + d["Last Name 2"]; });

  desc.append("p")
    .text(function (d) { return d["Project Name"]; });

  body.append("div")
    .attr("class", "project-thumb")
    .append("a")
    .attr("href", function (d) { return d["Github Repo"];})
    .append("img")
      .attr("class", "img-circle")
      .attr("src", function (d) {
        return d["Thumbnail URL"] ?
          d["Thumbnail URL"] :
          "../images/logo_desarrollo_web.png";
      })
      .attr("alt", function (d) {
        return "Image " + d["Project"] + " " + d["Name"] + " " + d["Last Name"];
      });



  // desc.append("p")
  //   .text(function (d) { return "Uploaded at" + d["Marca temporal"]; });

  var desc2 = body
    .append("div")
    .attr("class", "description2 col-sm-12");


  desc2.append("a")
    .attr("href", function (d) { return d["Github Repo"]; })
    .attr("target", "_blank")
    .text("Code");

  desc2.append("a")
    .filter(function (d) { return d["Demo URL"]; })
    .attr("class", "")
    .attr("href", function (d) { return d["Demo URL"]; })
    .attr("target", "_blank")
    .text("Demo");

  desc2
    .filter(function (d) { return d["Youtube video demonstration"]; })
    .append("a")
    .attr("class", "")
    .attr("href", function (d) { return d["Youtube video demonstration"]; })
    .attr("target", "_blank")
    .text("Video");

  desc2
    .filter(function (d) { return d["Google slides URL"]; })
    .append("a")
    .attr("class", "")
    .attr("href", function (d) { return d["Google slides URL"]; })
    .attr("target", "_blank")
    .text("Slides");


}
function preProcess(data) {
  var dictStudentProj = {};
  console.log("Received " + data.length);
  data.sort(function (a, b) {
    return d3.ascending(a["Timestamp"],
      b["Timestamp"]);
  })
  .forEach(function (d) {
    dictStudentProj[d["Project"]+d["Code"]]=d;
  });
  return d3.values(dictStudentProj);
}

function updateFromGSheet(data) {
  // console.log(data);
  var procData = preProcess(data);
  update(procData);
}

function init() {
  Tabletop.init( { key: urlHtml,
                   callback: updateFromGSheet,
                   simpleSheet: true } )
}

// Update from googleSheets
window.onload = function() { init(); };


