/* globals d3, Tabletop, scroller */
var urlHtml = "1KiS9NDIoduptAiWL5UybvfQ3KzF91f3ikQ0vk3nUNUQ";
var graph, simulation;
var dicStudents = d3.map(),
  selected = [],
  R = 60;
function doNetwork(data) {
  var container = d3.select("#studentsViz").attr("class", "step");
  var svg = container.append("svg");

  var dicTopics = d3.map(),
    r = d3.scaleLinear().range([20, 60]),
    width = container.node().offsetWidth,
    height = 600,
    c = d3
      .scaleOrdinal()
      .domain([
        "InfoViz Testing",
        "InfoViz",
        "Medicine",
        "Biology",
        "PhotoViz",
        "Visual Analytics",
        "Accessibility",
        "Machine Learning",
        "Photoviz",
        "Business",
        "Large DataViz",
        "Web Development",
        "Politics",
      ])
      .range([
        "#A7CA4E",
        "#A7CA4E",
        "#BFCBC2",
        "#BFCBC2",
        "#A7CA4E",
        "#A7CA4E",
        "#76C7F2",
        "#99C5B5",
        "#A7CA4E",
        "#BFCBC2",
        "#A7CA4E",
        "#B9BBE0",
        "#BFCBC2",
      ]),
    line = d3
      .line()
      .x(function (d) {
        return d.x;
      })
      .y(function (d) {
        return d.y;
      });

  svg.attr("width", width).attr("height", height);

  console.log("students width", width, "height", height);

  function forceBoundary() {
    for (var i = 0, n = graph.nodes.length, node; i < n; ++i) {
      node = graph.nodes[i];
      if (node.x > width) node.x = width;
      if (node.x < 0) node.x = 0;
      if (node.y > height) node.y = height;
      if (node.y < 0) node.y = 0;
    }
  }

  simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(function (d) {
          return d.nickname;
        })
        .distance(60)
        .strength(0.05)
    )
    .force("collide", d3.forceCollide(R * 0.6).iterations(4))
    .force("charge", d3.forceManyBody().strength(-150))
    // .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.05 * height/width))
    .force("y", d3.forceY(height / 2).strength(0.05 * width/height))
    // .force("borderX", d3.forceX(function (d) {
    //   if (d.px<=0) { d.x=1; }
    //   if (d.px>=width) { d.x=width-1; }
    // }).strength(0.1))
    .force("boundary", forceBoundary);
  // .force("topicsUp",
  //   d3.forceY(function (d) {
  //     return d.type==="topic" && ["Accesibility", "Web Development"].indexOf(d.name)!==-1  ?
  //       height/20 :
  //       height*3/4;
  //   }).strength(function (d) {
  //     return d.type==="topic" && ["Accesibility","Web Development"].indexOf(d.name)!==-1  ?
  //       0.4 :
  //       0;
  //   })
  // );

  function dragstarted() {
    if (!d3.event.active) simulation.alpha(1).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  // function drawLink(d) {
  //   context.moveTo(d.source.x, d.source.y);
  //   context.lineTo(d.target.x, d.target.y);
  // }

  // function drawNode(d) {
  //   var dr =  d.type==="topic" ? r(d.numberStudents): 40;
  //   context.moveTo(d.x + dr, d.y);
  //   context.arc(d.x, d.y, dr, 0, 2 * Math.PI);
  //   context.fillText(d.name, d.x, d.y);
  // }

  function getGraph(data) {
    var graph = {};

    dicStudents = d3.map();
    dicTopics = d3.map();
    graph.nodes = [];
    data.forEach(function (d) {
      d.topics = d.topics.split(";");
      dicStudents.set(d.nickname, d);
      d.topics.forEach(function (t) {
        var subTopics = t.split(",");

        var prevSt = null;
        subTopics.forEach(function (st) {
          st = st.trim();
          if (!dicTopics.has(st)) {
            dicTopics.set(st, []);
          }
          var studentListOnTopic = dicTopics.get(st);
          studentListOnTopic.push(prevSt ? prevSt : d.nickname);
          dicTopics.set(st, studentListOnTopic);
          prevSt = st;
        });
      });
    });

    graph.nodes = data;
    graph.links = [];

    r.domain(
      d3.extent(dicTopics.entries(), function (d) {
        return d.value.length;
      })
    );
    graph.nodes = graph.nodes.concat(
      dicTopics.entries().map(function (t) {
        return {
          name: t.key,
          nickname: t.key,
          type: "topic",
          numberStudents: t.value.length,
        };
      })
    );

    dicTopics.each(function (studentListOnTopic, t) {
      studentListOnTopic.forEach(function (s) {
        graph.links.push({
          source: s,
          target: t,
        });
      });
    });
    return graph;
  }

  function update(data) {
    console.log(data.length);

    graph = getGraph(data);

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    // simulation.stop();
    d3.range(500).forEach(function () {
      simulation.alpha(1).tick();
    });
    simulation.alpha(1).restart();
    // d3.select(canvas)
    //     .call(d3.drag()
    //         .container(canvas)
    //         .subject(dragsubject)
    //         .on("start", dragstarted)
    //         .on("drag", dragged)
    //         .on("end", dragended));

    container.call(
      d3
        .drag()
        .container(container.node())
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    var nodes = container.selectAll(".node").data(graph.nodes);

    var nodesEnter = nodes
      .enter()
      .append("div")
      .attr("class", "node")
      .classed("student", function (d) {
        return d.type !== "topic";
      })
      .style("position", "absolute")
      .each(function (d) {
        // Set background
        if (d.type === "topic") {
          d3.select(this)
            .style("background-color", c(d.name))
            .text(function (d) {
              return d.name;
            });
        } else {
          d3.select(this)
            // .style("background-image", "url("+d.photo+")")
            .attr("id", function (d) {
              return d.nickname;
            })
            .style("width", R + "px")
            .style("height", R + "px")
            .append("a")
            .attr("href", d.homepage)
            .attr("target", "_blank")
            .append("img")
            .style("border-radius", "100%")
            .style("width", "100%")
            .style("height", "100%")
            .attr("src", d.photo)
            .attr("alt", d.name)
            .attr("title", d.name);
        }
      });

    var links = svg.selectAll(".link").data(graph.links);

    var linksEnter = links
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", function (d) {
        return line([d.source, d.target]);
      })
      .style("stroke", function (d) {
        return c(d.target.name);
      });

    function ticked() {
      nodes
        .merge(nodesEnter)
        // .filter(function (d) { return !d.fixed; })
        .style("top", function (d) {
          return d.y + "px";
        })
        .style("left", function (d) {
          return d.x + "px";
        });

      links.merge(linksEnter).attr("d", function (d) {
        return line([d.source, d.target]);
      });

      // context.clearRect(0, 0, width, height);

      // context.beginPath();
      // graph.links.forEach(drawLink);
      // context.strokeStyle = "#aaa";
      // context.stroke();

      // context.beginPath();
      // graph.nodes.forEach(drawNode);
      // context.fill();
      // context.strokeStyle = "#fff";
      // context.stroke();
    }

    function dragsubject() {
      return simulation.find(d3.event.x, d3.event.y);
    }
  }

  update(data);
}

