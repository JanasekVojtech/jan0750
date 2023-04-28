import { /*analyzeAndValidateNgModules*/ } from '@angular/compiler';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {GpxNode} from '../treePrint/gpx-node';
import GPX from 'gpx-parser-builder';
import { GpxParserService } from './gpx-parser.service';

declare var db: any
@Injectable({
  providedIn: 'root'
})
export class LoadGPXService  {
  
  newTreeData!: GpxNode;
  public mapData = new BehaviorSubject<GpxNode>({name:"null",id:null});
  public newNode = new BehaviorSubject<GpxNode>({name:"null",id:null});
  public shPoint = new BehaviorSubject<any>(null);
  public newWtp = new BehaviorSubject<Array<number>>([]);
  public delWtp = new BehaviorSubject<any>("null");
  public delLine = new BehaviorSubject<any>("null");
  public newObj: any;
  public newTrk = new BehaviorSubject<Array<any>>([]);
  public newRte = new BehaviorSubject<Array<any>>([]);
  public hideData = new BehaviorSubject<GpxNode>({name:"null",id:null});
  public editObj = new BehaviorSubject<any>(null);
  public deleteWtpByCl = new BehaviorSubject<any>(null);
  public deleteTrkByCl = new BehaviorSubject<any>(null);
  public deleteRteByCl = new BehaviorSubject<any>(null);
  public refreshAll = new BehaviorSubject<boolean>(false);
  public renameFile = new BehaviorSubject<any>(null);
  public splitTrkSeg = new BehaviorSubject<any>(null);
  public splitRte = new BehaviorSubject<any>(null);
  public shMode = new BehaviorSubject<boolean>(false);
  public isSelected = new BehaviorSubject<any>(null);
  public treeData = new BehaviorSubject<any>(null);
  public flagIsSelected: boolean = false
  public storage = "db_gpx";
  public treeDataArr :any


  constructor(private gpxParserService: GpxParserService) { }
  
  public copyWtp = new BehaviorSubject<any>(null);
  public copyTrk = new BehaviorSubject<any>(null);
  public copyTrkSeg = new BehaviorSubject<any>(null);
  public copyRte = new BehaviorSubject<any>(null);
 
  
  add( file: any) {
    return new Promise(async(resolve, reject) => {
      if (db != undefined) {
        let db_object = { file:file}
        const request = await db.transaction([this.storage], "readwrite")
          .objectStore(this.storage).put(db_object);
          
        
        request.onsuccess =   (event: any)=> {
          if (event.target.result) {
            
            this.addToTree(event.target.result);
            console.log("success")
            resolve("success")
          } else {
            console.log("error")
            resolve(false);
          }
        }

      }
    });
  }

