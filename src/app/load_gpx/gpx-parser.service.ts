import { Injectable } from '@angular/core';




interface Track {
  name?: string;
  tracksegments:  Array<any>[];
}


interface Route {
  name?: string;
}

interface Waypoint {
  name?: string;
}

interface GPXData {
  metadataName?: string;
  tracks: Track[];
  routes: Route[];
  waypoints: Waypoint[];
}


@Injectable({
  providedIn: 'root'
})
export class GpxParserService {

  letructor() { }

  parseGPX(gpxData: string): GPXData{
      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(gpxData, "text/xml");
      const metadata = xmlDoc.getElementsByTagName("metadata")[0];
      let metadataname = ""
      
      if (metadata === undefined || metadata.getElementsByTagName("name")[0] === undefined) {
        metadataname = "default Metadata"
       
      }else{
        metadataname = metadata.getElementsByTagName("name")[0]?.textContent;
      }
      
      
      
      let tracks = xmlDoc.getElementsByTagName("trk");
      let parsedTracks: Track[] = [];
      let trackSegments =[];
      
      for (let i = 0; i < tracks.length; i++) {
        let track = tracks[i];
        let trackName = track.getElementsByTagName("name")[0]?.textContent;
        let tracksegs = track.getElementsByTagName("trkseg");
        
        for (let j = 0; j < tracksegs.length; j++) {
          let trackseg = tracksegs[j];
          let trackpts = trackseg.getElementsByTagName("trkpt");
        }
        parsedTracks.push({ name: trackName, tracksegments: trackSegments });
      }
      

      let routes = xmlDoc.getElementsByTagName("rte");
      let parsedRoutes: Route[] = [];
    
      for (let i = 0; i < routes.length; i++) {
        let route = routes[i];
        let routeName = route.getElementsByTagName("name")[0]?.textContent;
        parsedRoutes.push({ name: routeName });
      }
      
      let waypoints = xmlDoc.getElementsByTagName("wpt");
      let wayPoints: Waypoint[] = [];
      
      for (let i = 0; i < waypoints.length; i++) {
        let waypoint = waypoints[i];
        let name = waypoint.getElementsByTagName("name")[0]?.textContent;
        wayPoints.push({ name });
      }
    
      return {
        metadataName: metadataname,
        tracks: parsedTracks,
        routes: parsedRoutes,
        waypoints: wayPoints
      };
    
  }

  
}