function doProjectList(data) {
  var studentList = d3.select("#studentsList");

  var lists = studentList.selectAll(".studentList").data(
    data.filter(function (d) {
      return d.type !== "topic";
    })
  );

  lists.enter().append("div").attr("class", "studentList").call(createStudent);

  function createStudent(sel) {
    var row = sel.append("div").attr("class", "row step opacable");

    var nameAndPhoto = row.append("div").attr("class", "col-4");

    nameAndPhoto
      .append("div")
      .attr("class", "studentPhotoHolder")
      .attr("id", function (d) {
        return d.nickname;
      })
      .style("height", "150px");

    nameAndPhoto
      .append("div")
      .attr("class", "studentName")
      .call(function (selName) {
        selName
          .append("a")
          .attr("href", function (d) {
            return d.homepage;
          })
          .attr("target", "_blank")
          .text(function (d) {
            return d.name;
          });
        selName.append("small").text(function (d) {
          return " " + d.level;
        });
      });

    var body = row.append("div").attr("class", "col-8");
    body
      .append("h3")
      .attr("class", "studentProject")
      .append("a")
      .attr("href", function (d) {
        return (
          (d.project_url.indexOf("http") === -1 ? "/students/" : "") +
          d.project_url
        );
      })
      .attr("target", "_blank")

      .text(function (d) {
        return d.thesis;
      });

    body
      .filter(function (d) {
        return d.slides && d.slides !== "";
      })
      .append("span")
      .append("a")
      .attr("href", function (d) {
        return d.slides;
      })
      .attr("target", "_blank")
      .style("margin-right", "1em")
      .text("Slides");

    body
      .filter(function (d) {
        return d.slides && d.slides !== "";
      })
      .append("span")
      .append("a")
      .attr("href", function (d) {
        return d.demo;
      })
      .attr("target", "_blank")
      .text("Demo");

    body
      .append("div")
      .attr("class", "studentProjectDescription")
      .text(function (d) {
        return d.description;
      });

    body
      .filter(function (d) {
        return d.project_thumbnail;
      })
      .append("div")
      .attr("class", "projectThumb")
      .append("a")
      .attr("href", function (d) {
        return d.project_github;
      })
      .append("img")
      .attr("src", function (d) {
        return d.project_thumbnail
          ? d.project_thumbnail
          : "../images/logo_desarrollo_web.png";
      })
      .attr("alt", function (d) {
        return "Image " + d.thesis + " " + d.name;
      });

    sel.append("hr");
  }
}