  printAll(){
    return new Promise(async(resolve, reject) => {
      
      if (db != undefined) {
        var startTime = performance.now()
        const request =  db.transaction([this.storage], "readwrite").objectStore(this.storage).getAll();
        //console.log(request);
        request.onsuccess =  (event: any)=> {
          if (event.target.result) {
            console.log("success");
          } else {
            console.log("error");
          }
          for(let i=0; i<request.result.length;i++){
            //console.log(request.result[i].id)
            //this.addToTree(request.result[i].id);
            this.menuParser(request.result[i].id);
          }
          
          
        }
      
        var endTime = performance.now()
        console.log(`Call to doSomething took 1 ${endTime - startTime} milliseconds`)
      }
    });
  }
  menuParser(index:number){
    var startTime = performance.now()
    const request =  db.transaction([this.storage], "readwrite").objectStore(this.storage).get(index);
    
   
    request.onsuccess =  (event: any)=> {
      if (event.target.result) {
        console.log("success");
      } else {
        console.log("error");
      }

      
      const fileLoaded = request.result.file;
      var fr = new FileReader();
      fr.onload =  (e) =>{
      let gpx
      if (typeof e.target!.result === 'string') {
        gpx = this.gpxParserService.parseGPX(e.target!.result);
        console.log("gpx2 parsed",gpx)
        } else if (e.target!.result instanceof ArrayBuffer) {
        let decoder = new TextDecoder();
        let string = decoder.decode(e.target!.result);
        gpx = this.gpxParserService.parseGPX(string);
        console.log("gpx2 parsed", gpx)
      }
       
       // console.log(gpx.toString())
        //console.log(gpx)
        
                   
          let metadata:GpxNode[] = [];
          let wpt:GpxNode[] = [];
          let trk:GpxNode[] = [];
          let rte:GpxNode[] = [];
          let header:GpxNode = {name: 'Header'};

          console.log(gpx)
          if(gpx.metadataName != undefined){                               
              metadata!.push({name: gpx.metadataName, type: "metadata"});                                  
          }else{
            metadata!.push({name: "default Metadata", type: "metadata"});
          }
         if(gpx.waypoints != undefined){
            for(let i = 0; i<gpx.waypoints.length;i++){
              wpt!.push({name: gpx.waypoints[i].name, type: "wtp"});
            }
          }
          
          if(gpx.tracks != undefined){
            let i;
            for(i = 0; i<gpx.tracks.length;i++){
              trk!.push({name: gpx.tracks[i].name, children:[], type: "trk"});
            }
            for(let j = 0; j<i; j++){
              for(let k = 0; k<gpx.tracks[j].tracksegments.length; k++){
                //console.log(i);
                trk[j].children!.push({name:"Track Segment" + String(k+1), type: "trkseg"});
              }
            }
          }
          //trk[0].children![0].obj.trkpt[0].$.lat = 0;
          //console.log(trk);


          if(gpx.routes != undefined){
            for(let i = 0; i<gpx.routes.length;i++){
              rte!.push({name: gpx.routes[i].name, type: "rte"});
            }
          }
          header.obj = {};
          

          
          this.newTreeData = 
          {
            name: request.result.file.name,
            id: index,
            selected: false,
            isShown: false,
            parsed: false,
            children: [
              {name: 'Metadata', children: metadata},
              {name: 'Waypoint', children: wpt}, 
              {name: 'Route', children: rte},
              {name: 'Track', children: trk},
              header,
            ]
          };
          console.log("gpx2 tree obj", this.newTreeData)
          this.newNode.next(this.newTreeData);
      
      
      };
      fr.readAsText(fileLoaded);
      
    
    }
    var endTime = performance.now()
    console.log(`Call to doSomething took menu Parser${endTime - startTime} milliseconds`)
  }
  addToTree(index:number){
    var startTime = performance.now()
    console.log(index)
    return new Promise<void>((resolve)=>{
    const request =  db.transaction([this.storage], "readwrite").objectStore(this.storage).get(index);
    
        //console.log(request);
        request.onsuccess =  (event: any)=> {
          if (event.target.result) {
            console.log("success");
          } else {
            console.log("error");
          }

          console.log(request.result.file.name, "file chcek")
          const fileLoaded = request.result.file;
          var fr = new FileReader();
          fr.onload =  (e) =>{
            console.log(e.target!.result);

           const gpx = GPX.parse(e.target!.result);

           
           // console.log(gpx.toString())
            //console.log(gpx)
            
            //if(GPX.parse(e.target!.result) != null){
            if(true){               
              let metadata:GpxNode[] = [];
              let wpt:GpxNode[] = [];
              let trk:GpxNode[] = [];
              let rte:GpxNode[] = [];
              let header:GpxNode = {name: 'Header'};

              console.log(gpx)
              if(gpx.metadata != undefined){                               
                  metadata!.push({name: gpx.metadata.name, obj:gpx.metadata, type: "metadata"});                                  
              }else{
                metadata!.push({name: "default Metadata", obj:{name: "default Metadata" ,type: "metadata"}, type: "metadata"});
              }
             if(gpx.wpt != undefined){
                for(let i = 0; i<gpx.wpt.length;i++){
                  wpt!.push({name: gpx.wpt[i].name, obj:gpx.wpt[i], type: "wtp"});
                }
              }
              
              if(gpx.trk != undefined){
                let i;
                for(i = 0; i<gpx.trk.length;i++){
                  trk!.push({name: gpx.trk[i].name, obj:gpx.trk[i], children:[], type: "trk"});
                }
                for(let j = 0; j<i; j++){
                  for(let k = 0; k<gpx.trk[j].trkseg.length; k++){
                    //console.log(i);
                    trk[j].children!.push({name:"Track Segment" + String(k+1), obj: trk[j].obj.trkseg[k], type: "trkseg"});
                  }
                }
              }
              //trk[0].children![0].obj.trkpt[0].$.lat = 0;
              //console.log(trk);


              if(gpx.rte != undefined){
                for(let i = 0; i<gpx.rte.length;i++){
                  rte!.push({name: gpx.rte[i].name, obj:gpx.rte[i], type: "rte"});
                }
              }
              header.obj = { obj:gpx.$};
              

              
              this.newTreeData = 
              {
                name: request.result.file.name,
                id: index,
                selected: false,
                isShown: false,
                parsed: true,
                children: [
                  {name: 'Metadata', children: metadata},
                  {name: 'Waypoint', children: wpt}, 
                  {name: 'Route', children: rte},
                  {name: 'Track', children: trk},
                  header,
                ]
              };
              console.log(this.newTreeData)
              this.newNode.next(this.newTreeData);
              //return Promise.resolve()
          }else{
            console.log("Error parsing gpx");
            this.delete(index);
          }
          resolve();
          
          };
          fr.readAsText(fileLoaded);
          
          
        }
        var endTime = performance.now()
      console.log(`Call to doSomething took Add to tree${endTime - startTime} milliseconds`)
      })
     
  }

