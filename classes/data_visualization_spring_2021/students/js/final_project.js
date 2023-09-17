var urlHtml = "1KToPiMDwEErQq98lHCaYi299e_DuFHAeMlz5KyUPrJQ";
var container = d3.select("#projects");



function update(data) {
  //- <div class="panel panel-default">
  //- <div class="panel-heading">
  //-   <h3 class="panel-title">Panel title</h3>
  //- </div>
  //- <div class="panel-body">
  var nested_data = d3.nest()
    .key(function (d) { return d["category"]; })
      .sortKeys(function (a, b) {
        return a === "Others" ?
          1 :
          b === "Others" ?
            -1 :
            d3.ascending(a, b);


      })
    .entries(data);

  var topicsRow = container.selectAll(".topic")
    .data(nested_data)
      .enter()
        .append("div")
        .attr("class", "topic row");

  topicsRow
        .append("div")
        .attr("class", "col-md-1 col-sm-0");
  var topics = topicsRow
        .append("div")
        .attr("class", "col-md-10 col-sm-12");

  topics.append("h2")
    .text(function (d) { return d.key; });

  var projs = topics.selectAll(".project")
    .data(function (d) { return d.values; })
      .enter()
        .append("div")
          .attr("class", "col-md-4 col-sm-4")
        .append("div")
          .attr("id", function (d) {
            return d.project_name.replace(new RegExp(" ","g"), "");
          })
          .attr("class", "project panel panel-default");

  projs
    .append("div")
      .attr("class", "panel-heading")
    .append("h3")
      .attr("class", "panel-title")
      .append("a")
        .attr("href" , function (d) {
          return d["project_github"];
        })
        .attr("target", "_blank")
      .text(function (d) { return d["project_name"]; });

  var body = projs.append("div")
    .attr("class", "panel-body");
  body
    .append("a")
    .attr("href", function (d) { return d["project_demo"]; })
      .attr("target", "_blank")
      .append("img")
      .attr("class", "project-thumb")
        .attr("src", function (d) { return d["project_thumb"]; });
  body.append("a")
    .attr("class", "project_url btn btn-sm btn-default")
    .attr("href", function (d) { return d["project_github"]; })
    .attr("target", "_blank")
    .text("GitHub");
  body.append("a")
    .attr("class", "project_demo btn btn-sm btn-primary")
    .attr("href", function (d) { return d["project_demo"]; })
    .attr("target", "_blank")
    .text("Demo");
  body.append("a")
    .attr("class", "project_demo btn btn-sm btn-success")
    .attr("href", function (d) { return d["project_video"]; })
    .attr("target", "_blank")
    .text("Video");



  body.append("h4").text("Description");
  body.append("p")
    .attr("class", "description")
      .text(function (d) { return d["project_description"]; });

  body.append("h4").text("Members");
  body.append("div")
    .attr("class", "student")
    .append("a")
    .attr("href", function (d) { return d["student1_homepage"]})
    .attr("target", "_blank")
      .text(function (d) { return d["student1_name"]; });
  body.append("div")
    .attr("class", "student")
    .append("a")
    .attr("href", function (d) { return d["student2_homepage"]})
    .attr("target", "_blank")
      .text(function (d) { return d["student2_name"]; });



}

function preProcess(data) {
  // var dictGroups = {};
  // data.forEach(function (d) {
  //   dictGroups[d["Número de grupo"]]=d;
  // })
  return data.filter(function (d) { return +d.ignore!==1; });
}

function updateFromGSheet(data) {
  var procData = preProcess(data);
  update(procData);
}

function init() {
  Tabletop.init( { key: urlHtml,
                   callback: updateFromGSheet,
                   simpleSheet: true } )
}

// Update from csv
//- d3.csv("projects.csv", function (error, data) {
//-   if (error) throw error;
//-   var procData = preProcess(data);
//-   update(procData);
//- });

// Update from googleSheets
window.onload = function() { init() };
d3.select("table").attr("class", "table");