function clearPhotos() {
  // clear the ones that aren't on the selection anymore
  graph.nodes
    .filter(function (s) {
      return s.fixed && selected.indexOf(s.nickname) === -1;
    })
    .forEach(function (s) {
      s.fixed = false;
      console.log("clear" + s.nickname);
      s.fx = null;
      s.fy = null;

      d3.select(".node.student#" + s.nickname)
        .transition()
        .style("width", R + "px")
        .style("height", R + "px");
    });
}

function movePhoto(nick) {
  console.log("move" + nick);
  var node = dicStudents.get(nick),
    boundingRect = d3
      .select(".studentPhotoHolder#" + nick)
      .node()
      .getBoundingClientRect(),
    networkBoundingRect = d3
      .select("#studentsViz")
      .node()
      .getBoundingClientRect();

  console.log("movePhoto boundingRect", boundingRect);
  console.log("movePhoto NetboundingRect", networkBoundingRect);

  var bigWidth = 120;
  node.fixed = true;
  selected.push(nick);
  d3.select(".node#" + nick)
    .transition()
    .ease(d3.easePolyOut)
    .duration(2500)
    .tween("style.left", function () {
      var target = boundingRect.left - networkBoundingRect.left + bigWidth / 2,
        // nSel = this,
        i = d3.interpolateNumber(node.x, target);
      return function (t) {
        // nSel.setAttribute("style.left", i(t) + "px");
        // node.fixed=true;
        if (node.fixed) {
          node.fx = i(t);
        }
      };
    })
    .tween("style.top", function () {
      var target = boundingRect.top - networkBoundingRect.top + bigWidth / 2,
        // nSel = this,
        i = d3.interpolateNumber(node.y, target);
      return function (t) {
        // nSel.setAttribute("style.top", i(t) + "px");
        // node.fixed=true;
        if (node.fixed) {
          node.fy = i(t);
        }

        // console.log(i(t));
      };
    })
    .style("width", bigWidth + "px")
    .style("height", bigWidth + "px");
  // .style("left",  + "px")
  // .style("top", (boundingRect.top+window.pageYOffset) + "px" );

  simulation.alphaTarget(0.3).restart();
}

function updateFromGSheet(data) {
  data = data.filter(function (d) {
    return d.disabled === "";
  });
  doNetwork(data);
  doProjectList(data);
  setupScroller();
}

// function init() {
//   Tabletop.init({ key: urlHtml,
//     callback: updateFromGSheet,
//     simpleSheet: true
//   });
// }

// // Update from googleSheets
// window.onload = function() { init(); };

const urlCSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQfJkGjXoOhIMxgrNNMD2tjsa0NsNTgrS7pkFlg8djlJffOu30kTOYGC3NnZWIJ3ibx83SrhxuM6Bu0/pub?gid=0&single=true&output=csv";
d3.csv(urlCSV, (err, data) => {
  if (err) throw err;
  updateFromGSheet(data);
});

function setupScroller() {
  // Jim Vallandingan"s scrolling code
  // setup scroll functionality
  var scroll = scroller().container(d3.select(".students"));

  var steps = d3.selectAll(".step");
  // pass in .step selection as the steps
  scroll(steps);

  // setup event handling
  scroll.on("active", function (index) {
    // highlight current step text
    d3.selectAll(".step.opacable").style("opacity", function (d, i) {
      return i >= index - 2 && i <= index ? 1 : 0.1;
    });

    // activate current section
    // plot.activate(index);
    console.log(index);

    selected = [];
    if (index > 1) {
      movePhoto(graph.nodes[index - 2].nickname);
    }
    if (index > 0) {
      movePhoto(graph.nodes[index - 1].nickname);
    }
    if (index !== 0 && index < steps.nodes().length - 1) {
      movePhoto(graph.nodes[index].nickname);
    }
    // if (index!== 0 && index < steps.nodes().length -2){
    //   movePhoto(graph.nodes[index+1].nickname);
    // }
    clearPhotos();
  });

  // scroll.on("progress", function (index, progress) {
  //   // plot.update(index, progress);
  //   // console.log(index + " - "  + "progress");
  // });
}
