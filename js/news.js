/* global d3 */

const dateFmt = d3.timeParse("%m/%d/%Y");

d3.csv(
  "./projects.csv",
  row => {
    row.date = dateFmt(row.date);
    return row;
  },
  (err, projects) => {
    if (err) throw err;

    console.log("projects", projects);
    projects = projects.sort((a, b) => d3.descending(a.date, b.date));

    const projectsSel = d3
      .select("#projectsList")
      .selectAll("div")
      .data(projects);

    projectsSel
      .enter()
      .append("div")
      .call(div => {
        console.log("call", div.nodes());

        div
          .append("img")
          .attr("src", p => "img/projs/" + p.thumb)
          .style("width", "150px");

        div
          .filter(d => d.url)
          .append("a")
          .attr("href", d => d.url)
          .text(d => " " + d.project);

        div
          .filter(d => !d.url)
          .append("span")
          .text(d => " " + d.project);
      });
  }
);