  newGpxFile(){      
    let metadata:GpxNode[] = [];
    let wpt:GpxNode[] = [];
    let trk:GpxNode[] = [];
    let rte:GpxNode[] = [];
    let header:GpxNode = {name: 'Header'};

    
    metadata!.push({name: "default Metadata", obj:{name: "default Metadata" ,type: "metadata"}, type: "metadata"});
    this.newTreeData = 
    {
      name: "NewGPXfile",
        selected: false,
        isShown: false,
        parsed: true,
      children: [
        {name: 'Metadata', children: metadata},
        {name: 'Waypoint', children: wpt}, 
        {name: 'Route', children: rte},
        {name: 'Track', children: trk},
        header,
      ]
    };
   // this.saveToExistingDb(this.newTreeData)
    //this.newNode.next(this.newTreeData);  
  
    
    //this.renameGpxName(this.newTreeData)
    
    

    
   
    const gpx = new GPX({ $:header, metadata: metadata, wpt:[], trk:[] ,rte:[]});
    console.log(gpx.toString())

    let blob = new Blob([gpx.toString()], {type: 'application/gpx+xm'});
    let fileOfBlob = new File([blob], "NewGPXfile");
    let db_Object = { file:fileOfBlob}
    //(fileOfBlob as any).id = node.id
    if (db != undefined) {
      const request =  db.transaction([this.storage], "readwrite")
        .objectStore(this.storage).put(db_Object);
        
      
      request.onsuccess =   (event: any)=> {
        if (event.target.result) {
          
          this.addToTree(event.target.result);
          console.log("success")         
        } else {
          console.log("error")
        }
      }

    }
    
  }
  

  
 
  get(id: number) {
    return new Promise(async(resolve, reject) => {
      
      if (db != undefined) {
        /*
        const store = db.transaction([this.storage]).objectStore(this.storage);
        const countDB = store.count();
        let countOfElements: any;
        countDB.onsuccess = function() {
          countOfElements = countDB.result;
          //console.log(countOfElements);
        }
*/
        const request =  db.transaction([this.storage], "readwrite").objectStore(this.storage).get(id);
        //console.log(request);
        request.onsuccess =  (event: any)=> {
          if (event.target.result) {
            console.log("success");
          } else {
            console.log("error");
          }

          
          const fileLoaded = request.result.file;
          var fr = new FileReader();
          fr.onload =  (e) =>{
            //console.log(e.target!.result);
            //this.mapData.next(e.target!.result);      
          };
          fr.readAsText(fileLoaded);

          
        }
      

      }
    });
  }

 
  delete(keyname: number) {
    return new Promise(async(resolve, reject) => {
      if (db != undefined) {
        const request = await db.transaction([this.storage], "readwrite")
          .objectStore(this.storage).delete(keyname);

        request.onsuccess = await function (event: any) {
        }
      }
    });
  }

