/* globals d3 */
var urlHtml = "11La6UAacDvZ6d-cc_h85bVfkxsOb-aoptWKL7fgcjtk";

var container = d3.select("#projects");

function update(data) {
  console.log(data.length);
  var nested_data = d3.nest()
    .key(function (d) { return d["Proyecto"];})
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
        return d3.ascending(a["Nombres"], b["Nombres"]);
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
    .attr("href" , function (d) { return d["URL de su página personal"];})
    .text(function (d) { return d["Nombres"] + " " + d["Apellidos"]; });

  desc.filter(function (d) {
    return d["Código 2"] && d["Código 2"]!==d["Código"];
  })
    .append("div").append("a")
    .attr("href" , function (d) { return d["URL de su página personal 2"];})
    .text(function (d) { return d["Nombres 2"] + " " + d["Apellidos 2"]; });

  desc.append("p")
    .text(function (d) { return d["Nombre del proyecto"]; });

  body.append("div")
    .attr("class", "project-thumb")
    .append("a")
    .attr("href", function (d) { return d["Repositorio de github"];})
    .append("img")
      .attr("class", "img-circle")
      .attr("src", function (d) {
        return d["URL de un thumbnail del proyecto"] ?
          d["URL de un thumbnail del proyecto"] :
          "../images/logo_desarrollo_web.png";
      })
      .attr("alt", function (d) {
        return "Image " + d["Proyecto"] + " " + d["Nombres"] + " " + d["Apellidos"];
      });



  // desc.append("p")
  //   .text(function (d) { return "Uploaded at" + d["Marca temporal"]; });

  var desc2 = body
    .append("div")
    .attr("class", "description2 col-sm-12");


  desc2.append("a")
    .attr("href", function (d) { return d["Repositorio de github"]; })
    .attr("target", "_blank")
    .text("Code");

  desc2.append("a")
    .filter(function (d) { return d["URL del proyecto"]; })
    .attr("class", "")
    .attr("href", function (d) { return d["URL del proyecto"]; })
    .attr("target", "_blank")
    .text("Demo");

  desc2
    .filter(function (d) { return d["URL del video de demostración del proyecto en YouTube"]; })
    .append("a")
    .attr("class", "")
    .attr("href", function (d) { return d["URL del video de demostración del proyecto en YouTube"]; })
    .attr("target", "_blank")
    .text("Video");

  desc2
    .filter(function (d) { return d["URL de la presentación en google slides"]; })
    .append("a")
    .attr("class", "")
    .attr("href", function (d) { return d["URL de la presentación en google slides"]; })
    .attr("target", "_blank")
    .text("Slides");


}
function preProcess(data) {
  var dictStudentProj = {};
  console.log("Received " + data.length);
  data.sort(function (a, b) {
    return d3.ascending(a["Marca temporal"],
      b["Marca temporal"]);
  })
  .forEach(function (d) {
    dictStudentProj[d["Proyecto"]+d["Código"]]=d;
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


