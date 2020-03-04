
//$(function() {
//    queue()
//        .defer(d3.csv,"durations_moreThanDay.csv")
//        .defer(d3.csv,"allCentroids.csv")
//	.await(dataDidLoad);
//})
var centroidsFile = d3.csv("allCentroids.csv")
var finishedGids = d3.json("finished_gids.json")
Promise.all([centroidsFile,finishedGids])
.then(function(data){
	//console.log(data[0])
	dataDidLoad(data[0],data[1])
})
var zoom = 15
var finishedIds = 0
var finished = []
var centroidsData = null
var geoidIndex = 4000
var placesData = null
var totalIds = null
var gids = null
var finishedGids = null
var finishedIdsFile = "finished_gids.json"

function dataDidLoad(centroidsFile,finished){
    console.log(finished)
    centroidsData = makeDictionary(centroidsFile)
	//placesData = getIdsFromDuration(places).sort()
    gids = getAllGid(centroidsFile)
    totalIds = gids.length
    // console.log(totalIds)
	mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
	//mapboxgl.accessToken ="pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ"
		var currentId =gids[geoidIndex]
		//var currentId ="1400000US01003010500"
		var center = [centroidsData[currentId]["lng"],centroidsData[currentId]["lat"]]
     //   console.log(centroidsData["1400000US01003010500"])
 //   console.log(center)
    
   var map = new mapboxgl.Map({
        container: 'map',
		style: 'mapbox://styles/jjjiia123/cjfo6vnob2pgp2rqux8au0p0o',
		center:center,
        zoom: zoom,
        preserveDrawingBuffer: true    
    });

   // var gidsList = finished.map(a => a.Gids);
//console.log(gidsList)
   finishedGids = finished.gids
    
	map.on("load",function(){
		
		moveMap(map,center,currentId)
	})
}  
var saveData = (function(data,fileName){
 
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
 
function getAllGid(centroidsFile){
    var gids = []
    //sort by area size
    centroidsFile.sort( function(a, b) {
      return (a.Gid - b.Gid);
    });
    //console.log(centroidsFile)
    for(var i in centroidsFile){
        if(centroidsFile[i].area>0){
            gids.push(centroidsFile[i].Gid)
        }else{
            console.log("no area")
        }
    }
    return gids
}

function getIdsFromDuration(data){
	var formatted = []
	for(var i in data){
		if(Object.keys(formatted).indexOf(data[i].id)==-1){
			formatted.push(data[i].id)
		}
	}
	return formatted
}
function makeDictionary(data){
    var formatted = {}
    for(var i in data){
        var gid = data[i]["Gid"]
        formatted[gid]=data[i]
    }
    return formatted
}
function zoomToBounds(map,boundary,bearing){
    //https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
   // console.log(intervals[intervals.length-1])
    var coordinates = boundary.coordinates[0]
    var bounds = coordinates.reduce(function(bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds,{padding:20},{bearing:bearing})
  //  map.fitBounds(bounds,{padding:20})
	//zoomToBounds(map,boundary)
     
}
function loadBoundaries(map,gid,bearing){
	var file = d3.json("../census/geoProcessing/tract_geojsons/"+gid.replace("1400000US","")+".geojson")
	Promise.all([file])
	.then(function(d){
		var boundary = d[0].features[0].geometry
		zoomToBounds(map,boundary,bearing)
		//map.addLayer({
		//	"id":"tract_boundaries",
		//	"name":"tract_boundaries",
		//	"type":"line",
		//	"source":{
		//		"type":"geojson",
		//		"data":{
		//			"type":"Feature",
		//			 "geometry":boundary
		//		}
		//	},
		//	"paint":{
		//		"line-color":"#fff"
		//	}
		//})
	})
}
//https://jsfiddle.net/Mourner/zbdu3fkg/?utm_source=website&utm_medium=embed&utm_campaign=zbdu3fkg
function analyzeLine(bins, ruler, line,numBins) {
	var bearings = []
    for (var i = 0; i < line.length - 1; i++) {
        var bearing = ruler.bearing(line[i], line[i + 1]);
        var distance = ruler.distance(line[i], line[i + 1]);

        var k0 = Math.round((bearing + 360) * numBins / 360) % numBins; // main bin

        bins[k0] += distance;
    }
	return bearings
}
function getOrientation(map,center){
    var ruler = cheapRuler(map.getCenter().lat);
	
    var features = map.queryRenderedFeatures({layers: ['road']});
    var bounds = map.getBounds();
	var numBins = 100; // number of orientation bins spread around 360 deg.
	var bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
	var bins = new Float64Array(numBins);
	
	for (var i = 0; i < features.length; i++) {
	        var geom = features[i].geometry;
	        var lines = geom.type === 'LineString' ? [geom.coordinates] : geom.coordinates;
	        // clip lines to screen bbox for more exact analysis
	        var clippedLines = [];
	        for (var j = 0; j < lines.length; j++) {
	            clippedLines.push(lines[j]);
	        }
			for (j = 0; j < clippedLines.length; j++) {
		            analyzeLine(bins, ruler, clippedLines[j], numBins);
		        }
		}	
	    var binMax = Math.max.apply(null, bins);
		var binMaxNumber = bins.indexOf(binMax)
		var bearing = 360/numBins*binMaxNumber+360/numBins
		//console.log(bearing)
		 map.flyTo({
                center:center,
			 bearing:bearing,
			 zoom:15
		 })
		 return bearing
	   //  var coordinates = boundary.coordinates[0]
	   //  var bounds = coordinates.reduce(function(bounds, coord) {
	   //      return bounds.extend(coord);
	   //  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
	   //  map.fitBounds(bounds,{padding:20})
}

function moveMap(map,center,gid){
    if(finishedGids.indexOf(gid)==-1){
    	finishedGids.push(gid)
        saveData({gids:finishedGids}, finishedIdsFile);
		
	 	var bearing = getOrientation(map,center)
		//	loadBoundaries(map,gid)
	//console.log([gid, bearing])
			  
			loadBoundaries(map,gid,bearing)
			  
                map.once('moveend',function(){
					console.log(gid)
				    var filter = ['!=', 'AFFGEOID',gid];
					map.setFilter("tracts_highlight",filter)
					
                    setTimeout(function(){
						geoidIndex+=1
						if(geoidIndex>totalIds-1){
							return
						}
                        makePrint(map,gid)		
                     }, 10000);
                });  
    }else{
        console.log("already downloaded")
        geoidIndex+=1
        var nextGid = gids[geoidIndex]
        var nextCenter = centroidsData[nextGid]
        moveMap(map,nextCenter,nextGid)
    }
}

function makePrint(map, gid){
        var canvas = document.getElementsByClassName("mapboxgl-canvas")[0]
	
	    canvas.toBlob(function(blob) {
	               saveAs(blob, gid+".png");
	           }, "image/png");
			  var nextGid = gids[geoidIndex]
			  // var nextGid ="1400000US01003010500"
			   
			   var nextCenter = centroidsData[nextGid]
			   //console.log(nextGid)
			   moveMap(map,nextCenter,nextGid)
}