  saveToDb(node:GpxNode){
    console.log(node)
    
    
    let wtpArray : Array<any> = []
    for(let i = 0 ; i < node!.children![1]?.children!.length; i++){
      wtpArray.push(node.children![1]?.children![i].obj)
    }
    let trkArray : Array<any> = []
    for(let i = 0 ; i < node!.children![3]?.children!.length; i++){
      trkArray.push(node.children![3]?.children![i].obj)
    }
    let rtekArray : Array<any> = []
    for(let i = 0 ; i < node!.children![2]?.children!.length; i++){
      rtekArray.push(node.children![2]?.children![i].obj)
    }

    //console.log(node.children![4]?.obj)
    let header:any
    if(node.children![4]?.obj == undefined){
      header = {}
    }else{
      header = node.children![4]?.obj.obj
    }
    const gpx = new GPX({$:header, metadata: node.children![0]?.children![0], wpt:wtpArray, trk:trkArray ,rte:rtekArray});
    console.log(gpx.toString())

    let blob = new Blob([gpx.toString()], {type: 'application/gpx+xm'});
    let fileOfBlob = new File([blob], node.name);

    let db_Object = {id:node.id, file:fileOfBlob}
    if (db != undefined) {
      const request =  db.transaction([this.storage], "readwrite")
        .objectStore(this.storage).put(db_Object);
        
      
      request.onsuccess =   (event: any)=> {
        if (event.target.result) {
          
          this.addToTree(event.target.result);
          console.log("success")         
        } else {
          console.log("error")
        }
      }

    }
    
  }


  saveToExistingDb(node:GpxNode){
    console.log(node, "save")
    
    
    let wtpArray : Array<any> = []
    for(let i = 0 ; i < node!.children![1]?.children!.length; i++){
      wtpArray.push(node.children![1]?.children![i].obj)
    }
    let trkArray : Array<any> = []
    for(let i = 0 ; i < node!.children![3]?.children!.length; i++){
      trkArray.push(node.children![3]?.children![i].obj)
    }
    let rtekArray : Array<any> = []
    for(let i = 0 ; i < node!.children![2]?.children!.length; i++){
      rtekArray.push(node.children![2]?.children![i].obj)
    }

    //console.log(node.children![4]?.obj)
    let header:any
    if(node.children![4]?.obj == undefined){
      header = {}
    }else{
      header = node.children![4]?.obj.obj
    }
    const gpx = new GPX({ $:header, metadata: node.children![0]?.children![0], wpt:wtpArray, trk:trkArray ,rte:rtekArray});
    console.log(gpx.toString())

    let blob = new Blob([gpx.toString()], {type: 'application/gpx+xm'});
    let fileOfBlob = new File([blob], node.name);
    let db_Object = {id:node.id, file:fileOfBlob}
    //(fileOfBlob as any).id = node.id
    if (db != undefined) {
      const request =  db.transaction([this.storage], "readwrite")
        .objectStore(this.storage).put(db_Object);
        
      
      request.onsuccess =   (event: any)=> {
        if (event.target.result) {
          
          //this.addToTree(event.target.result);
          console.log("success")         
        } else {
          console.log("error")
        }
      }

    }
    
  }


  showWpt(obj:any){
    let data = [[obj.$.lat, obj.$.lon]]
    this.shPoint.next(data);
  }

  showRte(obj:any){
    console.log(obj)
    let data: number[][] = [];
    for(let i = 0; i < obj.rtept.length; i++){
      data.push([obj.rtept[i].$.lat, obj.rtept[i].$.lon])
    }
    this.shPoint.next(data);
  }

