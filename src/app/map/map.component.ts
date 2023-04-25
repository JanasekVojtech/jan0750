import { Component, AfterViewInit /*, SystemJsNgModuleLoader*/ } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-gpx';
import { LoadGPXService } from '../load_gpx/load-gpx.service';
import { GpxNode } from '../treePrint/gpx-node';
import {HttpClient} from '@angular/common/http';
import './leaflet-contextmenu';
import {MatSnackBar} from '@angular/material/snack-bar';
import { core } from '@angular/compiler';
import { Observable } from 'rxjs';
import 'leaflet.heightgraph'
import'./L.CanvasOverlay';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import {FormControl} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MoveToGpxDialogComponent } from './move-to-gpx-dialog/move-to-gpx-dialog.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  
  normMapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  normMapAttr = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'

  cykloMapUrl = 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png';
  cykloMapAttr = '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  private mymap !:any;
  private normMap  !:any;
  private cykloMap  !:any;
  private baseLayers  !:any;
  private lat :number = 0;
  private lon :number = 0;
  public addWtp:boolean = false;
  public addTrk:boolean = false;
  public addRte:boolean = false;
  public addTrkAuto:boolean = false;
  public routingSelect:any = "off"
  private trkArr: Array<any> = []
  private rteArr: Array<any> = []
  private rteMode:Boolean = false;

  private extendTrk:boolean = false;
  private extendRte:boolean = false;
  private startPoint:Array<number> =[]
  private endPoint:Array<number> =[]
  private extendObj:any ={}
  private myDefWeight:number = 6
  private myHoverWeight:number = 8
  private allArr: Array<any> = []
  private moveWaypoint:boolean = false;
  private moveWaypointObj:any ={$:{}}
  private moveTrack:boolean = false;
  private moveTrackObj:any = [0,0]
  private moveRoute:boolean = false;
  private moveRouteObj:any = [0,0];
  private drawLayer: any
 
  

  private iconWtpDef = L.icon({
    iconUrl: "../../assets/images/wtpIcons/Flag.png",
    iconSize:     [24, 24], // size of the icon
    iconAnchor:   [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
  });  


  
 
 

  private initMymap(): void {
   
    //if (this.mymap != undefined) { this.mymap.invalidateSize(); }
    this.normMap = L.tileLayer(this.normMapUrl, {maxZoom: 19, attribution: this.normMapAttr});
    this.cykloMap = L.tileLayer(this.cykloMapUrl, {maxZoom: 19, attribution: this.cykloMapAttr});
    this.mymap = L.map('map', {
      //@ts-ignore
      contextmenu: true,
      contextmenuWidth: 180,
	    contextmenuItems: [
      { text: 'Add Waypoint',
      callback: (e:any) => { this.addWtpOnRightClick(e);},
      icon: '../../assets/images/baseline_place_black_24dp.png',},
      {separator: true},
      { text: 'Add Track',
	    callback: (e:any) => { this.onValChangeTrk(true); this.trkArr.push([e.latlng.lat, e.latlng.lng])},
      icon: '../../assets/images/baseline_timeline_black_24dp.png'},
      { text: 'Add TrackAuto',
	    callback: (e:any) => { this.onValChangeTrkAuto(true); this.trkArr.push([e.latlng.lat, e.latlng.lng])},
      icon: '../../assets/images/baseline_find_replace_black_24dp.png'},
      {separator: true},
      { text: 'Add Route',
	    callback: (e:any) => { this.onValChangeRte(true); this.rteArr.push([e.latlng.lat, e.latlng.lng])},
      icon: '../../assets/images/baseline_route_black_24dp.png'},
      {separator: true},
      { text: 'Exit drawing',
	    callback: (e:any) => { this.exitDrawing(); },
      icon: '../../assets/images/baseline_close_black_24dp.png'},
      
    ],
      editable: true,
      center: [50.177,  14.365],
      zoom: 8,
      layers: this.normMap
    });

    this.baseLayers = {
      "Standard": this.normMap,
      "Cyklo map": this.cykloMap
    };
    
    const provider = new OpenStreetMapProvider();
    const searchControl =  GeoSearchControl({
      provider: provider,
    });

    this.mymap.addControl(searchControl);
    
    this.loadGPXService.delWtp.subscribe(obj=> {this.delWaypoint(obj)});
    this.loadGPXService.delLine.subscribe(obj=> {this.delLine(obj)});
    this.loadGPXService.mapData.subscribe(node=> {this.setGPX(node)} );
    this.loadGPXService.hideData.subscribe(data=> {this.hideGPX(data)});
    this.loadGPXService.shPoint.subscribe(data=> {this.showPoint(data)});
    this.loadGPXService.shMode.subscribe(mode=> {this.showMode(mode)});
    
    
    
    const onMapClick = async (e:any) =>  {
    if(this.ifGpxIsSelected()){
      if(this.addTrk || this.addRte || this.addTrkAuto || this.extendRte || this.extendTrk){
        let canvas: any = null;
        if(this.drawLayer != undefined){
          if(this.mymap.hasLayer(this.drawLayer)){
            this.mymap.removeLayer(this.drawLayer)
          }
        }
    
  
      this.drawLayer = L.canvasLayer()
      .delegate({
        onDrawLayer: drawingOnCanvas
      }) // -- if we do not inherit from L.CanvasLayer we can setup a delegate to receive events from L.CanvasLayer
      .addTo(this.mymap);
      let lng_min:any
      let lng_max:any
      let lat_min:any
      let lat_max:any
      let width:any
      let height:any

      function drawingOnCanvas(o: any) {
        console.log(o);
        lng_min = o.bounds._southWest.lng
        lng_max = o.bounds._northEast.lng
        lat_min = o.bounds._southWest.lat
        lat_max = o.bounds._northEast.lat
        width = o.size.x
        height = o.size.y
        canvas = o.canvas;
        var ctx = o.canvas.getContext('2d');
        ctx.clearRect(0, 0, o.canvas.width, o.canvas.height);
        ctx.fillStyle = "rgba(255,116,0, 0.2)";    
        ctx.beginPath();
        };


    


        this.mymap.addEventListener('mousemove', (y:any) => {
          let p = (y as any).layerPoint;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = "rgba(255,116,0, 0.2)";
          ctx.beginPath();
          ctx.setLineDash([5, 15]);
          //console.log(e.originalEvent.clientX,  e.originalEvent.clientY,"|||||||||",p.x, p.y,"|||||||||", e.layerPoint.x, e.layerPoint.y,"|||||||||", y) 
         // console.log(lng_min, lng_max, lat_min, lat_max, width, height, e.latlng.lng, e.latlng.lat)
         // console.log(" Lat to X:", (e.latlng.lng - lng_min) * width / (lng_max - lng_min))
         // console.log(" Lat to Y:", (height - ((e.latlng.lat - lat_min) * height / (lat_max - lat_min))))
         //console.log(y,p.x, p.y)
          ctx.moveTo( (e.latlng.lng - lng_min) * width / (lng_max - lng_min), (height - ((e.latlng.lat - lat_min) * height / (lat_max - lat_min))));
          ctx.lineTo(y.containerPoint.x, y.containerPoint.y);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.stroke();           
        });

      }
      if(this.addWtp){
        this.lat = e.latlng.lat
        this.lon = e.latlng.lng
        this.loadGPXService.newWaypoint(this.lat, this.lon) 
        let newObj : any = this.loadGPXService.getNewObj() 
        newObj.sym = 'Flag'  
        let marker = L.marker([this.lat,this.lon],
          { 
          icon: this.iconWtpDef,
          //@ts-ignore
          contextmenu: true,
          contextmenuWidth: 180,
          contextmenuItems: [
          { text: 'Delete Waypoint',
          callback: (e:any) => { this.delWtpByClick(e); }, index: 1,
          icon: '../../assets/images/baseline_close_black_24dp.png'},
          { text: 'Move Waypoint',
          callback: (e:any) => { this.moveWtp(e); }, index: 2,
          icon: '../../assets/images/baseline_open_with_black_24dp.png'},
          { text: 'Copy of Waypoint',
          callback: (e:any) => { this.copyWaypoint(e); }, index: 3,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
          { text: 'Move to another GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'wtp'); }, index: 4,
          icon: '../../assets/images/baseline_move_black_24dp.png'}

        ]  
        }  
        ).on('dblclick', (e:any)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"wtp"})}).addTo(this.mymap);
        console.log(newObj);
        (marker as any)['myData'] = newObj;
     }
     if(this.addTrk){
        this.lat = e.latlng.lat
        this.lon = e.latlng.lng
        this.trkArr.push([this.lat, this.lon])
        console.log(this.trkArr)
        this.mymap.eachLayer( (layer:any) =>{
          if(layer instanceof L.Polyline){
            if((layer as any)['myData'] == 0){
              this.mymap.removeLayer(layer) 
              
              let polyline = L.polyline(this.trkArr).addTo(this.mymap);
              this.polylineHower(polyline);
              (polyline as any)['myData'] = 0;
            }
          }else{
            
            let polyline = L.polyline(this.trkArr).addTo(this.mymap);
            this.polylineHower(polyline);
              (polyline as any)['myData'] = 0;
          }
        });
     } 
     if(this.addRte){
      
      this.lat = e.latlng.lat
      this.lon = e.latlng.lng
      this.rteArr.push([this.lat, this.lon])
      console.log(this.rteArr)
      if(this.rteMode){
        if(this.rteArr.length >=2 ){
          let waypointsArr = await this.getCoordinatesApiData(this.rteArr)
          this.mymap.eachLayer( (layer:any) =>{
            if(layer instanceof L.Polyline){
              if((layer as any)['myData'] == 0){
                this.mymap.removeLayer(layer) 
                let polyline = L.polyline(waypointsArr).addTo(this.mymap);
                this.polylineHower(polyline);
                (polyline as any)['myData'] = 0;
              }
            }else{
              let polyline = L.polyline(waypointsArr).addTo(this.mymap);
              this.polylineHower(polyline);
                (polyline as any)['myData'] = 0;
            }
          });
        }
      }else{
        this.mymap.eachLayer( (layer:any) =>{
          if(layer instanceof L.Polyline){
            if((layer as any)['myData'] == 0){
              this.mymap.removeLayer(layer) 
              let polyline = L.polyline(this.rteArr).addTo(this.mymap);
              this.polylineHower(polyline);
              (polyline as any)['myData'] = 0;
            }
          }else{
            let polyline = L.polyline(this.rteArr).addTo(this.mymap);
            this.polylineHower(polyline);
              (polyline as any)['myData'] = 0;
          }
        });
      }
      
   } 
   if(this.addTrkAuto){
    this.lat = e.latlng.lat
    this.lon = e.latlng.lng
    this.trkArr.push([this.lat, this.lon])
    if(this.trkArr.length >=2 ){
      let waypointsArr = await this.getCoordinatesApiData(this.trkArr)
      this.mymap.eachLayer( (layer:any) =>{
        if(layer instanceof L.Polyline){
          if((layer as any)['myData'] == 0){
            this.mymap.removeLayer(layer) 
            let polyline = L.polyline(waypointsArr).addTo(this.mymap);
            this.polylineHower(polyline);
            (polyline as any)['myData'] = 0;
          }
        }else{
          let polyline = L.polyline(waypointsArr).addTo(this.mymap);
          this.polylineHower(polyline);
            (polyline as any)['myData'] = 0;
        }
      });
    }
   }
   if(this.extendTrk){
    this.lat = e.latlng.lat
    this.lon = e.latlng.lng
    if(this.trkArr.length == 0){
      this.findNearestTrkPoint([this.lat, this.lon])
    }else{
      this.trkArr.push([this.lat, this.lon])
    }
      

    this.mymap.eachLayer( (layer:any) =>{
      if(layer instanceof L.Polyline){
        if((layer as any)['myData'] == 0){
          this.mymap.removeLayer(layer) 
          let polyline = L.polyline(this.trkArr).addTo(this.mymap);
          this.polylineHower(polyline);
          (polyline as any)['myData'] = 0;
        }
      }else{
        let polyline = L.polyline(this.trkArr).addTo(this.mymap);
        this.polylineHower(polyline);
          (polyline as any)['myData'] = 0;
      }
    });
    
    }
    if(this.extendRte){
      this.lat = e.latlng.lat
      this.lon = e.latlng.lng
      if(this.rteArr.length == 0){
        this.findNearestRtePoint([this.lat, this.lon])
      }else{
        this.rteArr.push([this.lat, this.lon])
      }
        
  
      if(this.rteMode){
          let waypointsArr = await this.getCoordinatesApiData(this.rteArr)
          this.mymap.eachLayer( (layer:any) =>{
            if(layer instanceof L.Polyline){
              if((layer as any)['myData'] == 0){
                this.mymap.removeLayer(layer) 
                let polyline = L.polyline(waypointsArr).addTo(this.mymap);
                this.polylineHower(polyline);
                (polyline as any)['myData'] = 0;
              }
            }else{
              let polyline = L.polyline(waypointsArr).addTo(this.mymap);
              this.polylineHower(polyline);
                (polyline as any)['myData'] = 0;
            }
          });
        
      }else{
        this.mymap.eachLayer( (layer:any) =>{
          if(layer instanceof L.Polyline){
            if((layer as any)['myData'] == 0){
              this.mymap.removeLayer(layer) 
              let polyline = L.polyline(this.rteArr).addTo(this.mymap);
              this.polylineHower(polyline);
              (polyline as any)['myData'] = 0;
            }
          }else{
            let polyline = L.polyline(this.rteArr).addTo(this.mymap);
            this.polylineHower(polyline);
              (polyline as any)['myData'] = 0;
          }
        });
      }
    }
    if(this.moveWaypoint || this.moveTrack || this.moveRoute){
      if(this.mymap.hasLayer(this.drawLayer)){
        this.mymap.removeLayer(this.drawLayer)
      }
      console.log("move",  e.latlng.lat)
      this.moveWaypointObj.$.lat = e.latlng.lat.toString()
      this.moveWaypointObj.$.lon =  e.latlng.lng.toString()
      this.deleteAllInMap()
      this.loadGPXService.refreshVisibleGpx();
      this.moveWaypoint = false
      
    }
    if(this.moveTrack){
      console.log(this.moveTrackObj)
      this.moveTrackObj.obj.trkpt[this.moveTrackObj.id].$.lat = e.latlng.lat.toString()
      this.moveTrackObj.obj.trkpt[this.moveTrackObj.id].$.lon =  e.latlng.lng.toString()
      this.deleteAllInMap()
      this.loadGPXService.refreshVisibleGpx();
      this.moveTrack = false
      this.showHidePoints(this.moveTrackObj.obj)
      
    }
    if(this.moveRoute){
      console.log(this.moveRouteObj)
      this.moveRouteObj.obj.rtept[this.moveRouteObj.id].$.lat = e.latlng.lat.toString()
      this.moveRouteObj.obj.rtept[this.moveRouteObj.id].$.lon =  e.latlng.lng.toString()
      this.deleteAllInMap()
      this.loadGPXService.refreshVisibleGpx();
      this.moveRoute = false
      this.showHidePoints(this.moveRouteObj.obj)
      
    }
  }else{
    console.log("Select file to edit")
    let snackBarRef = this._snackBar.open('Select file to edit', 'Hide',{"duration": 2000});
    
    if(this.rteArr.length != undefined)
      this.rteArr.pop()
    if(this.trkArr.length != undefined)
      this.trkArr.pop()
    this.exitDrawing()
  } 
     
    

  }
  this.mymap.on('click', onMapClick);
  
  const layers = L.control.layers(this.baseLayers, ).addTo(this.mymap);
  layers.setPosition('topleft');
  }




  
  constructor(private loadGPXService:LoadGPXService, private http:HttpClient, private _snackBar: MatSnackBar, public dialog:MatDialog) {}



  public async setGPX(node:GpxNode){
    if(node.children){
      console.log(node.children)
      this.allArr = []
      if(node.children[1] !== undefined){
        let iconWtp
        for(let i = 0 ; i < node!.children![1]?.children!.length; i++){
          if(node.children![1]?.children![i].obj.sym != undefined){
            iconWtp = L.icon({
            iconUrl: "../../assets/images/wtpIcons/"+ node.children![1]?.children![i].obj.sym + '.png',
            iconSize:     [24, 24], // size of the icon
            iconAnchor:   [12, 12], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
          });
          }else{
            iconWtp = this.iconWtpDef
          }
          
          let marker = L.marker([node.children![1]?.children![i].obj.$.lat, node.children![1]?.children![i].obj.$.lon],
            { 
              icon: iconWtp,
              //@ts-ignore 
              contextmenu: true,
              contextmenuWidth: 180,
              contextmenuItems: [
              { text: 'Delete Waypoint',
              callback: (e:any) => { this.delWtpByClick(e); }, index: 1,
              icon: '../../assets/images/baseline_close_black_24dp.png'},
              { text: 'Move Waypoint',
              callback: (e:any) => { this.moveWtp(e); }, index: 2,
              icon: '../../assets/images/baseline_open_with_black_24dp.png'},
              { text: 'Copy of Waypoint',
              callback: (e:any) => { this.copyWaypoint(e); }, index: 3,
              icon: '../../assets/images/content_copy_FILL_24pd.png'},
              { text: 'Move to another GPX',
              callback: (e:any) => { this.moveToGpx(node.children![1]?.children![i].obj, 'wtp'); }, index: 4,
              icon: '../../assets/images/baseline_move_black_24dp.png'}
            ]  
            }
            ).on('dblclick', (e:any)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"wtp"})}).addTo(this.mymap);
          (marker as any)['myData'] = node.children![1]?.children![i].obj;
          this.allArr.push([node.children![1]?.children![i].obj.$.lat,node.children![1]?.children![i].obj.$.lon])
        }
      }
      
      if(node.children[3] !== undefined){
        for(let i = 0 ; i < node!.children![3]?.children!.length; i++){
          for(let j = 0 ; j < node!.children![3]?.children![i].children!.length;j++){
            let trkArray : Array<any> = []
            
            
            console.log(node!.children![3]?.children![i].children![j])
            console.log(node!.children![3]?.children![i].children![j].obj.trkpt)
            for(let k = 0 ; k < node!.children![3]?.children![i].children![j].obj.trkpt.length;k++){
              trkArray.push([node!.children![3]?.children![i].children![j].obj.trkpt[k].$.lat, node!.children![3]?.children![i].children![j].obj.trkpt[k].$.lon])
              this.allArr.push([node!.children![3]?.children![i].children![j].obj.trkpt[k].$.lat, node!.children![3]?.children![i].children![j].obj.trkpt[k].$.lon])
             
            }
          


            let drawColor
            if(node!.children![3]?.children![i].children![j].obj.extensions != undefined){
              if(node!.children![3]?.children![i].children![j].obj.extensions['gpxx:TrackExtension']!= undefined){
                if(node!.children![3]?.children![i].children![j].obj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']!= undefined){
                  drawColor = node!.children![3]?.children![i].children![j].obj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']
                }
              }
            }else{
              drawColor = "#3388ff"
            }
            let polyline = L.polyline(trkArray,
              { 
                color: drawColor,
                //@ts-ignore
                contextmenu: true,
                contextmenuWidth: 180,
                contextmenuItems: [
                { text: 'Delete Track',
                callback: (e:any) => { this.delTrkByClick(e, node!.children![3]?.children![i].children![j].obj);},index: 4,
                icon: '../../assets/images/baseline_delete_black_24dp.png'},
                { text: 'Continue Track',
                callback: (e:any) => { this.extendTrack(e, node!.children![3]?.children![i].children![j].obj); },index: 5,
                icon: '../../assets/images/baseline_east_black_24dp.png'},
                { text: 'Add Track point',
                callback: (e:any) => { this.addTrackPoint(e, node!.children![3]?.children![i].children![j].obj); },index: 6,
                icon: '../../assets/images/baseline_add_black_24dp.png'},
                { text: 'Split Track',
                callback: (e:any) => { this.splitTrack(e, node!.children![3]?.children![i].children![j].obj); },index: 7,
                icon: '../../assets/images/baseline_call_split_black_24dp.png'},
                { text: 'Show/Hide Track points',
                callback: (e:any) => { this.showHidePoints( node!.children![3]?.children![i].children![j].obj); },index: 8,
                icon: '../../assets/images/baseline_visibility_black_24dp.png'},
                { text: 'Reverse Track',
                callback: (e:any) => { this.reverseTrack(node!.children![3]?.children![i].children![j].obj); },index: 9,
                icon: '../../assets/images/baseline_sync_alt_24dp.png'},
                { text: 'Copy of Track',
                callback: (e:any) => { this.copyTrack(node!.children![3]?.children![i].children![j].obj); },index: 10,
                icon: '../../assets/images/content_copy_FILL_24pd.png'},
                { text: 'Show graph of Track',
                callback: (e:any) => { this.showGraph(node!.children![3]?.children![i].children![j].obj.trkpt); },index: 11,
                icon: '../../assets/images/icons8-graph-24.png'},
                { text: 'Move Track to other GPX',
                callback: (e:any) => { this.moveToGpx(node!.children![3]?.children![i].children![j].obj, 'trk'); }, index: 12,
                icon: '../../assets/images/baseline_move_black_24dp.png'},
                { text: 'Move Track segment to another GPX',
                callback: (e:any) => { this.moveToGpx(node!.children![3]?.children![i].children![j].obj, 'trkseg'); }, index: 13,
                icon: '../../assets/images/baseline_move_black_24dp.png'}
              ]  
              }
              ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"trkseg"})}).addTo(this.mymap);
              this.polylineHower(polyline);
            (polyline as any)['myData'] = node!.children![3]?.children![i].children![j].obj;
            if(node!.children![3]?.children![i].children![j].obj.extensions != undefined){
              if(node!.children![3]?.children![i].children![j].obj.extensions['gpxx:TrackExtension']!= undefined){
                if(node!.children![3]?.children![i].children![j].obj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']!= undefined){
                  (polyline as any)['color'] = (polyline as any)['color'] = node!.children![3]?.children![i].children![j].obj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']
                }
              }
            }else{
              (polyline as any)['color'] = "#3388ff"
            }
           
          }
          
        }
      }

      
      if(node.children[2] !== undefined){
        for(let i = 0 ; i < node!.children![2]?.children!.length; i++){
          console.log(node!.children![2]?.children![i])
          let rtekArray : Array<any> = []
            for(let k = 0 ; k < node!.children![2]?.children![i].obj.rtept.length;k++){
              rtekArray.push([node!.children![2]?.children![i].obj.rtept[k].$.lat, node!.children![2]?.children![i].obj.rtept[k].$.lon])
              this.allArr.push([node!.children![2]?.children![i].obj.rtept[k].$.lat, node!.children![2]?.children![i].obj.rtept[k].$.lon])
            }
            console
            if(this.rteMode){
              
              let waypointsArr = await this.getCoordinatesApiData(rtekArray)
              let polyline = L.polyline(waypointsArr, 
                { 
                 
                  //@ts-ignore
                  contextmenu: true,
                  contextmenuWidth: 180,
                  contextmenuItems: [
                  { text: 'Delete Route',
                  callback: (e:any) => { this.delRteByClick(e, node!.children![2]?.children![i].obj); },index: 6,
                  icon: '../../assets/images/baseline_close_black_24dp.png'},
                  { text: 'Continue Route',
                    callback: (e:any) => { this.extendRoute(e, node!.children![2]?.children![i].obj); },index: 7,
                    icon: '../../assets/images/baseline_east_black_24dp.png'},
                  { text: 'Add Route point',
                    callback: (e:any) => { this.addRoutePoint(e, node!.children![2]?.children![i].obj); },index: 8,
                    icon: '../../assets/images/baseline_add_black_24dp.png'},
                  { text: 'Split Route',
                    callback: (e:any) => { this.splitRoute(e, node!.children![2]?.children![i].obj); },index: 9,
                    icon: '../../assets/images/baseline_call_split_black_24dp.png'},
                  { text: 'Show/Hide Route points',
                    callback: (e:any) => { this.showHidePoints(  node!.children![2]?.children![i].obj); },index: 10,
                    icon: '../../assets/images/baseline_visibility_black_24dp.png'},
                  { text: 'Reverse Route',
                    callback: (e:any) => { this.reverseRoute(  node!.children![2]?.children![i].obj); },index: 11,
                    icon: '../../assets/images/baseline_sync_alt_24dp.png'},
                  { text: 'Copy of Route',
                    callback: (e:any) => { this.copyRoute(  node!.children![2]?.children![i].obj); },index: 12,
                    icon: '../../assets/images/content_copy_FILL_24pd.png'},
                  { text: 'Show graph of Route',
                    callback: (e:any) => { this.showGraph(node!.children![2]?.children![i].obj.rtept); },index: 13,
                    icon: '../../assets/images/icons8-graph-24.png'},
                  { text: 'Transfer Route to Track',
                    callback: (e:any) => { this.transferRteToTrk(node!.children![2]?.children![i].obj.rtept); },index: 14,
                    icon: '../../assets/images/content_copy_FILL_24pd.png'},
                  { text: 'Move to other GPX',
                    callback: (e:any) => { this.moveToGpx(node!.children![2]?.children![i].obj, 'rte'); }, index: 15,
                    icon: '../../assets/images/baseline_move_black_24dp.png'}
                    
                ]  
                }
                ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"rte"})}).addTo(this.mymap);
                this.polylineHower(polyline);
              (polyline as any)['myData'] = node!.children![2]?.children![i].obj;
              if(node!.children![2]?.children![i].obj.extensions != undefined){
                if(node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']!= undefined){
                  if(node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']!= undefined){
                    (polyline as any)['color'] = (polyline as any)['color'] = node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']
                  }
                }
              }else{
                (polyline as any)['color'] = "#3388ff"
              }
              
              
            }else{
              let drawColor
              if(node!.children![2]?.children![i].obj.extensions != undefined){
                if(node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']!= undefined){
                  if(node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']!= undefined){
                    drawColor = node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']
                  }
                }
              }else{
                drawColor = "#3388ff"
              }
              let polyline = L.polyline(rtekArray, 
                { 
                  color: drawColor,
                  //@ts-ignore
                  contextmenu: true,
                  contextmenuWidth: 180,
                  contextmenuItems: [
                  { text: 'Delete Route',
                  callback: (e:any) => { this.delRteByClick(e, node!.children![2]?.children![i].obj); },index: 6,
                  icon: '../../assets/images/baseline_close_black_24dp.png'},
                  { text: 'Continue Route',
                    callback: (e:any) => { this.extendRoute(e, node!.children![2]?.children![i].obj); },index: 7,
                    icon: '../../assets/images/baseline_east_black_24dp.png'},
                  { text: 'Add Route point',
                    callback: (e:any) => { this.addRoutePoint(e, node!.children![2]?.children![i].obj); },index: 8,
                    icon: '../../assets/images/baseline_add_black_24dp.png'},
                  { text: 'Split Route',
                    callback: (e:any) => { this.splitRoute(e, node!.children![2]?.children![i].obj); },index: 9,
                    icon: '../../assets/images/baseline_call_split_black_24dp.png'},
                  { text: 'Show/Hide Route points',
                    callback: (e:any) => { this.showHidePoints(  node!.children![2]?.children![i].obj); },index: 10,
                    icon: '../../assets/images/baseline_visibility_black_24dp.png'},
                  { text: 'Reverse Route',
                    callback: (e:any) => { this.reverseRoute(  node!.children![2]?.children![i].obj); },index: 11,
                    icon: '../../assets/images/baseline_sync_alt_24dp.png'},
                  { text: 'Copy of Route',
                    callback: (e:any) => { this.copyRoute(  node!.children![2]?.children![i].obj); },index: 12,
                    icon: '../../assets/images/content_copy_FILL_24pd.png'},
                  { text: 'Show graph of Route',
                    callback: (e:any) => { this.showGraph(node!.children![2]?.children![i].obj.rtept); },index: 13,
                    icon: '../../assets/images/icons8-graph-24.png'},
                  { text: 'Transfer Route to Track',
                    callback: (e:any) => { this.transferRteToTrk(node!.children![2]?.children![i].obj.rtept); },index: 14,
                    icon: '../../assets/images/content_copy_FILL_24pd.png'},
                  { text: 'Move to other GPX',
                    callback: (e:any) => { this.moveToGpx(node!.children![2]?.children![i].obj, 'rte'); }, index: 15,
                    icon: '../../assets/images/baseline_move_black_24dp.png'}
                ]  
                }
                ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"rte"})}).addTo(this.mymap);
                this.polylineHower(polyline);
              (polyline as any)['myData'] = node!.children![2]?.children![i].obj;
              if(node!.children![2]?.children![i].obj.extensions != undefined){
                if(node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']!= undefined){
                  if(node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']!= undefined){
                    (polyline as any)['color'] = (polyline as any)['color'] = node!.children![2]?.children![i].obj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']
                  }
                }
              }else{
                (polyline as any)['color'] = "#3388ff"
              }
              
            }
            
        
        }
      }
      
   
    }
    
  }

  showMode(mode:boolean){
    //if(this.allArr != []){
      if(mode){
        this.showPoint(this.allArr) 
      }
    //}
  }

  deleteAllInMap(){
    this.mymap.eachLayer( (layer:any) =>{
      if(layer instanceof L.Marker){
        this.mymap.removeLayer(layer)
      }
      if(layer instanceof L.Polyline){
        this.mymap.removeLayer(layer)
      } 
      
      
    });
  }
 
  hideGPX(node:GpxNode): void{
    console.log(node)
    let objArrMarker:Array<any> = []
    let objArrPolyline:Array<any> = []
    if(node.children){
      for(let i = 0 ; i < node!.children![1]?.children!.length; i++){
        objArrMarker.push(node!.children![1]?.children![i].obj)
      }
    
      for(let i = 0 ; i < node!.children![3]?.children!.length; i++){
        for(let j = 0 ; j < node!.children![3]?.children![i].children!.length;j++){       
          objArrPolyline.push(node!.children![3]?.children![i].children![j].obj)          
        }  
      }
      
      for(let i = 0 ; i < node!.children![2]?.children!.length; i++){         
        objArrPolyline.push(node!.children![2]?.children![i].obj)       
      }
  
      
      this.mymap.eachLayer( (layer:any) =>{
        if(objArrMarker){
          if(layer instanceof L.Marker){
            for(let i=0; i<objArrMarker.length;i++){
              if(objArrMarker[i] === (layer as any)['myData']){
                console.log((layer as any)['myData']);
                this.mymap.removeLayer(layer)
              }
            }
          }
        }
        
        if(objArrPolyline){
          if(layer instanceof L.Polyline){
            for(let i=0; i<objArrPolyline.length;i++){
              if(objArrPolyline[i] === (layer as any)['myData']){
                console.log((layer as any)['myData']);
                this.mymap.removeLayer(layer)
              }
            }
          } 
        }
        
      });
      
    }
    
  }
  public delWtpByClick(e:any){
    console.log(e.relatedTarget.myData)
    this.loadGPXService.deleteWtpByClick(e.relatedTarget.myData);
  }

  public delTrkByClick(e:any, obj:any){
    this.loadGPXService.deleteTrkByClick(obj);
  }

  public delRteByClick(e:any, obj:any){
    this.loadGPXService.deleteRteByClick(obj);
  }

  public delWaypoint(obj:any): void{
    console.log( obj);
    if(obj != "null"){
      let deletedWtp
     this.mymap.eachLayer(function (layer:any){
       if(layer instanceof L.Marker){
         if(obj === (layer as any)['myData']){
           console.log((layer as any)['myData']);
           deletedWtp = layer
         
         }
       }
     });
     
     console.log(deletedWtp)
     if(deletedWtp!=null)
      this.mymap.removeLayer(deletedWtp)   
    }
  }

  public delLine(obj:any): void{
    console.log( obj);
    if(obj != "null"){
      let deletedLine
     this.mymap.eachLayer(function (layer:any){
       if(layer instanceof L.Polyline){
        console.log((layer as any)['myData']);
         if(obj === (layer as any)['myData']){
           console.log((layer as any)['myData']);
           deletedLine = layer
         
         }
       }
     });
    
     if(deletedLine!=null)
     
     console.log((deletedLine as any)['myData']);
      this.mymap.removeLayer(deletedLine)   
    }
  }

  public showPoint(data:any){
    if(data != null){
      console.log(data, "fit bounds")
    if(Object.keys(data).length > 0){
      var bounds = L.latLngBounds(data);
      console.log(bounds)
       this.mymap.fitBounds(bounds);
    //  const marker = L.marker(data[0]).addTo(this.mymap);
      //const marker = L.marker(data[0], this.icon).addTo(this.mymap);
    }
    }
    
  }

  

 
  ngAfterViewInit(): void { 
    this.initMymap();
  }


  

  onValChangeWtp(value:boolean){
    this.addWtp = value
  }

  addWtpOnRightClick(e:any){
    if(this.ifGpxIsSelected()){
      this.lat = e.latlng.lat
      this.lon = e.latlng.lng
      this.loadGPXService.newWaypoint(this.lat, this.lon) 
      let newObj : any = this.loadGPXService.getNewObj()    
      newObj.sym = 'Flag'      
      let marker = L.marker([this.lat,this.lon],
        { 
        icon: this.iconWtpDef,
        //@ts-ignore
        contextmenu: true,
        contextmenuWidth: 180,
        contextmenuItems: [
        { text: 'Delete Waypoint',
        callback: (e:any) => { this.delWtpByClick(e); }, index: 1,
        icon: '../../assets/images/baseline_close_black_24dp.png'},
        { text: 'Move Waypoint',
        callback: (e:any) => { this.moveWtp(e); }, index: 2,
        icon: '../../assets/images/baseline_open_with_black_24dp.png'},
        { text: 'Copy of Waypoint',
        callback: (e:any) => { this.copyWaypoint(e); }, index: 3,
        icon: '../../assets/images/content_copy_FILL_24pd.png'},
        { text: 'Move to another GPX',
        callback: (e:any) => { this.moveToGpx(newObj, 'wtp'); }, index: 4,
        icon: '../../assets/images/baseline_move_black_24dp.png'}
      ]  
      }  
      ).on('dblclick', (e:any)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"wtp"})}).addTo(this.mymap);
      console.log(newObj);
      (marker as any)['myData'] = newObj;
    }else{
      let snackBarRef = this._snackBar.open('Select file to edit', 'Undo');
    }
    
  }


  onValChangeTrk(value:any){
      this.addTrk = value;
     if(this.addTrk == false){
      this.mymap.eachLayer( (layer:any) =>{
        if(layer instanceof L.Polyline){
         //console.log((layer as any)['myData']);
          if(0 === (layer as any)['myData']){
            this.mymap.removeLayer(layer) 
          }
        }
      });
      this.loadGPXService.newTrack(this.trkArr) 
      let newObj : any = this.loadGPXService.getNewObj()         
      let polyline = L.polyline(this.trkArr,
        { 
          //@ts-ignore
          contextmenu: true,
          contextmenuWidth: 180,
          contextmenuItems: [
          { text: 'Delete Track',
          callback: (e:any) => { this.delTrkByClick(e, newObj); },index: 4,
          icon: '../../assets/images/baseline_delete_black_24dp.png'},
          { text: 'Continue Track',
          callback: (e:any) => { this.extendTrack(e, newObj); },index: 5,
          icon: '../../assets/images/baseline_east_black_24dp.png'},
          { text: 'Add Track point',
          callback: (e:any) => { this.addTrackPoint(e, newObj); },index: 6,
          icon: '../../assets/images/baseline_add_black_24dp.png'},
          { text: 'Split Track',
          callback: (e:any) => { this.splitTrack(e, newObj); },index: 7,
          icon: '../../assets/images/baseline_call_split_black_24dp.png'},
          { text: 'Show/Hide Track points',
          callback: (e:any) => { this.showHidePoints( newObj); },index: 8,
          icon: '../../assets/images/baseline_visibility_black_24dp.png'},
          { text: 'Reverse Track',
          callback: (e:any) => { this.reverseTrack(newObj); },index: 9,
          icon: '../../assets/images/baseline_sync_alt_24dp.png'},
          { text: 'Copy of Track',
          callback: (e:any) => { this.copyTrack(newObj); },index: 10,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
          { text: 'Show graph of Track',
          callback: (e:any) => { this.showGraph(newObj.trkpt); },index: 11,
          icon: '../../assets/images/icons8-graph-24.png'},
          { text: 'Move Track to other GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'trk'); }, index: 12,
          icon: '../../assets/images/baseline_move_black_24dp.png'},
          { text: 'Move Track segment to another GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'trkseg'); }, index: 13,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
        ]  
        }
        ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"trkseg"})}).addTo(this.mymap);
      console.log(newObj);
      this.polylineHower(polyline);
      (polyline as any)['myData'] = newObj;
      if(newObj.extensions != undefined){
        if(newObj.extensions['gpxx:TrackExtension']!= undefined){
          if(newObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']!= undefined){
            (polyline as any)['color'] = (polyline as any)['color'] = newObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']
          }
        }
      }else{
        (polyline as any)['color'] = "#3388ff"
      }
      this.trkArr = []
      this.exitDrawing()
     }

   }

   onValChangeRte(value:any){ 
    this.addRte = value;
     if(this.addRte == false){
      this.mymap.eachLayer( (layer:any) =>{
        if(layer instanceof L.Polyline){
         //console.log((layer as any)['myData']);
          if(0 === (layer as any)['myData']){
            this.mymap.removeLayer(layer) 
          }
        }
      });
      if(this.rteMode){
        this.printRteAuto(undefined, undefined)
      }else{
        this.printRteLine(undefined, undefined);
      }
      this.exitDrawing()
     }
   }

   async printRteAuto(arr:any, obj:any){
    let waypointsArr :any
    let newObj : any 
    if(arr == undefined && obj == undefined){
      waypointsArr = await this.getCoordinatesApiData(this.rteArr)
      this.loadGPXService.newRoute((this.rteArr)) 
      newObj = this.loadGPXService.getNewObj()  
    }else{
      waypointsArr = waypointsArr = await this.getCoordinatesApiData(arr)
      newObj = obj
    }
           
    let polyline = L.polyline(waypointsArr, 
      { 
        //@ts-ignore
        contextmenu: true,
        contextmenuWidth: 180,
        contextmenuItems: [
        { text: 'Delete Route',
        callback: (e:any) => { this.delRteByClick(e, newObj); },index: 6,
        icon: '../../assets/images/baseline_close_black_24dp.png'},
        { text: 'Continue Route',
          callback: (e:any) => { this.extendRoute(e, newObj); },index: 7,
          icon: '../../assets/images/baseline_east_black_24dp.png'},
        { text: 'Add Route point',
          callback: (e:any) => { this.addRoutePoint(e, newObj); },index: 8,
          icon: '../../assets/images/baseline_add_black_24dp.png'},
        { text: 'Split Route',
          callback: (e:any) => { this.splitRoute(e, newObj); },index: 9,
          icon: '../../assets/images/baseline_call_split_black_24dp.png'},
        { text: 'Show/Hide Route points',
          callback: (e:any) => { this.showHidePoints(  newObj); },index: 10,
          icon: '../../assets/images/baseline_visibility_black_24dp.png'},
        { text: 'Reverse Route',
          callback: (e:any) => { this.reverseRoute(  newObj); },index: 11,
          icon: '../../assets/images/baseline_sync_alt_24dp.png'},
        { text: 'Copy of Route',
          callback: (e:any) => { this.copyRoute( newObj); },index: 12,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
        { text: 'Show graph of Route',
          callback: (e:any) => { this.showGraph(newObj.rtept); },index: 13,
          icon: '../../assets/images/icons8-graph-24.png'},
        { text: 'Transfer Route to Track',
          callback: (e:any) => { this.transferRteToTrk(newObj.rtept); },index: 14,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
        { text: 'Move to other GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'rte'); }, index: 15,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
      ]  
      }
      ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"rte"})}).addTo(this.mymap);
    console.log(newObj);
    this.polylineHower(polyline);
    (polyline as any)['myData'] = newObj;
    if(newObj.extensions != undefined){
      if(newObj.extensions['gpxx:RouteExtension']!= undefined){
        if(newObj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']!= undefined){
          (polyline as any)['color'] = (polyline as any)['color'] = newObj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']
        }
      }
    }else{
      (polyline as any)['color'] = "#3388ff"
    }
    this.rteArr = []
    
   }

   printRteLine(arr:any, obj:any){
    let newObj : any 
    if(arr == undefined && obj == undefined){
      this.loadGPXService.newRoute((this.rteArr)) 
      newObj = this.loadGPXService.getNewObj()  
    }else{
      this.rteArr = arr
      newObj = obj
    }
       
    let polyline = L.polyline(this.rteArr, 
      { 
        //@ts-ignore
        contextmenu: true,
        contextmenuWidth: 180,
        contextmenuItems: [
        { text: 'Delete Route',
        callback: (e:any) => { this.delRteByClick(e, newObj); },index: 6,
        icon: '../../assets/images/baseline_close_black_24dp.png'},
        { text: 'Continue Route',
          callback: (e:any) => { this.extendRoute(e, newObj); },index: 7,
          icon: '../../assets/images/baseline_east_black_24dp.png'},
        { text: 'Add Route point',
          callback: (e:any) => { this.addRoutePoint(e, newObj); },index: 8,
          icon: '../../assets/images/baseline_add_black_24dp.png'},
        { text: 'Split Route',
          callback: (e:any) => { this.splitRoute(e, newObj); },index: 9,
          icon: '../../assets/images/baseline_call_split_black_24dp.png'},
        { text: 'Show/Hide Route points',
          callback: (e:any) => { this.showHidePoints(  newObj); },index: 10,
          icon: '../../assets/images/baseline_visibility_black_24dp.png'},
        { text: 'Reverse Route',
          callback: (e:any) => { this.reverseRoute(  newObj); },index: 11,
          icon: '../../assets/images/baseline_sync_alt_24dp.png'},
        { text: 'Copy of Route',
          callback: (e:any) => { this.copyRoute(  newObj); },index: 12,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
        { text: 'Show graph of Route',
          callback: (e:any) => { this.showGraph(newObj.rtept); },index: 13,
          icon: '../../assets/images/icons8-graph-24.png'},
        { text: 'Transfer Route to Track',
          callback: (e:any) => { this.transferRteToTrk(newObj.rtept); },index: 14,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
        { text: 'Move to other GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'rte'); }, index: 15,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
      ]  
      }
      ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"rte"})}).addTo(this.mymap);
    console.log(newObj);
    this.polylineHower(polyline);
    (polyline as any)['myData'] = newObj;
    if(newObj.extensions != undefined){
      if(newObj.extensions['gpxx:RouteExtension']!= undefined){
        if(newObj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']!= undefined){
          (polyline as any)['color'] = (polyline as any)['color'] = newObj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']
        }
      }
    }else{
      (polyline as any)['color'] = "#3388ff"
    }
    this.rteArr = []
   }



   async onValChangeTrkAuto(value:boolean){
    this.addTrkAuto = value
    if(this.addTrkAuto == false){
      this.mymap.eachLayer( (layer:any) =>{
        if(layer instanceof L.Polyline){
         //console.log((layer as any)['myData']);
          if(0 === (layer as any)['myData']){
            this.mymap.removeLayer(layer) 
          }
        }
      });
      if(this.trkArr.length >= 2){
        let waypointsArr = await this.getCoordinatesApiData(this.trkArr)
        this.loadGPXService.newTrack((waypointsArr)) 
        let newObj : any = this.loadGPXService.getNewObj()         
        let polyline = L.polyline(waypointsArr, 
          { 
            //@ts-ignore
            contextmenu: true,
            contextmenuWidth: 180,
            contextmenuItems: [
            { text: 'Delete Track',
            callback: (e:any) => { this.delRteByClick(e, newObj); },index: 4,
            icon: '../../assets/images/baseline_delete_black_24dp.png'},
            { text: 'Continue Track',
            callback: (e:any) => { this.extendTrack(e, newObj); },index: 5,
            icon: '../../assets/images/baseline_east_black_24dp.png'},
            { text: 'Add Track point',
            callback: (e:any) => { this.addTrackPoint(e, newObj); },index: 6,
            icon: '../../assets/images/baseline_add_black_24dp.png'},
            { text: 'Split Track',
            callback: (e:any) => { this.splitTrack(e, newObj); },index: 7,
            icon: '../../assets/images/baseline_call_split_black_24dp.png'},
            { text: 'Show/Hide Track points',
            callback: (e:any) => { this.showHidePoints(newObj); },index: 8,
            icon: '../../assets/images/baseline_visibility_black_24dp.png'},
            { text: 'Reverse Track',
            callback: (e:any) => { this.reverseTrack(newObj); },index: 9,
            icon: '../../assets/images/baseline_sync_alt_24dp.png'},
            { text: 'Copy of Track',
            callback: (e:any) => { this.copyTrack(newObj); },index: 10,
            icon: '../../assets/images/content_copy_FILL_24pd.png'},
            { text: 'Show graph of Track',
            callback: (e:any) => { this.showGraph(newObj.trkpt); },index: 11,
            icon: '../../assets/images/icons8-graph-24.png'},
            { text: 'Move Track to other GPX',
            callback: (e:any) => { this.moveToGpx(newObj, 'trk'); }, index: 12,
            icon: '../../assets/images/baseline_move_black_24dp.png'},
            { text: 'Move Track segment to another GPX',
            callback: (e:any) => { this.moveToGpx(newObj, 'trkseg'); }, index: 13,
            icon: '../../assets/images/baseline_move_black_24dp.png'}
          ]  
          }
          ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"trkseg"})}).addTo(this.mymap);
        console.log(newObj);
        this.polylineHower(polyline);
        (polyline as any)['myData'] = newObj;
        if(newObj.extensions != undefined){
          if(newObj.extensions['gpxx:TrackExtension']!= undefined){
            if(newObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']!= undefined){
              (polyline as any)['color'] = (polyline as any)['color'] = newObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']
            }
          }
        }else{
          (polyline as any)['color'] = "#3388ff"
        }
        this.rteArr = []
        this.exitDrawing()
      }
    }
   }

   onValChangeExtendTrk(value:boolean){
    this.extendTrk = value
    if(this.extendTrk == false){
      this.mymap.eachLayer( (layer:any) =>{
        if(layer instanceof L.Polyline){
         //console.log((layer as any)['myData']);
          if(0 === (layer as any)['myData']){
            this.mymap.removeLayer(layer) 
          }
        }
      });
      console.log(this.extendObj)
      this.delLine(this.extendObj)
      let firstOfObj = [ Number(this.extendObj.trkpt[0].$.lat), Number(this.extendObj.trkpt[0].$.lon)]
      
      if(this.trkArr[0][0] === firstOfObj[0] && this.trkArr[0][1] === firstOfObj[1]){
        
        this.trkArr.shift()
        for(let i=0; i< this.trkArr.length; i++){
          let newObj = {$:{lat:this.trkArr[i][0].toString(), lon:this.trkArr[i][1].toString()}};
          console.log(newObj)
          this.extendObj.trkpt.unshift(newObj)
        }
       
      }else{
        
        this.trkArr.shift()
        for(let i=0; i< this.trkArr.length; i++){
          let newObj = {$:{lat:this.trkArr[i][0].toString(), lon:this.trkArr[i][1].toString()}};
          console.log(newObj)
          this.extendObj.trkpt.push(newObj)
        }
        
      }
      console.log(this.extendObj)
      let newTrkArr:Array<any> = []
      console.log(this.extendObj.trkpt)
      for(let i=0; i< this.extendObj.trkpt.length; i++){
        newTrkArr.push([Number(this.extendObj.trkpt[i].$.lat), Number(this.extendObj.trkpt[i].$.lon)])
      }
      console.log(newTrkArr)    
      let polyline = L.polyline(newTrkArr,
        { 
          //@ts-ignore
          contextmenu: true,
          contextmenuWidth: 180,
          contextmenuItems: [
          { text: 'Delete Track',
          callback: (e:any) => { this.delTrkByClick(e, this.extendObj); },index: 4,
          icon: '../../assets/images/baseline_delete_black_24dp.png'},
          { text: 'Continue Track',
          callback: (e:any) => { this.extendTrack(e, this.extendObj); },index: 5,
          icon: '../../assets/images/baseline_east_black_24dp.png'},
          { text: 'Add Track point',
          callback: (e:any) => { this.addTrackPoint(e, this.extendObj); },index: 6,
          icon: '../../assets/images/baseline_add_black_24dp.png'},
          { text: 'Split Track',
          callback: (e:any) => { this.splitTrack(e, this.extendObj); },index: 7,
          icon: '../../assets/images/baseline_call_split_black_24dp.png'},
          { text: 'Show/Hide Track points',
          callback: (e:any) => { this.showHidePoints(this.extendObj); },index: 8,
          icon: '../../assets/images/baseline_visibility_black_24dp.png'},
          { text: 'Reverse Track',
          callback: (e:any) => { this.reverseTrack( this.extendObj); },index: 9,
          icon: '../../assets/images/baseline_sync_alt_24dp.png'},
          { text: 'Copy of Track',
          callback: (e:any) => { this.copyTrack(this.extendObj); },index: 10,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
          { text: 'Show graph of Track',
          callback: (e:any) => { this.showGraph(this.extendObj.trkpt); },index: 11,
          icon: '../../assets/images/icons8-graph-24.png'},
          { text: 'Move Track to other GPX',
          callback: (e:any) => { this.moveToGpx(this.extendObj, 'trk'); }, index: 12,
          icon: '../../assets/images/baseline_move_black_24dp.png'},
          { text: 'Move Track segment to another GPX',
          callback: (e:any) => { this.moveToGpx(this.extendObj, 'trkseg'); }, index: 13,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
        ]  
        }
        ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"trkseg"})}).addTo(this.mymap);
     // console.log(this.extendObj);
      this.polylineHower(polyline);
      (polyline as any)['myData'] = this.extendObj;
      if(this.extendObj.extensions != undefined){
        if(this.extendObj.extensions['gpxx:TrackExtension']!= undefined){
          if(this.extendObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']!= undefined){
            (polyline as any)['color'] = (polyline as any)['color'] = this.extendObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']
          }
        }
      }else{
        (polyline as any)['color'] = "#3388ff"
      }
      this.showHidePoints(this.extendObj)
      this.showHidePoints(this.extendObj)
      this.trkArr = []
      
     }
   }

   onValChangeExtendRte(value:boolean){
    this.extendRte = value
    if(this.extendRte == false){
      this.mymap.eachLayer( (layer:any) =>{
        if(layer instanceof L.Polyline){
         //console.log((layer as any)['myData']);
          if(0 === (layer as any)['myData']){
            this.mymap.removeLayer(layer) 
          }
        }
      });
      console.log(this.extendObj)
      this.delLine(this.extendObj)
      let firstOfObj = [ Number(this.extendObj.rtept[0].$.lat), Number(this.extendObj.rtept[0].$.lon)]
      
      if(this.rteArr[0][0] === firstOfObj[0] && this.rteArr[0][1] === firstOfObj[1]){
        
        this.rteArr.shift()
        for(let i=0; i< this.rteArr.length; i++){
          let newObj = {$:{lat:this.rteArr[i][0].toString(), lon:this.rteArr[i][1].toString()}};
          console.log(newObj)
          this.extendObj.rtept.unshift(newObj)
        }
       
      }else{
        
        this.rteArr.shift()
        for(let i=0; i< this.rteArr.length; i++){
          let newObj = {$:{lat:this.rteArr[i][0].toString(), lon:this.rteArr[i][1].toString()}};
          console.log(newObj)
          this.extendObj.rtept.push(newObj)
        }
        
      }
      console.log(this.extendObj)
      let newRteArr:Array<any> = []
      console.log(this.extendObj.rtept)
      for(let i=0; i< this.extendObj.rtept.length; i++){
        newRteArr.push([Number(this.extendObj.rtept[i].$.lat), Number(this.extendObj.rtept[i].$.lon)])
      }
      console.log(newRteArr)    
      if(this.rteMode){
        
        this.printRteAuto(newRteArr, this.extendObj)
      }else{
        
        this.printRteLine(newRteArr, this.extendObj);
      }
      this.showHidePoints(this.extendObj)
      this.showHidePoints(this.extendObj)
      this.rteArr = []
      
     }
   }


   extendTrack(e:any, obj:any){
     this.extendObj = obj;
    //console.log( obj.trkpt);
     let first = obj.trkpt[0].$
     let last = obj.trkpt[obj.trkpt.length -1].$
     console.log(first, last);
     this.startPoint = [Number(first.lat), Number(first.lon)]
     this.endPoint = [Number(last.lat), Number(last.lon)]
     this.extendTrk = true
   }

   extendRoute(e:any, obj:any){
    this.extendObj = obj;
    console.log( obj);
    let first = obj.rtept[0].$
    let last = obj.rtept[obj.rtept.length -1].$
    console.log(first, last);
    this.startPoint = [Number(first.lat), Number(first.lon)]
    this.endPoint = [Number(last.lat), Number(last.lon)]
    this.extendRte = true
  }

   findNearestTrkPoint(newPoint:any){
    let distanceFirst = (newPoint[0] -  this.startPoint[0])** 2 + (newPoint[1] - this.startPoint[1])** 2
    let distanceLast = (newPoint[0] -  this.endPoint[0])** 2 + (newPoint[1] -  this.endPoint[1])** 2
    console.log(distanceFirst, distanceLast)
    if (distanceFirst < distanceLast){
        this.trkArr.push(this.startPoint)
    }
    else{
      this.trkArr.push(this.endPoint)
    }
    this.trkArr.push(newPoint)
    // console.log(this.trkArr)
   }
   findNearestRtePoint(newPoint:any){
    let distanceFirst = (newPoint[0] -  this.startPoint[0])** 2 + (newPoint[1] - this.startPoint[1])** 2
    let distanceLast = (newPoint[0] -  this.endPoint[0])** 2 + (newPoint[1] -  this.endPoint[1])** 2
    console.log(distanceFirst, distanceLast)
    if (distanceFirst < distanceLast){
        this.rteArr.push(this.startPoint)
    }
    else{
      this.rteArr.push(this.endPoint)
    }
    this.rteArr.push(newPoint)
    // console.log(this.trkArr)
   }


   async  getCoordinatesApiData(waypoints:Array<any>){
      console.log(waypoints) 
      let coordinatesStr = ""
      for(let i =0; i< waypoints.length;i++){
        if(i == 0){
          coordinatesStr = coordinatesStr.concat(waypoints[i][1] + ',' + waypoints[i][0])
          
        }else{
          coordinatesStr = coordinatesStr.concat(';' +  waypoints[i][1] + ',' + waypoints[i][0])
        
        }
      }
      console.log(coordinatesStr, this.routingSelect) 
      //let url = 'http://router.project-osrm.org/route/v1/'+this.routingSelect+ '/'+ coordinatesStr + '?overview=full&geometries=geojson'
      let url
      if(this.routingSelect == "off"){
        url = 'https://api.mapbox.com/directions/v5/mapbox/' + 'driving' + '/' + coordinatesStr + '?geometries=geojson&access_token=pk.eyJ1IjoiZ3B4YXBwIiwiYSI6ImNsYWgxdTFybzA3YmszcW1xbzlsaWdwNWQifQ.rNa3brIV1D9eor_7gzjRmQ'

      }else{
        url = 'https://api.mapbox.com/directions/v5/mapbox/' + this.routingSelect + '/' + coordinatesStr + '?geometries=geojson&access_token=pk.eyJ1IjoiZ3B4YXBwIiwiYSI6ImNsYWgxdTFybzA3YmszcW1xbzlsaWdwNWQifQ.rNa3brIV1D9eor_7gzjRmQ'
      }
      
      let arr:Array<any> = []                                                                                                               
      let data = await this.http.get(url).toPromise();
      console.log((data as any))
      console.log((data as any).routes[0].geometry.coordinates)
      
      
      //console.log(arr)
      return (data as any).routes[0].geometry.coordinates.map((x:any)=> [x[1], x[0]])
   }



  
 
   async getElevationApiData(waypoints:any){
    console.log(waypoints, JSON.stringify(waypoints))
    /*
    let url = 'https://api.open-elevation.com/api/v1/lookup'
    const headers = { 'Accept': 'application/json', 'content-type': 'application/json'} 
    let data = await this.http.post<any>(url, JSON.stringify(waypoints), {'headers':headers}).toPromise()
    */

    //let url = 'https://api.opentopodata.org/v1/aster30m?locations=' + waypoints
    let url = 'https://janjanousek.cz/Proxy.php?params=' + encodeURIComponent( 'locations=' + waypoints);
    let data = await this.http.get(url).toPromise();
    
   /*
    let url  = 'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/'+ '-122.44,37.77;'+ '.json?layers=contour&access_token=pk.eyJ1IjoiZ3B4YXBwIiwiYSI6ImNsYWgxdTFybzA3YmszcW1xbzlsaWdwNWQifQ.rNa3brIV1D9eor_7gzjRmQ'
    let data = await this.http.get(url).toPromise();
    */
    console.log(data as any)
    return data
  }
   
  
  

   exitDrawing(){
    if(this.drawLayer != undefined){
      if(this.mymap.hasLayer(this.drawLayer)){
        this.mymap.removeLayer(this.drawLayer)
      }
    }

    

    if(this.addWtp == true){
      this.addWtp = false;
    }
    if(this.addTrk == true){
      this.addTrk = false;
      this.onValChangeTrk(false);
    }
    if(this.addRte == true){
      this.addRte = false;
      this.onValChangeRte(false);
    }
    if(this.addTrkAuto == true){
      this.addTrkAuto = false;
      this.onValChangeTrkAuto(false);
    }
    if(this.extendTrk == true){
      this.extendTrk = false;
      this.onValChangeExtendTrk(false);
    }
    if(this.extendRte == true){
      this.extendTrk = false;
      this.onValChangeExtendRte(false);
    }
    
    this.mymap.eachLayer( (layer:any) =>{
      if(layer instanceof L.Polyline){
        if((layer as any)['dashed'] == 0){
          this.mymap.removeLayer(layer) 
        }
      }
    });
   }
  

  onValChangeMode(mode:string){
    console.log(mode)
    if(mode == 'off'){
      this.rteMode = false;
    }else{
      this.rteMode = true;
    }
   
    console.log(this.rteMode)
    this.deleteAllInMap()
    this.loadGPXService.refreshVisibleGpx();
  }

  addTrackPoint(e:any, obj:any){
    console.log(e, obj)
    let nearestPoint = 100
    let index = 0
    for(let i=0; i<obj.trkpt.length - 1;i++){
      let point = [Number(obj.trkpt[i].$.lat), Number(obj.trkpt[i].$.lon)]
      let distance = (e.latlng.lat -  point[0])** 2 + (e.latlng.lng - point[1])** 2
      if (distance < nearestPoint){
        nearestPoint = distance
        index = i
      }
    }
    console.log(index)
    if(index != obj.trkpt.length && index != 0){
      let pointLeft = [Number(obj.trkpt[index + 1].$.lat), Number(obj.trkpt[index + 1].$.lon)]
      let distanceLeft = (e.latlng.lat -  pointLeft[0])** 2 + (e.latlng.lng - pointLeft[1])** 2

      let pointRight = [Number(obj.trkpt[index - 1].$.lat), Number(obj.trkpt[index - 1].$.lon)]
      let distanceRight = (e.latlng.lat -  pointRight[0])** 2 + (e.latlng.lng - pointRight[1])** 2

      let indexLeft 
      let indexRight
      if(distanceLeft < distanceRight){
        indexLeft = index
        indexRight = index + 1
      }else{
        indexLeft = index - 1
        indexRight = index 
      }
      obj.trkpt.splice(indexRight, 0, {$:{lat:e.latlng.lat, lon:e.latlng.lng}});
      return indexRight

    }else if(index == obj.trkpt.length){
      let indexRight = index
      obj.trkpt.splice(indexRight, 0, {$:{lat:e.latlng.lat, lon:e.latlng.lng}});
      return indexRight
    }else if(index == 0){
      let indexRight = index + 1
      obj.trkpt.splice(indexRight, 0, {$:{lat:e.latlng.lat, lon:e.latlng.lng}});
      return indexRight
    }
    return null
  }

  addRoutePoint(e:any, obj:any){
    console.log(e, obj)
    let nearestPoint = 100
    let index = 0
    for(let i=0; i<obj.rtept.length - 1;i++){
      let point = [Number(obj.rtept[i].$.lat), Number(obj.rtept[i].$.lon)]
      let distance = (e.latlng.lat -  point[0])** 2 + (e.latlng.lng - point[1])** 2
      if (distance < nearestPoint){
        nearestPoint = distance
        index = i
      }
    }
    console.log(index)
    if(index != obj.rtept.length && index != 0){
      let pointLeft = [Number(obj.rtept[index + 1].$.lat), Number(obj.rtept[index + 1].$.lon)]
      let distanceLeft = (e.latlng.lat -  pointLeft[0])** 2 + (e.latlng.lng - pointLeft[1])** 2

      let pointRight = [Number(obj.rtept[index - 1].$.lat), Number(obj.rtept[index - 1].$.lon)]
      let distanceRight = (e.latlng.lat -  pointRight[0])** 2 + (e.latlng.lng - pointRight[1])** 2

      let indexLeft 
      let indexRight
      if(distanceLeft < distanceRight){
        indexLeft = index
        indexRight = index + 1
      }else{
        indexLeft = index - 1
        indexRight = index 
      }
      obj.rtept.splice(indexRight, 0, {$:{lat:e.latlng.lat, lon:e.latlng.lng}});
      return indexRight

    }else if(index == obj.rtept.length){
      let indexRight = index
      obj.rtept.splice(indexRight, 0, {$:{lat:e.latlng.lat, lon:e.latlng.lng}});
      return indexRight
    }else if(index == 0){
      let indexRight = index + 1
      obj.rtept.splice(indexRight, 0, {$:{lat:e.latlng.lat, lon:e.latlng.lng}});
      return indexRight
    }
    return null
  }

  splitTrack(e:any, obj:any){
    let index = this.addTrackPoint(e, obj)
    console.log(index, obj)
    if(index != null){
      this.deleteAllInMap()
      this.loadGPXService.splitTrackSeg(obj, index)
      
    }
  }

  splitRoute(e:any, obj:any){
    let index = this.addRoutePoint(e, obj)
    console.log(index, obj)
    if(index != null){
      this.deleteAllInMap()
      this.loadGPXService.splitRoute(obj, index)
      
    }
  }

 

  polylineHower(polyline:any){
    polyline.on('mouseover', (e:any) =>{
      var layer = e.target;
      //console.log(e)
      layer.setStyle({
          color: 'red',
          opacity: 1,
          weight: 3
      });
    });
    polyline.on('mouseout', (e:any) =>{
      var layer = e.target;
  
      layer.setStyle({
          color: e.target.color,
          opacity: 1,
          weight: 3
      });
    });
  }

  ifGpxIsSelected(): boolean{
    this.loadGPXService.gpxIsSelectedCall()
    return this.loadGPXService.getFlagIsSelected()
  }


  moveWtp(e:any){
    this.showMovingPoint()
    this.moveWaypointObj = e.relatedTarget.myData
    this.moveWaypoint = true;
  }

  showMovingPoint(){
    let canvas: any = null;
    if(this.drawLayer != undefined){
      if(this.mymap.hasLayer(this.drawLayer)){
        this.mymap.removeLayer(this.drawLayer)
      }
    }  
    this.drawLayer = L.canvasLayer()
    .delegate({
      onDrawLayer: drawingOnCanvas
    }) 
    .addTo(this.mymap);
    function drawingOnCanvas(o: any) {
      canvas = o.canvas;
      var ctx = o.canvas.getContext('2d');
      ctx.clearRect(0, 0, o.canvas.width, o.canvas.height);
      ctx.fillStyle = "rgba(255,116,0, 0.2)";    
      ctx.beginPath();
      };
      let img = new Image();
      // baseline_close_black_24dp.png
       img.src = '../../assets/images/marker-icon.png';
      this.mymap.addEventListener('mousemove', (y:any) => {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
       
        {
          ctx.drawImage(img, y.containerPoint.x - 12, y.containerPoint.y - 40);
        }
      });
    
  }

  moveTrk(e:any){
    this.showMovingPoint()
    this.moveTrackObj = {obj:e.relatedTarget.myData, id:e.relatedTarget.id}
    this.moveTrack = true;
  }

  moveRte(e:any){
    this.showMovingPoint()
    this.moveRouteObj = {obj:e.relatedTarget.myData, id:e.relatedTarget.id}
    this.moveRoute = true;
  }

  showHidePoints(obj:any){
    let removed:boolean = false
    this.mymap.eachLayer( (layer:any) =>{
      if(layer instanceof L.Marker){
        if((layer as any)['id'] != undefined && (layer as any)['myData'] == obj){
          this.mymap.removeLayer(layer)
          removed = true
        }
      }
    });
    console.log(obj)
    if(!removed){
     
      if(obj.trkpt != undefined){
       console.log(obj)
       for(let i = 0; i < obj.trkpt.length; i++){  
        let marker = L.marker([obj.trkpt[i].$.lat,obj.trkpt[i].$.lon],
          { 
          icon: this.iconWtpDef,
          //@ts-ignore
          contextmenu: true,
          contextmenuWidth: 180,
          contextmenuItems: [
          { text: 'Delete Waypoint',
          callback: (e:any) => { this.delWtpByClick(e); }, index: 1,
          icon: '../../assets/images/baseline_close_black_24dp.png'},
          { text: 'Move Waypoint',
          callback: (e:any) => { this.moveTrk(e); }, index: 2,
          icon: '../../assets/images/baseline_open_with_black_24dp.png'},
          { text: 'Copy of Waypoint',
          callback: (e:any) => { this.copyWaypoint(e); }, index: 3,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
          { text: 'Move to another GPX',
          callback: (e:any) => { this.moveToGpx(obj, 'wtp'); }, index: 4,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
          
        ]  
        }  
        ).on('dblclick', (e:any)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"wtp"})}).addTo(this.mymap);
        (marker as any)['myData'] = obj;
        (marker as any)['id'] = i;
       }
      }
      if(obj.rtept != undefined){
        console.log(obj)
       for(let i = 0; i < obj.rtept.length; i++){
        let marker = L.marker([obj.rtept[i].$.lat,obj.rtept[i].$.lon],
          { 
          icon: this.iconWtpDef,
          //@ts-ignore
          contextmenu: true,
          contextmenuWidth: 180,
          contextmenuItems: [
          { text: 'Delete Waypoint',
          callback: (e:any) => { this.delWtpByClick(e); }, index: 1,
          icon: '../../assets/images/baseline_close_black_24dp.png'},
          { text: 'Move Waypoint',
          callback: (e:any) => { this.moveRte(e); }, index: 2,
          icon: '../../assets/images/baseline_open_with_black_24dp.png'},
          { text: 'Copy of Waypoint',
          callback: (e:any) => { this.copyWaypoint(e); }, index: 3,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
          { text: 'Move to another GPX',
          callback: (e:any) => { this.moveToGpx(obj, 'wtp'); }, index: 4,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
        ]  
        }  
        ).on('dblclick', (e:any)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"wtp"})}).addTo(this.mymap);
        (marker as any)['myData'] = obj;
        (marker as any)['id'] = i;
       }
      }
    }
  }

  reverseTrack(obj:any){
    obj.trkpt = obj.trkpt.reverse()
  }

  reverseRoute(obj:any){
    obj.rtept = obj.rtept.reverse()
  }

  copyWaypoint(e:any){
    
    this.loadGPXService.newWaypoint(e.latlng.lat, e.latlng.lng) 
    let newObj : any = this.loadGPXService.getNewObj() 
    newObj.sym = 'Flag'  
    let marker = L.marker([this.lat,this.lon],
      { 
      icon: this.iconWtpDef, 
      //@ts-ignore
      contextmenu: true,
      contextmenuWidth: 180,
      contextmenuItems: [
      { text: 'Delete Waypoint',
      callback: (e:any) => { this.delWtpByClick(e); }, index: 1,
      icon: '../../assets/images/baseline_close_black_24dp.png'},
      { text: 'Move Waypoint',
      callback: (e:any) => { this.moveWtp(e); }, index: 2,
      icon: '../../assets/images/baseline_open_with_black_24dp.png'},
      { text: 'Copy of Waypoint',
      callback: (e:any) => { this.copyWaypoint(e); }, index: 3,
      icon: '../../assets/images/content_copy_FILL_24pd.png'},
      { text: 'Move to another GPX',
      callback: (e:any) => { this.moveToGpx(newObj, 'wtp'); }, index: 4,
      icon: '../../assets/images/baseline_move_black_24dp.png'}

    ]  
    }  
    ).on('dblclick', (e:any)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"wtp"})}).addTo(this.mymap);
    console.log(newObj);
    (marker as any)['myData'] = newObj;
  }

  copyTrack(obj:any){
    console.log(obj)
    let trackArr: Array<any> = []
    for(let i=0; i<obj.trkpt.length;i++){
      trackArr.push([obj.trkpt[i].$.lat, obj.trkpt[i].$.lon])
    }
   
    this.loadGPXService.newTrack(trackArr) 
      let newObj : any = this.loadGPXService.getNewObj()         
      let polyline = L.polyline(trackArr,
        { 
          //@ts-ignore
          contextmenu: true,
          contextmenuWidth: 180,
          contextmenuItems: [
          { text: 'Delete Track',
          callback: (e:any) => { this.delTrkByClick(e, newObj); },index: 4,
          icon: '../../assets/images/baseline_delete_black_24dp.png'},
          { text: 'Continue Track',
          callback: (e:any) => { this.extendTrack(e, newObj); },index: 5,
          icon: '../../assets/images/baseline_east_black_24dp.png'},
          { text: 'Add Track point',
          callback: (e:any) => { this.addTrackPoint(e, newObj); },index: 6,
          icon: '../../assets/images/baseline_add_black_24dp.png'},
          { text: 'Split Track',
          callback: (e:any) => { this.splitTrack(e, newObj); },index: 7,
          icon: '../../assets/images/baseline_call_split_black_24dp.png'},
          { text: 'Show/Hide Track points',
          callback: (e:any) => { this.showHidePoints( newObj); },index: 8,
          icon: '../../assets/images/baseline_visibility_black_24dp.png'},
          { text: 'Reverse Track',
          callback: (e:any) => { this.reverseTrack(newObj); },index: 9,
          icon: '../../assets/images/baseline_sync_alt_24dp.png'},
          { text: 'Copy of Track',
          callback: (e:any) => { this.copyTrack(newObj); },index: 10,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
          { text: 'Show graph of Track',
          callback: (e:any) => { this.showGraph(newObj.trkpt); },index: 11,
          icon: '../../assets/images/icons8-graph-24.png'},
          { text: 'Move Track to other GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'trk'); }, index: 12,
          icon: '../../assets/images/baseline_move_black_24dp.png'},
          { text: 'Move Track segment to another GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'trkseg'); }, index: 13,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
        ]  
        }
        ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"trkseg"})}).addTo(this.mymap);
      console.log(newObj);
      this.polylineHower(polyline);
      (polyline as any)['myData'] = newObj;
      if(newObj.extensions != undefined){
        if(newObj.extensions['gpxx:TrackExtension']!= undefined){
          if(newObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']!= undefined){
            (polyline as any)['color'] = (polyline as any)['color'] = newObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']
          }
        }
      }else{
        (polyline as any)['color'] = "#3388ff"
      }
      
  }
 
  copyRoute(obj:any){
    console.log(obj)
    let routeArr: Array<any> = []
    for(let i=0; i<obj.rtept.length;i++){
      routeArr.push([obj.rtept[i].$.lat, obj.rtept[i].$.lon])
    }

    this.loadGPXService.newRoute(routeArr) 
    let newObj = this.loadGPXService.getNewObj()  
    let polyline = L.polyline(routeArr, 
      { 
        //@ts-ignore
        contextmenu: true,
        contextmenuWidth: 180,
        contextmenuItems: [
        { text: 'Delete Route',
        callback: (e:any) => { this.delRteByClick(e, newObj); },index: 6,
        icon: '../../assets/images/baseline_close_black_24dp.png'},
        { text: 'Continue Route',
          callback: (e:any) => { this.extendRoute(e, newObj); },index: 7,
          icon: '../../assets/images/baseline_east_black_24dp.png'},
        { text: 'Add Route point',
          callback: (e:any) => { this.addRoutePoint(e, newObj); },index: 8,
          icon: '../../assets/images/baseline_add_black_24dp.png'},
        { text: 'Split Route',
          callback: (e:any) => { this.splitRoute(e, newObj); },index: 9,
          icon: '../../assets/images/baseline_call_split_black_24dp.png'},
        { text: 'Show/Hide Route points',
          callback: (e:any) => { this.showHidePoints(  newObj); },index: 10,
          icon: '../../assets/images/baseline_visibility_black_24dp.png'},
        { text: 'Reverse Route',
          callback: (e:any) => { this.reverseRoute(  newObj); },index: 11,
          icon: '../../assets/images/baseline_sync_alt_24dp.png'},
        { text: 'Copy of Route',
          callback: (e:any) => { this.copyRoute(  newObj); },index: 12,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
        { text: 'Show graph of Route',
          callback: (e:any) => { this.showGraph(newObj.rtept); },index: 13,
          icon: '../../assets/images/icons8-graph-24.png'},
        { text: 'Transfer Route to Track',
          callback: (e:any) => { this.transferRteToTrk(newObj.rtept); },index: 14,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
        { text: 'Move to other GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'rte'); }, index: 15,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
      ]  
      }
      ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"rte"})}).addTo(this.mymap);
    console.log(newObj);
    this.polylineHower(polyline);
    (polyline as any)['myData'] = newObj;
    if(newObj.extensions != undefined){
      if(newObj.extensions['gpxx:RouteExtension']!= undefined){
        if(newObj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']!= undefined){
          (polyline as any)['color'] = (polyline as any)['color'] = newObj.extensions['gpxx:RouteExtension']['gpxx:DisplayColor']
        }
      }
    }else{
      (polyline as any)['color'] = "#3388ff"
    }

  }

  async showGraph(data:any){
    console.log(data)

    let elevationString :any = ""
    let elevationData
    let geoJson: Array<any> = []
    let count = 0
    for(let i=0; i<data.length;i++){
      elevationString = elevationString.concat(data[i].$.lat, ",", data[i].$.lon, "|");
      count ++
      if(count == 98){
        elevationData = await this.getElevationApiData(elevationString)
        for(let i = 0; i<elevationData.results.length;i++){
          geoJson.push([elevationData.results[i].location.lng, elevationData.results[i].location.lat, elevationData.results[i].elevation])
        }
        elevationString = ""
        count = 0
      }
    }
    elevationData = await this.getElevationApiData(elevationString)
    for(let i = 0; i<elevationData.results.length;i++){
      geoJson.push([elevationData.results[i].location.lng, elevationData.results[i].location.lat, elevationData.results[i].elevation])
    }
    
    
    console.log(geoJson)
    const FeatureCollections = [{
      "type": "FeatureCollection",
      "features": [{
          "type": "Feature",
          "geometry": {
              "type": "LineString",
              "coordinates": geoJson
          },
         "properties": {
              "attributeType": 3
          }
      }],
      "properties": {
          "Creator": "OpenRouteService.org",
          "records": 1,
          "summary": "Steepness"
      }
  }];

  console.log("show Graph")
    //@ts-ignore
    let hg = L.control.heightgraph({
     // mappings: this.colorMappings,
     position: "bottomleft",
      graphStyle: {
          opacity: 0.8,
          'fill-opacity': 0.5,
          'stroke-width': '2px'
      },
      translation: {
          distance: "Distance"
      },
      expandControls: true,
      expandCallback: false
      
  });
    hg.addTo(this.mymap);
    hg.addData(FeatureCollections);
    //L.geoJson(FeatureCollections).addTo(map);
    hg.resize({width:500,height:200})
   
  }
  
  async transferRteToTrk(data:any){
    console.log(data)
    let outArr :Array<any> = []
    for(let i=0; i< data.length;i++){
      outArr.push([data[i].$.lat, data[i].$.lon])
    }
    console.log(outArr)
    let waypointsArr = await this.getCoordinatesApiData(outArr)
    console.log(waypointsArr)


    let trackArr: Array<any> = []
    for(let i=0; i<waypointsArr.length;i++){
      trackArr.push([waypointsArr[i][0], waypointsArr[i][1]])
    }
   
    this.loadGPXService.newTrack(trackArr) 
      let newObj : any = this.loadGPXService.getNewObj()         
      let polyline = L.polyline(trackArr,
        { 
          //@ts-ignore
          contextmenu: true,
          contextmenuWidth: 180,
          contextmenuItems: [
          { text: 'Delete Track',
          callback: (e:any) => { this.delTrkByClick(e, newObj); },index: 4,
          icon: '../../assets/images/baseline_delete_black_24dp.png'},
          { text: 'Continue Track',
          callback: (e:any) => { this.extendTrack(e, newObj); },index: 5,
          icon: '../../assets/images/baseline_east_black_24dp.png'},
          { text: 'Add Track point',
          callback: (e:any) => { this.addTrackPoint(e, newObj); },index: 6,
          icon: '../../assets/images/baseline_add_black_24dp.png'},
          { text: 'Split Track',
          callback: (e:any) => { this.splitTrack(e, newObj); },index: 7,
          icon: '../../assets/images/baseline_call_split_black_24dp.png'},
          { text: 'Show/Hide Track points',
          callback: (e:any) => { this.showHidePoints( newObj); },index: 8,
          icon: '../../assets/images/baseline_visibility_black_24dp.png'},
          { text: 'Reverse Track',
          callback: (e:any) => { this.reverseTrack(newObj); },index: 9,
          icon: '../../assets/images/baseline_sync_alt_24dp.png'},
          { text: 'Copy of Track',
          callback: (e:any) => { this.copyTrack(newObj); },index: 10,
          icon: '../../assets/images/content_copy_FILL_24pd.png'},
          { text: 'Show graph of Track',
          callback: (e:any) => { this.showGraph(newObj.trkpt); },index: 11,
          icon: '../../assets/images/icons8-graph-24.png'},
          { text: 'Move Track to other GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'trk'); }, index: 12,
          icon: '../../assets/images/baseline_move_black_24dp.png'},
          { text: 'Move Track segment to another GPX',
          callback: (e:any) => { this.moveToGpx(newObj, 'trkseg'); }, index: 13,
          icon: '../../assets/images/baseline_move_black_24dp.png'}
        ]  
        }
        ).on('dblclick', (e)=> {this.loadGPXService.editObjByDblClick({obj:e.sourceTarget.myData, type:"trkseg"})}).addTo(this.mymap);
      console.log(newObj);
      this.polylineHower(polyline);
      (polyline as any)['myData'] = newObj;
      if(newObj.extensions != undefined){
        if(newObj.extensions['gpxx:TrackExtension']!= undefined){
          if(newObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']!= undefined){
            (polyline as any)['color'] = (polyline as any)['color'] = newObj.extensions['gpxx:TrackExtension']['gpxx:DisplayColor']
          }
        }
      }else{
        (polyline as any)['color'] = "#3388ff"
      }
  }

  moveToGpx(e:any, type:any){
    console.log(e)
    this.loadGPXService.treeDataCall()
    console.log(this.loadGPXService.getTreeDataArr())
   

    let dialogRef = this.dialog.open(MoveToGpxDialogComponent, 
      {
        data: this.loadGPXService.getTreeDataArr(),
        disableClose: true
    });

    dialogRef.afterClosed().subscribe(
      async result =>{
        if(result != undefined){
          console.log(result, e);
          if(result.parsed == false){
            console.log("parsed is false");
            await this.loadGPXService.addToTree(result.id)
          }
          if(type == "wtp"){
            this.loadGPXService.copyWaypointToGpx(result.id, e)
          }
          if(type == "trk"){
           
            this.loadGPXService.copyTrackToGpx(result.id, e)
          }
          if(type == "trkseg"){
            this.loadGPXService.copyTrackSegToGpx(result.id, e)
          }
          if(type == "rte"){
            this.loadGPXService.copyRouteToGpx(result.id, e)
          }
          
        }        
      }
    )
   
  }


}
