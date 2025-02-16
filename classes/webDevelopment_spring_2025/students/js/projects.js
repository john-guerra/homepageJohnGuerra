/* globals d3, Tabletop */
// let urlHtml = "1OHk8QgSQONe-bYgJ1Qnt4uHQmE34xIEtLHV9xwKmGNA";
let urlCSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSP-dXVRnnL0-5ueiPPPrdswrNQ57bmqVyhT_PEleqLCRkkCYb3HP8zYokh0EyO7ZclK1SZAki0LZk8/pub?gid=89913342&single=true&output=csv";

let container = d3.select("#projects");
/**
 * @const @enum Project constants.
 */
let Project = {
  THUMBNAIL: "Project Thumbnail URL",
};

/**
 * Checks if image's filename has valid file extension.
 * @param {string} image Image's filename
 * @return {boolean} True if valid extension, false otherwise.
 */
function isValidImageExtension(image) {
  let validateImage = /\.(jpe?g|png|gif|bmp)$/i;

  return validateImage.test(image);
}

function update(data) {
  console.log(data.length);
  let nested_data = d3
    .nest()
    .key(function(d) {
      return d["Project"];
    })
    .entries(data)
    .sort(function(a, b) {
      return d3.ascending(a.key, b.key);
    });

  let topics = container
    .selectAll(".topic")
    .data(nested_data)
    .enter()
    .append("div")
    .attr("class", "topic row col-sm-12");

  topics.append("h3").text(function(d) {
    return d.key;
  });

  let projs = topics
    .selectAll(".project")
    .data(function(d) {
      return d.values.sort(function(a, b) {
        return d3.ascending(
          a["First name Student 1"],
          b["First name Student 1"]
        );
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

  let body = projs.append("div").attr("class", "project-body");

  let desc = body.append("div").attr("class", "description col-sm-12");

  desc
    .append("div")
    .append("a")
    .attr("href", function(d) {
      return d["Personal homepage URL 1"];
    })
    .text(function(d) {
      return d["Full Name Student 1"];
    });

  desc
    .filter(function(d) {
      return (
        d["University ID Number Student 2"] &&
        d["University ID Number Student 2"] !==
          d["University ID Number Student 1"]
      );
    })
    .append("div")
    .append("a")
    .attr("href", function(d) {
      return d["Personal homepage URL 2"];
    })
    .text(function(d) {
      return d["Full Name Student 2"];
    });

  desc.append("p").text(function(d) {
    return d["Project Name"];
  });

  body
    .append("div")
    .attr("class", "project-thumb")
    .append("a")
    .attr("href", function(d) {
      return d["Github repo URL"];
    })
    .append("img")
    .attr("class", "img-circle")
    // .attr("onerror", "this.src='../images/logo_desarrollo_web.png'")
    .attr("src", function(d) {
      return d[Project.THUMBNAIL];
      // return d[Project.THUMBNAIL] && isValidImageExtension(d[Project.THUMBNAIL])
      //   ? d[Project.THUMBNAIL]
      //   : "../images/logo_desarrollo_web.png";
    })
    .attr("alt", function(d) {
      return "Image " + d["Project"] + " " + d["Full Name Student 1"];
    });

  // desc.append("p")
  //   .text(function (d) { return "Uploaded at" + d["Timestamp"]; });

  let desc2 = body.append("div").attr("class", "description2 col-sm-12");

  desc2
    .append("a")
    .attr("href", function(d) {
      return d["Github repo URL"];
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
      return d["Public video URL"];
    })
    .append("a")
    .attr("class", "")
    .attr("href", function(d) {
      return d["Public video URL"];
    })
    .attr("target", "_blank")
    .text("Video");

  desc2
    .filter(function(d) {
      return d["Google Slides URL"];
    })
    .append("a")
    .attr("class", "")
    .attr("href", function(d) {
      return d["Google Slides URL"];
    })
    .attr("target", "_blank")
    .text("Slides");
}
function preProcess(data) {
  let dictStudentProj = {};
  console.log("Received " + data.length);
  console.log(
    "Disabled",
    data.filter((d) => d.Disabled !== null && d.Disabled !== "")
  );
  data
    .filter(
      (d) =>
        d.Disabled === null || d.Disabled === undefined || d.Disabled === ""
    )
    .map((d) => {
      d["Timestamp"] = new Date(d["Timestamp"]);
      return d;
    })
    .sort(function(a, b) {
      return d3.ascending(a["Timestamp"], b["Timestamp"]);
    })
    .forEach(function(d) {
      dictStudentProj[d["Project"] + d["University ID Number Student 1"]] = d;
    });
  return d3.values(dictStudentProj);
}

function updateFromGSheet(data) {
  // console.log(data);
  let procData = preProcess(data);
  update(procData);
}

// function init() {
//   Tabletop.init({
//     key: urlHtml;,
//     callback: updateFromGSheet,
//     simpleSheet: true,
//   });
// }

// // Update from googleSheets
// window.onload = function () {
//   init();
// };

d3.csv(urlCSV, (err, data) => {
  if (err) throw err;

  console.log("got data", data);

  updateFromGSheet(data);
});
