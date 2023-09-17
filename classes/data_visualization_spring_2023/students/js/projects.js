/* globals d3, Tabletop */
//
// var urlHtml = "1rSSlxfvSaYTSC_eKTeher74_j4OsgHVLs5pVqXmCGas";
var urlHtml =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWHQhUVEo-M5muiiPPW963UyZa97COxxBKIRExYRPbQyXQgNxpplFwoyhw0-H2BbWUoRvOy7dax9yT/pub?gid=1445644496&single=true&output=csv";

var container = d3.select("#projects");

function update(data) {
  console.log(data.length);
  var nested_data = d3
    .nest()
    .key(function(d) {
      return d["Assignment"];
    })
    .sortKeys(function(a, b) {
      return d3.ascending(a, b);
    })
    .entries(data);

  var topics = container
    .selectAll(".topic")
    .data(nested_data)
    .enter()
    .append("div")
    .attr("class", "topic row col-sm-12");

  topics.append("h3").text(function(d) {
    return d.key;
  });

  var projs = topics
    .selectAll(".project")
    .data(function(d) {
      return d.values.sort(function(a, b) {
        return d3.ascending(a["First name "], b["First name "]);
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

  var body = projs.append("div").attr("class", "project-body");

  var desc = body.append("div").attr("class", "description col-sm-12");

  desc
    .append("a")
    .attr("href", function(d) {
      return d["URL to your personal homepage"];
    })
    .text(function(d) {
      return d["First name "] + " " + d["Last name"];
    });

  // desc.filter(function (d) {
  //   return d["Código 2"]!==d["Código"];
  // })
  //   .append("a")
  //   .attr("href" , function (d) { return d["URL de su página personal 2"];})
  //   .text(function (d) { return d["Nombres 2"] + " " + d["Apellidos 2"]; });

  desc.append("p").text(function(d) {
    return d["Name of the project"];
  });

  body
    .append("div")
    .attr("class", "project-thumb")
    .append("a")
    .attr("href", function(d) {
      return d["Github repository "];
    })
    .append("img")
    .attr("class", "img-circle")
    .attr("src", function(d) {
      return d["Project Thumbnail URL"]
        ? d["Project Thumbnail URL"]
        : "../images/logo_desarrollo_web.png";
    })
    .attr("alt", function(d) {
      return (
        "Image " +
        d["Assignment"] +
        " " +
        d["First name "] +
        " " +
        d["Last name"]
      );
    });

  // desc.append("p")
  //   .text(function (d) { return "Uploaded at" + d["Timestamp"]; });

  var desc2 = body.append("div").attr("class", "description2 col-sm-12");

  desc2
    .filter((d) => d["Github repository "])
    .append("a")
    .attr("href", function(d) {
      return d["Github repository "];
    })
    .attr("target", "_blank")
    .text("Code");

  desc2
    .append("a")
    .filter(function(d) {
      return d["Project URL"];
    })
    .attr("class", "")
    .attr("href", function(d) {
      return d["Project URL"];
    })
    .attr("target", "_blank")
    .text("Demo");

  desc2
    .filter(function(d) {
      return d["Video demonstration"];
    })
    .append("a")
    .attr("class", "")
    .attr("href", function(d) {
      return d["Video demonstration"];
    })
    .attr("target", "_blank")
    .text("Video");

  desc2
    .filter(function(d) {
      return d["Google slides URL"];
    })
    .append("a")
    .attr("class", "")
    .attr("href", function(d) {
      return d["Google slides URL"];
    })
    .attr("target", "_blank")
    .text("Slides");

  desc2
    .filter(function(d) {
      return d["URL of the tweet"];
    })
    .append("a")
    .attr("class", "")
    .attr("href", function(d) {
      return d["URL of the tweet"];
    })
    .attr("target", "_blank")
    .text("Tweet");
}
function preProcess(data) {
  var dictStudentProj = {};
  console.log("Received " + data.length);
  data
    .sort(function(a, b) {
      return d3.ascending(a["Timestamp"], b["Timestamp"]);
    })
    .forEach(function(d) {
      dictStudentProj[d["Assignment"] + d["Student ID"]] = d;
    });
  return d3.values(dictStudentProj);
}

function updateFromGSheet(err, data) {
  // console.log(data);
  var procData = preProcess(data);
  update(procData);
}

d3.csv(urlHtml, updateFromGSheet);

// function init() {
//   Tabletop.init({
//     key: urlHtml,
//     callback: updateFromGSheet,
//     simpleSheet: true,
//   });
// }

// // Update from googleSheets
// window.onload = function () {
//   init();
// };
