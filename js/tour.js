var tour = new Tour({
  backdrop:true,
  steps: [
  {
    title: "Hello World",
    content: "From November 27-December 25, 2015 and again from x to y surveys were held to study media preferences and political orientations in the South and East of Ukraine. About 1500 face-to-face interviews and 400 computer-assisted telephone interviews were held.",
    orphan: true
  },
  {
    element: "#first",
    placement: "left",
    title: "Overview",
    content: "View the name of the area you have filtered on. Click the 'reset filters' option to clear all."
  },
  {
    element: "#map",
    title: "The Mapz",
    backdrop:false,
    content: "Data was collected in the highlighted oblasks. More effort was put into collecting around the cities highlighted in red. Click on any of these to filter on geography.",
    onShown: function(){
      $(".tour-backdrop").appendTo("#map");
      $(".tour-step-background").appendTo("#map");
    }

  },
  {
    element: "#radioTree",
    title: "Tree Maps",
    backdrop:false,
    content: "These are called tree maps, they showcase the top 10 media preferences within the set of data you have filtered. The size of the square shows the relative proportion of that media source amongst the top ten. The percentages displayed represent that sources share of expressed media preferences",
    onShown: function(){
      $(".tour-backdrop").appendTo("#radioTree");
      $(".tour-step-background").appendTo("#radioTree");
    }
  }

]});