  showTrk(obj:any){
    console.log(obj)
    let data: number[][] = [];
    for(let i = 0; i < obj.trkseg.length; i++){
      for(let j = 0; j < obj.trkseg[i].trkpt.length; j++){
        //console.log(obj.trkseg[i].trkpt[j])
        data.push([obj.trkseg[i].trkpt[j].$.lat, obj.trkseg[i].trkpt[j].$.lon])
      }
    }
    console.log(data)
    this.shPoint.next(data);
  }

  showTrkseg(obj:any){
    console.log(obj)
    let data: number[][] = [];
    for(let i = 0; i < obj.trkpt.length; i++){
      data.push([obj.trkpt[i].$.lat,obj.trkpt[i].$.lon])
    }
    this.shPoint.next(data);
  }


  newWaypoint(lat:number, lon:number){
    this.newWtp.next([lat, lon]);
  }
  setNewObj(newObj : any){
      this.newObj = newObj
  }
  getNewObj(){
    console.log(this.newObj)
    return this.newObj
  }

  deleteWtp(obj:any){
    let delByObj = obj
    this.delWtp.next(delByObj)
    console.log(delByObj)
  }

  deleteLine(obj:any){
    let delByObj = obj
    this.delLine.next(delByObj)
    console.log(delByObj)
  }
 

  newTrack(arr:Array<any>){
    this.newTrk.next(arr);
  }
  

  
  newRoute(arr:Array<any>){
    this.newRte.next(arr);
  }

  

 showGpx(node: GpxNode, mode:boolean){
    console.log("Parsed and sedn to map", node)
    this.mapData.next(node); 
    this.shMode.next(mode); 
  }

  hideGpx(node: GpxNode){
    this.hideData.next(node); 
  }

  editObjByDblClick(obj:any){
    console.log(obj)
    this.editObj.next(obj)
  }

  deleteWtpByClick(obj:any){
    this.deleteWtpByCl.next(obj);
  }

  deleteTrkByClick(obj:any){
    this.deleteTrkByCl.next(obj);
  }
  deleteRteByClick(obj:any){
    this.deleteRteByCl.next(obj);
  }

  refreshVisibleGpx(){
    this.refreshAll.next(true)
    
  }

  renameGpxName(node:any){
    this.renameFile.next(node)
  }

  splitTrackSeg(obj:any, index:number){
    this.splitTrkSeg.next({obj:obj, index:index})
  }

  splitRoute(obj:any, index:number){
    this.splitRte.next({obj:obj, index:index})
  }

  gpxIsSelectedCall(){
    this.isSelected.next(1)
  }
  setFlagIsSelected(flag:boolean){
    this.flagIsSelected = flag
  }

  getFlagIsSelected():boolean{
    return this.flagIsSelected
  }

  treeDataCall(){
    this.treeData.next(1)
  }
  setTreeDataArr(dataArr:any){
    this.treeDataArr = dataArr
  }

  getTreeDataArr():any{
    return this.treeDataArr
  }

  copyWaypointToGpx(treeId:number, treeObj:any){
    console.log(treeId, treeObj)
    this.copyWtp.next({id: treeId , obj:treeObj});
  }


  copyTrackToGpx(treeId:number, treeObj:any){
    console.log(treeId, treeObj)
   
    this.copyTrk.next({id: treeId , obj:treeObj});
  }
  
  copyTrackSegToGpx(treeId:number, treeObj:any){
    console.log(treeId, treeObj)
    this.copyTrkSeg.next({id: treeId , obj:treeObj});
  }
  
  copyRouteToGpx(treeId:number, treeObj:any){
    console.log(treeId, treeObj)
    this.copyRte.next({id: treeId , obj:treeObj});
  }

  downloadFileByID(id:any, name:any){
    const request =  db.transaction([this.storage], "readwrite").objectStore(this.storage).get(id);
    
   
    request.onsuccess =  (event: any)=> {
      const myBlob = event.target.result.file;
      const url = URL.createObjectURL(myBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name + ".gpx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

}
