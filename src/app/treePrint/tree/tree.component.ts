import { Component, OnInit/*, SystemJsNgModuleLoader */} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {GpxNode} from '../gpx-node';
import { LoadGPXService } from '../../load_gpx/load-gpx.service';
import { BehaviorSubject } from 'rxjs';





@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent  implements OnInit{
  
  TREE_DATA: GpxNode[] = [];
  treeControl = new NestedTreeControl<GpxNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<GpxNode>();
  

  constructor(private loadGPXService:LoadGPXService) {
    this.dataSource.data = this.TREE_DATA;
  }

  ngOnInit() {
    this.loadGPXService.isSelected.subscribe(flag=>{this.gpxIsSelected(flag)})
    this.loadGPXService.newNode.subscribe(newNode=> {this.addNewNode(newNode)} );
    this.loadGPXService.newWtp.subscribe(newWtp=> {this.addWtp(newWtp)} );
    this.loadGPXService.newTrk.subscribe(newTrk=> {this.addTrk(newTrk)} );
    this.loadGPXService.newRte.subscribe(newRte=> {this.addRte(newRte)} );
    this.loadGPXService.deleteWtpByCl.subscribe(obj=>{this.deleteWtpByObj(obj)});
    this.loadGPXService.deleteTrkByCl.subscribe(obj=>{this.deleteTrksegByObj(obj)})
    this.loadGPXService.deleteRteByCl.subscribe(obj=>{this.deleteRteByObj(obj)})
    this.loadGPXService.refreshAll.subscribe(val=>{this.refreshAllVisibleGpx(val)})
    this.loadGPXService.splitTrkSeg.subscribe(data=>{this.splitTrackSeg(data)})
    this.loadGPXService.splitRte.subscribe(data=>{this.splitRoute(data)})
    this.loadGPXService.treeData.subscribe(data=>{this.gpxDataArr(data)})

    this.loadGPXService.copyWtp.subscribe(data=>{this.addCopyedWtp(data)})
    this.loadGPXService.copyTrk.subscribe(data=>{this.addCopyedTrk(data)})
    this.loadGPXService.copyTrkSeg.subscribe(data=>{this.addCopyedTrkseg(data)})
    this.loadGPXService.copyRte.subscribe(data=>{this.addCopyedRte(data)})
  }

  hasChild = (_: number, node: GpxNode) => !!node.children && node.children.length > 0;

  addNewNode(newNode:GpxNode){
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].id == newNode.id){
        
        this.TREE_DATA[i] = newNode
        console.log("data replaced", this.TREE_DATA)
        return 
      }
    }
    if(newNode.name != "null"){
      console.log("Pushed To Tree")
      this.TREE_DATA.push(newNode)
      this.dataSource.data = this.TREE_DATA;
    } 
  }
  
  refresh(){
    this.dataSource.data = [];
    this.dataSource.data = this.TREE_DATA;
  }

  saveTreeNode(){
    
  }

  delete(index:any){
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].id == index){
          if (i > -1) {
            this.TREE_DATA.splice(i, 1);
          }
      }
    }
    this.dataSource.data = this.TREE_DATA;
  }

  deleteWtpByObj(obj:any){
    for(let j = this.TREE_DATA.length -1; j >= 0  ; j--){
      for(let i = this.TREE_DATA[j].children![1]?.children!.length -1; i >= 0; i--){
        if(this.TREE_DATA[j].children![1]?.children![i]?.obj === obj){
          let newObj:any = this.TREE_DATA[j].children![1]?.children![i].obj
          this.loadGPXService.deleteWtp(newObj)
          this.TREE_DATA[j].children![1]?.children!.splice(i, 1);
          console.log('Obj found and deleted')
        }
      } 
    }
    this.refresh()
    //console.log( this.TREE_DATA)
    //console.log(this.dataSource.data)
  }
  
  deleteRteByObj(obj:any){
    for(let j = this.TREE_DATA.length -1; j >= 0  ; j--){
      for(let i = this.TREE_DATA[j].children![2]?.children!.length -1; i >= 0; i--){
        if(this.TREE_DATA[j].children![2]?.children![i]?.obj === obj){
          let newObj:any = this.TREE_DATA[j].children![2]?.children![i].obj
          this.loadGPXService.deleteLine(newObj)
          this.TREE_DATA[j].children![2]?.children!.splice(i, 1);
          console.log('Obj found and deleted')
        }
      } 
    }
    this.refresh()
  }

  deleteTrkByObj(obj:any){
    for(let j = this.TREE_DATA.length -1; j >= 0  ; j--){
      for(let i = this.TREE_DATA[j].children![3]?.children!.length -1; i >= 0; i--){
        if(this.TREE_DATA[j].children![3]?.children![i]?.obj === obj){

          for(let k = this.TREE_DATA[j].children![3]?.children![i].children!.length -1; k >= 0; k--){
            let newObj:any = this.TREE_DATA[j].children![3]?.children![i]?.children![k]?.obj
            this.loadGPXService.deleteLine(newObj)
          }
          
          this.TREE_DATA[j].children![3]?.children!.splice(i, 1);
          
          console.log('Obj found and deleted')
        }
      } 
    }
    this.refresh()
  }

  deleteTrksegByObj(obj:any){
    for(let j = this.TREE_DATA.length -1; j >= 0  ; j--){
      for(let i = this.TREE_DATA[j].children![3]?.children!.length -1; i >= 0; i--){
        for(let k = this.TREE_DATA[j].children![3]?.children![i].children!.length -1; k >= 0; k--){
          if(this.TREE_DATA[j].children![3]?.children![i]?.children![k]?.obj === obj){
            console.log(this.TREE_DATA[j].children![3]?.children![i]?.children![k]?.obj, obj)
            let newObj:any = this.TREE_DATA[j].children![3]?.children![i]?.children![k]?.obj
            this.loadGPXService.deleteLine(newObj)
            console.log(k)
            this.TREE_DATA[j].children![3]?.children![i]?.children!.splice(k, 1);
            this.TREE_DATA[j].children![3]?.children![i].obj.trkseg.splice(k, 1);
            console.log('Obj found and deleted')
            this.refresh()
            console.log(this.TREE_DATA)
          }
        }
        
      } 
    }
    this.refresh()
  }
  
  deleteMetadataByObj(obj:any){
    
  }

  async parseGPX(id:any){
    
    if(id != null){
      for(let i = 0; i<this.TREE_DATA.length;i++){

        if(this.TREE_DATA[i].id == id){
          
          if(!this.TREE_DATA[i].parsed){
           
            await this.loadGPXService.addToTree(id)
            this.refresh()
            }
          }
        }
      }
      
    
  }

  async showFullGpx(node:GpxNode, mode:boolean){
    for(let i = 0; i<this.TREE_DATA.length;i++){
      
        if(this.TREE_DATA[i].id == node.id){
          if(!this.TREE_DATA[i].parsed){
            console.log("parsed False", this.TREE_DATA)
            //this.parseWholeFile(node.id)
            await this.loadGPXService.addToTree(node.id)
            console.log("parsed False", this.TREE_DATA)
            
          }
          this.TREE_DATA[i].selected = true;
          this.TREE_DATA[i].isShown = true;
          
          this.loadGPXService.showGpx(this.TREE_DATA[i], mode);

        }else{
          this.TREE_DATA[i].selected = false;
        }
      
      
    }

    
    this.refresh()
  }

  refreshAllVisibleGpx(value:boolean){
    if(value){
        
        for(let i=0; i < this.TREE_DATA.length;i++){
        if(this.TREE_DATA[i].isShown == true){
          this.showFullGpx(this.TREE_DATA[i], false)
        }
      }
    }
  }

  showInMap(obj:any, type:string){
    
    //console.log(obj)
    switch(type) { 
      case "wtp": { 
        this.loadGPXService.showWpt(obj)
         break; 
      } 
      case "rte": { 
        this.loadGPXService.showRte(obj)
         break; 
      } 
      case "trk": { 
        this.loadGPXService.showTrk(obj)
        break; 
     } 
     case "trkseg": { 
        this.loadGPXService.showTrkseg(obj)
        break; 
   } 
     
   } 
  }
  addWtp(arr:Array<number>){
    let newObj
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].selected == true){
        
        class Waypoint{
          $:any 
          name: any
          constructor(lonlat:any, name:any){
            this.$ = lonlat
            this.name = name
          }
        }
        Waypoint.prototype.constructor = Waypoint;
        newObj = new Waypoint({lat:arr[0], lon:arr[1]},"custom WTP" + this.TREE_DATA[i].children![1]?.children?.length);
        console.log(newObj)
        
        this.TREE_DATA[i].children![1]?.children?.push({name:"custom WTP" + this.TREE_DATA[i].children![1]?.children?.length, type:"wtp", obj: newObj})
        
      }
    }
    this.refresh()
    this.loadGPXService.setNewObj(newObj)
  }
  addTrk(arr:Array<any>){
    let newObj
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].selected == true){
        console.log(this.TREE_DATA)
        
        
        
        let myWtpArr: Array<any> = []
        for(let j = 0; j<arr.length;j++){
          myWtpArr.push({$: {lat: arr[j][0], lon:  arr[j][1]}})
        }
        console.log(myWtpArr)
       
        newObj = {trkpt: myWtpArr} 
        this.TREE_DATA[i].children![3]?.children?.push({name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, type: "trk",
         obj:{name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, trkseg:[{trkpt: myWtpArr}]},
         children:[{name: 'custom TrkSeg', type: "trkseg", obj: newObj }]})

        
         /*console.log({name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, type: "trk",
         obj:{name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, trkseg:[{trkpt: myWtpArr}]},
         children:[{name: 'custom TrkSeg', type: "trkseg", obj:{trkpt: myWtpArr} }]})*/
      }
    }
    this.refresh()
    this.loadGPXService.setNewObj(newObj)
  }

  addRte(arr:Array<any>){
    let newObj
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].selected == true){
        console.log(this.TREE_DATA)
        
        
        
        let myWtpArr: Array<any> = []
        for(let j = 0; j<arr.length;j++){
          myWtpArr.push({$: {lat: arr[j][0], lon:  arr[j][1]}})
        }
        console.log(myWtpArr)
       
        newObj = {name:"custom Rte" + this.TREE_DATA[i].children![2]?.children?.length, rtept: myWtpArr}
        this.TREE_DATA[i].children![2]?.children?.push({name:"custom Rte" + this.TREE_DATA[i].children![2]?.children?.length, type: "rte",
         obj:newObj})

        
         /*console.log({name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, type: "trk",
         obj:{name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, trkseg:[{trkpt: myWtpArr}]},
         children:[{name: 'custom TrkSeg', type: "trkseg", obj:{trkpt: myWtpArr} }]})*/
      }
    }
    this.refresh()
    this.loadGPXService.setNewObj(newObj)
  }
  showHideGpx(node:GpxNode){
    if(node.isShown == false){
      this.showFullGpx(node, true);
      node.isShown = true
    }else{
      this.loadGPXService.hideGpx(node);
      node.isShown = false
      node.selected = false
    }
  }

  splitTrackSeg(data:any){
    if(data!=null){
      console.log(data)
      for(let i = 0; i<this.TREE_DATA.length;i++){
        for(let j = 0; j<this.TREE_DATA[i].children![3]?.children!.length;j++){
          for(let k = 0; k < this.TREE_DATA[i].children![3]?.children![j].children!.length; k++){
            if(data.obj === this.TREE_DATA[i].children![3]?.children![j].children![k].obj){
          
              let newTrkSeq = JSON.parse(JSON.stringify(data.obj))
              newTrkSeq.trkpt = this.TREE_DATA[i].children![3]?.children![j].children![k].obj.trkpt.splice(0,data.index)
              console.log(this.TREE_DATA[i].children![3]?.children![j].children![k].obj.trkpt.length, newTrkSeq.trkpt.length)

              newTrkSeq.trkpt.push(this.TREE_DATA[i].children![3]?.children![j].children![k].obj.trkpt[0])

              this.TREE_DATA[i].children![3]?.children![j].children?.push({ name:"splitedSegment", obj:newTrkSeq, type:"trkseg"})

              //this.TREE_DATA[i].children![3]?.children![j].obj.trkseg[k].trkpt.splice(0,data.index)
              this.TREE_DATA[i].children![3]?.children![j].obj.trkseg.push({ trkpt:newTrkSeq.trkpt})
              console.log(this.TREE_DATA[i].children![3]?.children![j].obj.trkseg, this.TREE_DATA[i].children![3]?.children![j].children)
              break
            }
          }
        }
      }
      this.refreshAllVisibleGpx(true)
    }
  }

  splitRoute(data:any){
    if(data!=null){
      

      for(let i = 0; i<this.TREE_DATA.length;i++){
        for(let j = 0; j<this.TREE_DATA[i].children![2]?.children!.length;j++){
          console.log( this.TREE_DATA[i].children![2]?.children![j])
          if(data.obj === this.TREE_DATA[i].children![2]?.children![j].obj){          
            let newRoute = JSON.parse(JSON.stringify(data.obj))
            newRoute.rtept = this.TREE_DATA[i].children![2]?.children![j].obj.rtept.splice(0, data.index)
              newRoute.rtept.push(this.TREE_DATA[i].children![2]?.children![j].obj.rtept[0])
              this.TREE_DATA[i].children![2]?.children?.push({ name:"splitedRte", obj:newRoute, type:"rte"})     
              console.log(this.TREE_DATA)
              break
          }
        }
      }
      this.refresh()
      this.refreshAllVisibleGpx(true)
    }
  }

  gpxIsSelected(index:any){
    
    if(index == 1){
      
      for(let i =0; i<this.TREE_DATA.length;i++){
        if(this.TREE_DATA[i].selected == true){
          this.loadGPXService.setFlagIsSelected(true)  
          return
      }else{
        this.loadGPXService.setFlagIsSelected(false)
      }
    }
    }
  }

  gpxDataArr(index:any){
    
    if(index == 1){
      let arr :Array<any> = []
      for(let i =0; i<this.TREE_DATA.length;i++){
       
        arr.push({name: this.TREE_DATA[i].name, id: this.TREE_DATA[i].id, parsed:this.TREE_DATA[i].parsed})
      }
      this.loadGPXService.setTreeDataArr(arr)
    }
  }

  addCopyedWtp(data:any){
    let newObj
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].id == data.id){
        this.TREE_DATA[i].children![1]?.children?.push({name:data.obj.name, type:"wtp", obj: data.obj})
        
      }
    }
    this.refresh()
  }

  addCopyedTrk(data:any){
    let trkData
    for(let i = 0; i<this.TREE_DATA.length;i++){
      for(let j = 0; j<this.TREE_DATA[i].children![3]?.children!.length;j++){
        for(let k = 0; k < this.TREE_DATA[i].children![3]?.children![j].children!.length; k++){
          if(data.obj === this.TREE_DATA[i].children![3]?.children![j].children![k].obj){
        
          trkData = this.TREE_DATA[i].children![3]?.children![j]
          //console.log("trkData", trkData, data)
          }
        }
      }
    }
   
    let newObj
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].id == data.id){
       /* this.TREE_DATA[i].children![3]?.children?.push({name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, type: "trk",
        obj:{name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, trkseg:[{trkpt: data.obj.trkpt}]},
        children:[{name: 'custom TrkSeg', type: "trkseg", obj: data.obj }]})
        */
        this.TREE_DATA[i].children![3]?.children?.push(trkData)
      }
    }
    this.refresh()
  }

  addCopyedTrkseg(data:any){
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].id == data.id){
        this.TREE_DATA[i].children![3]?.children?.push({name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, type: "trk",
        obj:{name:"custom Trk" + this.TREE_DATA[i].children![3]?.children?.length, trkseg:[{trkpt: data.obj.trkpt}]},
        children:[{name: 'custom TrkSeg', type: "trkseg", obj: data.obj }]})
      }
    }
    this.refresh()
  }

  addCopyedRte(data:any){
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].id == data.id){
        this.TREE_DATA[i].children![2]?.children?.push({name:data.obj.name , type: "rte",obj:data.obj})
      }
    }
    this.refresh()
  }


  async  parseWholeFile(index: any){
    await this.loadGPXService.addToTree(index)
    
  }

  returnNodebyID(id: any): any{
    for(let i = 0; i<this.TREE_DATA.length;i++){
      if(this.TREE_DATA[i].id == id){
        return this.TREE_DATA[i]
      }
    }
  }

}


