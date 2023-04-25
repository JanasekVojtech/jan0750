import { Component, OnInit , ViewChild, ElementRef } from '@angular/core';
import { LoadGPXService} from './load_gpx/load-gpx.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  @ViewChild('sidenav') sidenav: MatSidenav;
  public routingSelect:any = "off"
 

  toggleSidenav() {
    this.sidenav.toggle();
  }
  title = 'indexdb';

  

  constructor(public LocalStorage:LoadGPXService){
    
  }

 
add(event: any): void{

  let fileLoaded = event.target.files[0];
  if (fileLoaded.files === null) {
    alert('oops');
  } else {
    this.LocalStorage.add(fileLoaded);
  }
}
newGpxFile(){
  this.LocalStorage.newGpxFile()
}


ngOnInit(): void { 
  this.LocalStorage.printAll();
}



}