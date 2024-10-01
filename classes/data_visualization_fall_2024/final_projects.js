var urlHtml = "1trABGLyzZDqJqLzAjGw9ATtzQxPtbTbgG4SvcQx-dCs";
var container = d3.select("#projects");

/* globals d3, ProjectsComb */
var width = d3.select("#comb").node().clientWidth,
  comb = ProjectsComb()
    // .width(400)
    .columns(width > 800 ? 5 : 3)
    .rows(width > 800 ? 2 : 3)
    .containerID("#comb")
    .thumbFn(function (d) {
      return d["Project's screenshot full url"];
    })
    .onClick(function (d) {
      return document
        .getElementById(d["Project title"].split(" ")[0])
        .scrollIntoView();
    })
    .textFn(function (d) {
      return d["Project title"];
    })
    .repeat(false);

// Knuth Shuffle taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function update(data) {
  data = shuffle(data);
  comb.updateComb(data);

  var nested_data = d3
    .nest()
    .key(function (d) {
      return d["Project Category"];
    })
    .sortKeys(function (a, b) {
      return a === "Others" ? 1 : b === "Others" ? -1 : d3.ascending(a, b);
    })
    .entries(data);

  var topics = container
    .selectAll(".topic")
    .data(nested_data)
    .enter()
    .append("div")
    .attr("class", "topic row");

  topics
    .append("h2")
    .attr("class", "col-12 topic-header")
    .text(function (d) {
      return d.key;
    });

  var projs = topics
    .selectAll(".project")
    .data(function (d) {
      return d.values;
    })
    .enter()
    .append("div")
    .attr("class", "col-lg-4   col-sm-6 col-xs-12")
    .append("div")
    //- .attr("class", "card")
    .attr("class", "project card")
    .attr("id", function (d) {
      return d["Project title"].split(" ")[0];
    });

  projs
    .append("a")
    .attr("href", function (d) {
      return d["Project's demo full url"];
    })
    .attr("target", "_blank")
    .append("img")
    .attr("class", "project-thumb card-img-top thumb")
    .attr("src", function (d) {
      return d["Project's screenshot full url"];
    });

  var body = projs.append("div").attr("class", "card-body");

  body
    .append("h4")
    .attr("class", "card-title name")
    .append("a")
    .attr("href", function (d) {
      return d["Project's demo full url"];
    })
    .attr("target", "_blank")
    .text(function (d) {
      return d["Project title"];
    });

  body
    .append("a")
    .attr("class", "project_demo btn btn-sm btn-primary")
    .attr("href", function (d) {
      return d["Project's demo full url"];
    })
    .attr("target", "_blank")
    .text("Demo");
  body
    .filter((d) => d["Full URL for the blog post "])
    .append("a")
    .attr("class", "project_demo btn btn-sm btn-success")
    .attr("href", function (d) {
      return d["Full URL for the blog post "];
    })
    .attr("target", "_blank")
    .text("Blog");

  body
    .append("a")
    .attr("class", "project_demo btn btn-sm btn-info")
    .attr("href", function (d) {
      return d["Video demo full url"];
    })
    .attr("target", "_blank")
    .text("Video");

  body
    .append("a")
    .attr("class", "project_url btn btn-sm btn-warning")
    .attr("href", function (d) {
      return d["Full URL for the Observable/Github repo"];
    })
    .attr("target", "_blank")
    .text("Notebook/Code");

  // body
  //   .append("a")
  //   .attr("class", "project_demo btn btn-sm btn-warning")
  //   .attr("href", function (d) {
  //     return d["Slides"];
  //   })
  //   .attr("target", "_blank")
  //   .text("Slides");

  body.append("h4").text("Description");
  body
    .append("p")
    .attr("class", "description")
    .text(function (d) {
      return d["Paragraph describing the project"];
    });

  body.append("h4").text("Members");
  body
    .append("div")
    .attr("class", "student")
    .append("a")
    .attr("href", function (d) {
      return d["Student 1 homepage"];
    })
    .attr("target", "_blank")
    .text(function (d) {
      return d["Student 1 full name"];
    });
  body
    .append("div")
    .attr("class", "student")
    .append("a")
    .attr("href", function (d) {
      return d["Student 2 homepage"];
    })
    .attr("target", "_blank")
    .text(function (d) {
      return d["Student 2 full name"];
    });
  body
    .append("div")
    .attr("class", "student")
    .append("a")
    .attr("href", function (d) {
      return d["Student 3 homepage"];
    })
    .attr("target", "_blank")
    .text(function (d) {
      return d["Student 3 full name"];
    });

  //- body.append("h5")
  //-   .text(function (d) { return "Group Number " + d["Número de grupo"]; })
}

function preProcess(data) {
  var dictGroups = {};
  data.forEach(function (d) {
    dictGroups[d["Student 1 full name"]] = d;
  });
  return d3.values(dictGroups);
}

function updateFromGSheet(data) {
  var procData = preProcess(data);
  update(procData);
}

//- function init() {
//-   Tabletop.init( { key: urlHtml,
//-                    callback: updateFromGSheet,
//-                    simpleSheet: true } )
//- }

const url =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsK9BNEE6UaWkzx72smOTMT3YT1kR80JK0VuvaVHJBQJluDaay6BwUrLWkb1QHyGnMMhq82dyzychs/pub?gid=1447140028&single=true&output=csv";

// Update from csv
d3.csv(url, function (error, data) {
  if (error) throw error;
  var procData = preProcess(data);
  update(procData);
});

// // Update from googleSheets
// window.onload = function () {
//   init();
// };

d3.select("table").attr("class", "table");

console.log("Final projects");
