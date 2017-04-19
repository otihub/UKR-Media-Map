var tour = new Tour({
  backdrop:true,
  steps: [
  {
    title: "Hello World",
    content: "From November 27-December 25, 2015 and again from x to y surveys were held to study media preferences and political orientations in South and East Ukraine. This interactive will give you access to certain aspects of this effort, the full dataset is available on the IMI website.",
    orphan: true
  },
  {
    element: "#map",
    title: "The Map",
    backdrop:false,
    content: "Data was collected in the highlighted oblasts. More effort was put into collecting around the cities highlighted in red. Click on any of these to filter on geography.",
    onShown: function(){
      $(".tour-backdrop").appendTo("#map");
      $(".tour-step-background").appendTo("#map");
    }

  },
  {
    element: "#first",
    placement: "left",
    title: "Overview",
    content: "View the name of the area you have filtered on. Click the 'reset filters' option to clear all."
  },
  {
    element: "#radioTree",
    title: "Tree Maps",
    content: "These are called tree maps, they showcase the top 10 media preferences. The size of each square shows the relative proportion of that media outlet amongst the top ten. The percentages displayed represent the percentage of all filtered respondants who chose this outlet as their favorite.",
    onShown: function(){
      $(".tour-backdrop").appendTo("#radioTree");
      $(".tour-step-background").appendTo("#radioTree");
    	}
	},
    {
      element: "#radioBarChart",
      title: "Bar Charts",
      content: "You can filter the data based on any of the categories in these barcharts by clicking on its row!",
      onShown: function(){
        $(".tour-backdrop").appendTo("#radioBarChart");
        $(".tour-step-background").appendTo("#radioBarChart");
      }
  }

]});
